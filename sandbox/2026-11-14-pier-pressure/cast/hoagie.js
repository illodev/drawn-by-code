// pier-pressure · Hoagie, 10: films everything on the family camcorder and never gets the
// trick in frame. A head wider than it is tall, a buzz cut with one cowlick, braces, ears
// like jug handles, a Hawaiian shirt, cargo shorts.
(() => {
    const T = SkateToon, C = T.COL, { dot, turned } = Cast;
    const { add, mix } = SkateKid;
    const flower = (g, K, x, y, r, a, key) => {
        g.save();
        g.translate(x, y);
        g.rotate(a);
        for (let i = 0; i < 5; i++) {
            const t = (i / 5) * Math.PI * 2;
            T.shape(g, T.ellipse(Math.cos(t) * r * 0.62, Math.sin(t) * r * 0.62, r * 0.52, r * 0.38, t, 8), { fill: C.white, w: K.fine * 0.6, seed: key + i });
        }
        dot(g, 0, 0, r * 0.26, C.roadLine);
        g.restore();
    };
    const SHIRT = C.orange, HAIRC = '#d9a441';
    const hoagie = {
        seed: 'hoagie', skin: C.skinPale,
        leg: 25, torso: 26, shoulder: 14, hipW: 9.5, armD: [4.7, 3.9], legD: [5.6, 4.6], neck: 4, neckD: 5, stance: 13.5, upper: 13.5, fore: 13, hand: 13.5, ankle: 8.8,
        head: {
            w: 57, h: 33, slide: 0.2,
            pts: [[-21, -14.6], [0, -16.6], [21, -14.6], [28.6, -3], [26, 9.4], [12, 16.4], [-10, 16.6], [-25, 10.4], [-28.6, -2]],
            pts34: [[-24, -14.6], [-3, -17], [17, -15.6], [25, -5], [25.6, 7.6], [15, 16], [-6, 17], [-25.6, 11], [-31, -2]],
        },
        eye: { x: 0, y: -4, r: [5.4, 5], gap: 6.4, pupil: 0.3, brow: true, browW: 1.5, tall: 1.06 },
        nose: { x: 0, y: 3, kind: 'big', size: 3.6, color: '#f9b9a4' },
        mouth: { x: 0, y: 9.4, w: 28, braces: true },
        ear: { y: 0, r: 6, out: 0.4 },
        freckles: [[-15.6, 2.6], [-18.6, 5], [-14, 6.2], [-17.4, 8.4], [15.4, 3], [18.6, 5.4], [13.6, 6.4], [17, 8.6]],
        top: {
            color: SHIRT, sleeve: 11, sleeveW: 17, bw: 24.5, hem: 4.5, neckW: 5, collar: 'v', cuff: '#c8551c',
            print: (g, K, B) => {
                const R = Motion.rng('hoagie-aloha');
                for (const [x, y] of [[-14.5, 6], [11.5, 4.2], [17.5, 15], [-17, 19], [5, 26.6], [-4.4, 13.4], [18, 27], [-10, 28.6], [-21.4, 10.6], [21, 6.4], [-21, 27]]) flower(g, K, x + B.fx, -B.t + y, 3.8 + R() * 0.9, R() * 6, 'hoagie-fl' + x);
                for (const [x, y, a] of [[-7, 5, 0.6], [2, 19.4, 2.4], [-13, 13.4, 1.2], [17, 9.6, -0.7], [-3.6, 23, 0.2], [11.6, 21, 1.9], [-19.6, 21.6, -0.4], [22, 21, 0.9]]) T.shape(g, T.ellipse(x + B.fx, -B.t + y, 2.8, 1, a, 8), { fill: C.khaki, w: K.fine * 0.6, seed: 'hoagie-lf' + x });
            },
            sleevePrint: (g, K, at, L, W) => {
                const [x, y] = at(L * 0.55, 0.6);
                flower(g, K, x, y, 3.6, 0.5, 'hoagie-sfl' + x.toFixed(0));
            },
            draw: (g, K, B) => {
                // an open camp collar and a button placket
                const cx = B.nx;
                for (const s of [-1, 1]) T.shape(g, [[cx + s * 4, -B.t - 0.6, 1], [cx + s * 11, -B.t + 2.2, 1], [cx + s * 4.4, -B.t + 9.4, 1], [cx + s * 0.4, -B.t + 4.4, 1]], { fill: SHIRT, w: K.w, seed: 'hoagie-col' + s });
                T.line(g, [[cx + 0.5, -B.t + 6.4], [B.fx + 0.2 + B.hang, B.hem + 0.6]], { w: K.fine, seed: 'hoagie-plk' });
                for (let i = 0; i < 3; i++) dot(g, cx + (B.fx - cx) * (i / 3) + 2.2 + B.hang * (i / 3), -B.t + 11.6 + i * 6.4, K.fine * 0.42, C.white);
                // a chest pocket
                T.shape(g, [[-16.4 + B.fx, -B.t + 9.4, 1], [-9.6 + B.fx, -B.t + 9, 1], [-9.6 + B.fx, -B.t + 14], [-13 + B.fx, -B.t + 15.6], [-16.4 + B.fx, -B.t + 14.4]], { fill: null, w: K.fine, seed: 'hoagie-pk' });
            },
        },
        bottom: { kind: 'shorts', color: '#8b8f1c', len: 1.12, wide: [18.5, 21],
            draw: (g, K, hems) => {
                // cargo pockets with flaps
                hems.forEach(([e, u, d, hj], i) => {
                    const s = i ? 1 : -1, c = add(e, [s * d * 0.16, -8.4]);
                    T.shape(g, [[c[0] - 3.6, c[1] - 3, 1], [c[0] + 3.6, c[1] - 3, 1], [c[0] + 3.6, c[1] + 3.4, 1], [c[0] - 3.6, c[1] + 3.4, 1]], { fill: '#7b7f14', w: K.fine, seed: 'hoagie-cg' + i });
                    T.line(g, [[c[0] - 3.8, c[1] - 1.2], [c[0], c[1] - 0.4], [c[0] + 3.8, c[1] - 1.2]], { w: K.fine, seed: 'hoagie-cf' + i });
                    dot(g, c[0], c[1] - 1.6, K.fine * 0.4, C.ink);
                });
            },
        },
        shoes: { upper: C.navy, sole: C.white, stripe: C.orange, tongue: C.navy, cap: C.white, lace: C.white },
        socks: { color: C.white, up: 0.4, stripes: [C.navy] },
        hairBack: (g, K, H) => {
            // one cowlick standing up at the crown
            T.shape(g, turned([[-3.4, -15, 1], [-2.4, -21], [1.6, -24.6], [6.4, -23.4], [5.4, -20.4], [2.6, -20.6], [1.6, -18], [3.4, -15, 1]], H.turn).map(([x, y, c]) => [x - H.turn * 4, y, c]), { fill: HAIRC, w: K.w, seed: 'hoagie-cow' });
        },
        hairFront: (g, K, H) => {
            // a buzz cut: a low cap with a peak in the middle and stubble
            const a = H.turn;
            T.shape(g, turned([[-28.2 + a * 3, -5.4 + a * 7, 1], [-22 + a * 5, -9.4 + a * 3, 1], [-8 + H.fx * 0.6, -10.6], [0 + H.fx * 0.8, -7.6, 1], [8 + H.fx * 0.5, -10.6], [20, -10 - a], [28.2, -5.4 - a * 2.6, 1], [26, -11.6 - a], [20.6, -15.6], [0, -17.8], [-20.6, -15.6], [-26, -11.6], [-28.8, -7 + a * 2]], a, 3.4, 0.14), {
                fill: HAIRC, w: K.w, seed: 'hoagie-buzz',
                inside: (gg) => {
                    const R = Motion.rng('hoagie-stubble');
                    for (let i = 0; i < 20; i++) {
                        const x = -23 + (i % 10) * 5 + R() * 2.2, y = -15.6 + Math.floor(i / 10) * 3 + R() * 1.2 + Math.abs(x) * 0.1;
                        T.line(gg, [[x, y], [x + 0.5, y + 1.6]], { w: K.fine * 0.7, seed: 'hoagie-st' + i, amp: 0, color: '#8a5a12' });
                    }
                },
            });
        },
        over: (g, K) => {
            // the family camcorder on a neck strap
            const { J, S } = K, w = K.w, fine = K.fine;
            const c = add(J.tor([0.6 + K.P.turn * 3, -S.torso * 0.4]), K.P.cam ?? [0, 0]);
            for (const s of [-1, 1]) T.line(g, [J.tor([s * 4.4, -S.torso + 0.6]), mix(J.tor([s * 4.4, -S.torso + 0.6]), add(c, [s * 8, -6]), 0.55), add(c, [s * 8, -6])], { w: w * 1.5, seed: 'cam-strap' + s, color: '#2a2530', taper: false });
            g.save();
            g.translate(c[0], c[1]);
            g.rotate(K.P.lean + 0.07);
            g.scale(1.16, 1.16);
            // viewfinder and microphone behind the body
            T.shape(g, [[3.6, -9.8, 1], [10.6, -10.4, 1], [10.8, -5, 1], [3.8, -4.6, 1]], { fill: '#3a4450', w, seed: 'cam-vf' });
            T.shape(g, T.ellipse(11.6, -7.6, 1.6, 2.6, 0, 10), { fill: '#2a2530', w: fine, seed: 'cam-cup' });
            T.shape(g, T.ellipse(-5.4, -8.2, 3, 2.3, -0.2, 10), { fill: '#2a2530', w: fine, seed: 'cam-mic' });
            T.shape(g, [[-9.6, -6.2, 1], [9.2, -6.8, 1], [10, 5.8, 1], [-9.2, 6.6, 1]], { fill: C.grey, w, seed: 'cam-body' });
            // the hand strap on its side, the tape door, the record light
            T.shape(g, [[6.6, -5.6, 1], [9.4, -5.8, 1], [10, 5.2, 1], [7, 5.4, 1]], { fill: '#3a4450', w: fine, seed: 'cam-hs' });
            T.line(g, [[2.6, -5.2], [2.8, 5]], { w: fine, seed: 'cam-door' });
            T.line(g, [[3.8, 1.4], [5.6, 1.3]], { w: fine * 0.8, seed: 'cam-lb1' });
            T.line(g, [[3.8, 3], [5.2, 2.9]], { w: fine * 0.8, seed: 'cam-lb2' });
            dot(g, 4.6, -3.2, 0.95, C.red);
            // the lens: barrel, ring, glass and its gleam
            T.shape(g, T.ellipse(-3.4, 0.4, 5.3, 5.2, 0, 14), { fill: '#3a4450', w, seed: 'cam-barrel' });
            T.shape(g, T.ellipse(-3.4, 0.4, 3.5, 3.4, 0, 12), { fill: C.navy, w: fine, seed: 'cam-glass' });
            T.line(g, [[-5, -0.8], [-3.6, -1.9]], { w: fine * 0.8, seed: 'cam-gl', color: C.white });
            dot(g, -2, 1.8, 0.5, C.white);
            g.restore();
        },
    };
    Cast.add('hoagie', hoagie, 1);
})();
