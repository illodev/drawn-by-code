// pier-pressure · Kit, 11: the first one down any ramp. Lime hair in two stiff bunches, a
// plaster across the nose, a gap in her grin, a hooped tee three sizes too big, board shorts
// to the knee, yellow high-tops.
(() => {
    const T = SkateToon, C = T.COL, { dot, star, plaster, lock, HAIR, SKIN } = Cast;
    const { add, sub, mul, mix, unit } = SkateKid;
    const HAIR_D = '#86b82a';
    const RED = C.red, TEAL = '#17a3a0';

    const kit = {
        seed: 'kit', skin: SKIN,
        head: { w: 47, h: 35, slide: 0.2, pts: [[-16, -16.5], [4, -18], [18.5, -15], [23.8, -4], [22.6, 7.4], [15, 15.6], [2, 18], [-12, 16], [-21, 9], [-23.6, -3]] },
        eye: { x: 1, y: -3.4, r: [6.9, 6.3], gap: 0.5, pupil: 0.19, lash: true, brow: true, tall: 1.1 },
        nose: { x: 1.5, y: 6.6, kind: 'u', size: 2.3 },
        mouth: { x: 1.5, y: 11.2, w: 21, gap: true },
        ear: { y: 2, r: 4.4 },
        top: {
            color: C.white, sleeveColor: C.white, collarColor: RED, sleeve: 10, sleeveW: 13, bw: 16, hem: 4, collar: 'round',
            print: (g, K, B) => {
                // red hoops that sag with the cloth
                for (let i = 0; i < 6; i++) {
                    const y = -B.t + 4.6 + i * 4.9, sag = (x) => 1.5 * (1 - Math.pow(x / B.bw, 2)) + 0.3 * Math.sin(x * 0.4 + i);
                    const xs = [-1.15, -0.6, 0, 0.6, 1.15].map((k) => k * B.bw);
                    T.shape(g, [...xs.map((x) => [B.hx(x) * (0.4 + i * 0.12), y + sag(x)]), ...xs.reverse().map((x) => [B.hx(x) * (0.4 + i * 0.12), y + 2.5 + sag(x)])].map((p, j) => [p[0] + [-1.15, -0.6, 0, 0.6, 1.15, 1.15, 0.6, 0, -0.6, -1.15][j] * B.bw * (1 - (0.4 + i * 0.12)) + 0, p[1], j === 0 || j === 4 || j === 5 || j === 9 ? 1 : 0]), { fill: RED, w: K.fine * 0.8, seed: 'kit-hoop' + i });
                }
            },
            sleevePrint: (g, K, at, L, W) => {
                for (let i = 0; i < 3; i++) {
                    const a = 1.2 + i * 3.6;
                    T.shape(g, [[...at(a, W), 1], [...at(a + 2, W), 1], at(a + 2.5, 0), [...at(a + 2, -W), 1], [...at(a, -W), 1], at(a + 0.5, 0)], { fill: RED, w: K.fine * 0.8, seed: 'kit-sh' + i + at(0, 0)[0].toFixed(0) });
                }
            },
            draw: (g, K, B) => {
                // a star patch on the chest
                T.shape(g, star(7.4, -B.t + 10.6, 3.5), { fill: C.roadLine, w: K.fine, seed: 'kit-star' });
            },
        },
        bottom: {
            kind: 'shorts', color: TEAL, len: 1.14, wide: [13, 15.5], band: C.white,
            draw: (g, K, hems) => {
                const { J, S } = K;
                // a drawstring, and a white stripe down the outside of each leg
                T.line(g, [[J.hipC[0] - 1.4, J.hipC[1] + 0.6], [J.hipC[0] - 2.6, J.hipC[1] + 5.4]], { w: K.fine, seed: 'kit-ds1', color: C.white });
                T.line(g, [[J.hipC[0] + 1, J.hipC[1] + 0.6], [J.hipC[0] + 1.8, J.hipC[1] + 6.2]], { w: K.fine, seed: 'kit-ds2', color: C.white });
                hems.forEach(([e, u, d, hj], i) => {
                    const n = [-u[1], u[0]], s = i ? -1 : 1, off = mul(n, s * d * 0.33);
                    T.line(g, [add(add(hj, off), [0, 1]), add(add(e, off), mul(u, -3.4))], { w: K.fine * 1.5, seed: 'kit-stripe' + i, color: C.white, taper: false, cap: 'butt' });
                });
            },
        },
        socks: { color: C.white, up: 0.5, stripes: [RED, RED] },
        shoes: { upper: '#ffd23c', sole: C.white, stripe: RED, tongue: C.white, high: true, cap: C.white },
        wrist: [C.magenta, C.roadLine],
        hairBack: (g, K, H) => {
            // two stiff bunches: each a tuft of blades fanning out of its bobble
            for (const s of [-1, 1]) {
                const o = s < 0 ? [-1.6, 0.8] : [0, 0];
                const m = (pts) => pts.map(([x, y, c]) => [s * (14 + (x - 14) * 0.9) + o[0], -14 + (y + 14) * 0.9 + o[1], c]);
                T.shape(g, m([[9, -13, 1], [10.4, -24], [13.6, -35.4, 1], [17.4, -25.4, 1], [23.4, -31.6], [29.4, -36.6, 1], [25.4, -24.4, 1], [31.6, -25.6], [38.4, -24.6, 1], [29.4, -18, 1], [33.4, -14.6], [37, -10.4, 1], [25, -10.6], [17, -9.4, 1]]), { fill: HAIR, w: K.w, seed: 'kit-bunch' + s });
                T.line(g, m([[15, -17.4], [15.6, -22.6], [14.6, -27.4]]), { w: K.fine, seed: 'kit-bl0' + s });
                T.line(g, m([[19, -17.6], [23, -22.6], [25.6, -28]]), { w: K.fine, seed: 'kit-bl1' + s });
                T.line(g, m([[22, -15], [27.6, -18], [31.4, -21]]), { w: K.fine, seed: 'kit-bl2' + s });
            }
        },
        hairFront: (g, K, H) => {
            const f = H.fx * 0.45;
            // a cap of hair whose fringe hangs in pointed locks, swept a little to one side
            T.shape(g, [
                [24, -4.6, 1], [21.4, -9.4], [19.6 + f, -4.4, 1], [15 + f, -12.4, 1], [12.4 + f, -10], [10.6 + f, -5.2, 1], [6 + f, -13, 1], [3.4 + f, -10.4], [1.4 + f, -4.6, 1],
                [-3.4 + f, -13, 1], [-6.4 + f, -10.2], [-8.4 + f, -5, 1], [-13 + f, -12.6, 1], [-16 + f, -9.6], [-17.4 + f, -5.4, 1], [-20.6, -10.4, 1], [-23.6, -3.6, 1],
                [-22, -11], [-16.4, -17.6], [4, -19.2], [18.6, -16], [23.6, -10],
            ], { fill: HAIR, w: K.w, seed: 'kit-cap' });
            T.line(g, [[-9.4, -18], [-9, -15.4], [-10, -13.4]], { w: K.fine, seed: 'kit-part' });
            T.line(g, [[2, -18.8], [3.4, -15.6], [3, -13.6]], { w: K.fine, seed: 'kit-part2' });
            T.line(g, [[10.6, -17.6], [11.6, -15], [11.4, -13]], { w: K.fine, seed: 'kit-part3' });
            // bobbles where the bunches start
            for (const s of [-1, 1]) {
                const x = s * 14.6 - (s < 0 ? 1.6 : 0), y = -15.4 + (s < 0 ? 0.8 : 0);
                T.shape(g, T.ellipse(x, y, 3.2, 2.9, s * 0.5, 10), { fill: C.magenta, w: K.w, seed: 'kit-bob' + s });
                T.line(g, [[x - 1.2, y - 1.3], [x + 0.4, y - 1.7]], { w: K.fine * 0.8, seed: 'kit-bobl' + s, color: C.white });
            }
            // a stud in the ear that shows
            if (H.turn < 0.6) dot(g, -25.6 - H.turn * 3, 5.4, K.fine * 0.5, C.roadLine);
        },
        face: (g, K, H) => plaster(g, K, kit.nose.x + H.fx * 1.25, 4.4, -0.16, 4.4, 'kit-plaster'),
    };
    Cast.add('kit', kit, 1);
})();
