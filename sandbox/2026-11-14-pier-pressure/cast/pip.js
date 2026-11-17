// pier-pressure · Pip, 8: Kit's little sister, better than all of them and not bothered. A
// helmet two sizes too big covered in stickers, two braids, a missing tooth, dungarees with
// one strap undone.
(() => {
    const T = SkateToon, C = T.COL, { dot, star, HAIR, SKIN, turned } = Cast;
    const DENIM = C.navy, DENIM_L = '#1a66b3';
    const pip = {
        seed: 'pip', skin: SKIN,
        leg: 23, torso: 23, shoulder: 9.6, hipW: 6.8, upper: 12, fore: 11.5, hand: 12, armD: [3.6, 3], legD: [4.2, 3.5], neck: 4, stance: 10.5, ankle: 8,
        head: {
            w: 45, h: 37, slide: 0.21,
            pts: [[-15, -17.5], [3, -18.5], [17, -15], [22.5, -2], [20.4, 10.4], [10, 17.6], [-6, 18.5], [-19, 12], [-22.5, -1]],
            pts34: [[-17.5, -17.5], [0.5, -19], [14, -16], [19.6, -4], [20, 8.6], [12.6, 17], [-2.6, 19], [-19, 13], [-24.5, -1]],
        },
        eye: { x: 0, y: 2.6, r: [7.2, 6.7], gap: 0.4, pupil: 0.21, lash: true, tall: 1.08 },
        nose: { x: 0, y: 9.6, kind: 'c', size: 1.9 },
        mouth: { x: 0, y: 13.4, w: 15.5, gap: true, gapAt: 2 },
        ear: { y: 3, r: 0 },
        freckles: [[-12.6, 9], [-15, 10.6], [-11.6, 11.6], [12, 9.4], [14.6, 11], [11, 12]],
        top: { color: C.yellow, sleeve: 9, sleeveW: 12.5, bw: 16, hem: 1, collar: 'round', collarColor: '#f0c63c', cuff: '#f0c63c' },
        bottom: {
            kind: 'shorts', color: DENIM, len: 1.1, wide: [14.5, 16.5],
            draw: (g, K, hems) => {
                // turn-ups, stitched
                hems.forEach(([e, u, d], i) => T.line(g, [[e[0] - d / 2 + 0.6, e[1] - 3.6], [e[0], e[1] - 2.8], [e[0] + d / 2 - 0.6, e[1] - 3.6]], { w: K.fine * 0.8, seed: 'pip-tu' + i, color: '#f0c63c', taper: false }));
            },
        },
        shoes: { upper: C.red, sole: C.white, stripe: DENIM, tongue: C.red, velcro: C.white, cap: C.white },
        socks: { color: C.white, up: 0.4, stripes: [C.magenta] },
        over: (g, K) => {
            // dungarees: a bib with a pocket, one strap buttoned, the other hanging
            const { J, S } = K, t = S.torso;
            g.save();
            g.translate(J.hipC[0], J.hipC[1]);
            g.rotate(K.P.lean);
            g.translate(K.P.turn * 2.6, 0);
            T.shape(g, [[-15.6, 2.6, 1], [-15.2, -5, 1], [-9.6, -5.6, 1], [-9, -t + 6.4, 1], [9, -t + 6.4, 1], [9.6, -5.6, 1], [15.2, -5, 1], [15.6, 2.6, 1], [0, 3.6]], { fill: DENIM, w: K.w, seed: 'pip-bib' });
            T.shape(g, [[-4, -t + 10.4, 1], [4, -t + 10.4, 1], [4.2, -t + 15.4], [0, -t + 16.6], [-4.2, -t + 15.4]], { fill: DENIM_L, w: K.fine, seed: 'pip-pocket' });
            T.line(g, [[-7.6, -t + 7.8], [7.6, -t + 7.8]], { w: K.fine * 0.7, seed: 'pip-st1', color: '#f0c63c', taper: false });
            T.line(g, [[-11.6, -4.6], [0, -4], [11.6, -4.6]], { w: K.fine * 0.7, seed: 'pip-waist', color: '#f0c63c', taper: false });
            // the strap that is done up, over her right shoulder
            T.shape(g, [[-8, -t + 6.6, 1], [-4.8, -t + 6.4, 1], [-6.2, -t - 0.6, 1], [-9.6, -t + 0.6, 1]], { fill: DENIM, w: K.w, seed: 'pip-strap0' });
            T.shape(g, T.ellipse(-6, -t + 8, 1.3, 1.3, 0, 8), { fill: C.roadLine, w: K.fine * 0.7, seed: 'pip-btn0' });
            T.shape(g, T.ellipse(6, -t + 8, 1.3, 1.3, 0, 8), { fill: C.roadLine, w: K.fine * 0.7, seed: 'pip-btn1' });
            // the other one hangs down in front
            T.shape(g, [[4.6, -t + 6.6, 1], [7.8, -t + 6.4, 1], [11.6, -t + 14.4, 1], [9, -t + 15.6, 1]], { fill: DENIM, w: K.w, seed: 'pip-strap1' });
            // a lollipop in the pocket
            T.line(g, [[1.4, -t + 10.6], [2.8, -t + 6.4]], { w: K.fine * 1.2, seed: 'pip-lolly', color: C.white });
            g.restore();
        },
        hairBack: (g, K, H) => {
            // two short braids sticking out under the helmet
            for (const s of [-1, 1]) {
                // the far braid tucks in behind the head as it turns
                const o = s > 0 ? -H.turn * 9 : -H.turn * 2.4;
                for (let k = 2; k >= 0; k--) T.shape(g, T.ellipse(s * (22 + k * 4.6) + o, 9 + k * 3.2, 3.7 - k * 0.5, 3 - k * 0.4, s * 0.6, 10), { fill: HAIR, w: K.w, seed: 'pip-br' + s + k });
                T.shape(g, T.ellipse(s * 28.4 + o, 13, 1.5, 2.6, s * 0.6 + 1.5, 8), { fill: C.magenta, w: K.fine, seed: 'pip-tie' + s });
                T.shape(g, [[s * 31.6 + o, 14.4, 1], [s * 35.6 + o, 15.4, 1], [s * 34.4 + o, 17.4, 1], [s * 36.4 + o, 19.6, 1], [s * 32.4 + o, 19, 1], [s * 30.6 + o, 16.6, 1]], { fill: HAIR, w: K.fine, seed: 'pip-tuft' + s });
            }
        },
        hairFront: (g, K, H) => {
            // a helmet two sizes too big, covered in stickers
            const a = H.turn, tn = (pts) => turned(pts, a, 2.2, 0.12);
            T.shape(g, tn([[-27.4, -5.4, 1], [-14, -3.2], [0, -2.6], [14, -3.2], [27.4, -5.4, 1], [28.6, -17], [19.6, -29], [0, -33.4], [-19.6, -29], [-28.6, -17]]), { fill: C.magenta, w: K.w, seed: 'pip-helmet' });
            T.shape(g, tn([[-27.4, -5.4, 1], [-14, -3.2], [0, -2.6], [14, -3.2], [27.4, -5.4, 1], [27.8, -8.8, 1], [14, -6.6], [0, -6], [-14, -6.6], [-27.8, -8.8, 1]]), { fill: '#b3006a', w: K.w, seed: 'pip-rim' });
            // the stickers ride round with the shell
            g.save();
            g.translate(H.fx * 0.7, 0);
            for (const [x, a] of [[-7, -0.16], [0, 0], [7, 0.16]]) T.shape(g, T.ellipse(x, -28.4 + Math.abs(x) * 0.12, 1.5, 3.6, a, 10), { fill: '#2a2530', w: K.fine, seed: 'pip-vent' + x });
            // stickers: a star, a bolt, a smiley, a wave on tape, a dot
            T.shape(g, star(-17.4, -17.6, 4.5, 5, -1.2), { fill: C.roadLine, w: K.fine, seed: 'pip-st-star' });
            T.shape(g, [[14.6, -25, 1], [19.6, -24.2, 1], [17.4, -19.4, 1], [20.6, -19, 1], [14.4, -11.6, 1], [15.8, -16.6, 1], [12.8, -17, 1]], { fill: HAIR, w: K.fine, seed: 'pip-st-bolt' });
            T.shape(g, T.ellipse(-3, -15.6, 4.6, 4.4, 0, 12), { fill: C.white, w: K.fine, seed: 'pip-st-smile' });
            dot(g, -4.6, -16.8, 0.6, C.ink);
            dot(g, -1.4, -16.8, 0.6, C.ink);
            T.line(g, [[-5.4, -14.6], [-3, -13], [-0.6, -14.6]], { w: K.fine * 0.7, seed: 'pip-st-sm' });
            T.shape(g, [[5.4, -12.8, 1], [11.8, -13.6, 1], [12, -10.2, 1], [5.6, -9.4, 1]], { fill: '#9fd4ea', w: K.fine, seed: 'pip-st-tape' });
            T.line(g, [[6.6, -11.2], [8, -12.1], [9.2, -11.2], [10.6, -12.1]], { w: K.fine * 0.7, seed: 'pip-st-wave', color: DENIM });
            T.shape(g, T.ellipse(22, -13, 2.3, 2.3, 0, 8), { fill: C.orange, w: K.fine, seed: 'pip-st-dot' });
            // scuffs from a fall
            T.line(g, [[-24.6, -11.6], [-21.6, -12.8]], { w: K.fine * 0.7, seed: 'pip-scuff1', color: C.white });
            T.line(g, [[-24, -10], [-20.8, -11.4]], { w: K.fine * 0.7, seed: 'pip-scuff2', color: C.white });
            g.restore();
        },
        underFace: (g, K, H) => {
            // the chin strap: down each side of the face, a buckle on one
            const a = H.turn, bx = a * 7;
            T.line(g, [[-21.6 + bx, -3], [-21 + bx, 6], [-15.6 + bx * 0.6, 14.6]], { w: K.w * 1.2, seed: 'pip-strapL', color: '#2a2530', taper: false });
            if (a < 0.4) T.line(g, [[21.6 - a * 6, -3], [21 - a * 6, 6], [16 - a * 4, 14.4]], { w: K.w * 1.2, seed: 'pip-strapR', color: '#2a2530', taper: false });
            T.shape(g, [[-22.4 + bx, 6.4, 1], [-19 + bx, 5.6, 1], [-17.8 + bx, 9.2, 1], [-21.2 + bx, 10, 1]], { fill: C.grey, w: K.fine, seed: 'pip-buckle' });
        },
    };
    Cast.add('pip', pip, 0.86);
})();
