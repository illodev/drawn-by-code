// pier-pressure · Aunt Dot: surfed the big ones once, runs the chip hut now and lets the kids
// get on with it. A square jaw, a sun visor, a bun with a pencil through it, an apron with the
// hut's fish, flip-flops, an anchor on her forearm.
(() => {
    const T = SkateToon, C = T.COL, { dot, turned } = Cast;
    const { add, sub, mul, mix, unit } = SkateKid;
    const HAIRC = '#f1dfa0', VISOR = '#17a3a0', VISOR_L = '#1cc0bb', CREAM = '#fff3d6', TEE = '#f26b5b';
    // a bare foot in a flip-flop, pointing to +x like the kit's boot
    const flipflop = (g, K, sh, flip, key) => {
        const z = K.S.ankle / 11, w = K.w;
        const p = (pts) => pts.map(([x, y, c]) => [(flip ? -x : x) * z, y * z, c]);
        const toes = [[18.4, 6.6, 2.4], [21.8, 7.2, 2.1], [24.4, 8, 1.8]].map(([x, y, r]) => T.path(p(T.ellipse(x, y, r, r * 0.9, 0, 8)), true));
        T.skin(g, [T.path(p([[-4.6, -4, 1], [3.6, -4, 1], [8, 0.6], [15, 3.6], [19.6, 6.4], [19, 9, 1], [5, 9], [-5.6, 8.8, 1], [-6.6, 2]]), true), ...toes], { fill: K.S.skin, w, seed: key + 'f' });
        T.line(g, p([[-3.6, 4.6], [-2.4, 6.4], [-0.8, 6.8]]), { w: K.fine, seed: key + 'an' });
        T.shape(g, p([[-7.4, 8.6, 1], [8, 9], [26.8, 8.8, 1], [27.6, 10.4], [26, 11.2, 1], [8, 11.4], [-7, 11.2, 1]]), { fill: sh.sole, w, seed: key + 's' });
        // the strap, over the foot
        T.line(g, p([[4.6, 8.6], [12, 3], [19.6, 7.6]]), { w: w * 2.4, seed: key + 'v0', taper: false });
        T.line(g, p([[4.6, 8.6], [12, 3], [19.6, 7.6]]), { w: w * 1.2, seed: key + 'v0', color: sh.upper, taper: false });
    };
    const spec = {
        seed: 'dot', skin: '#e58a45',
        leg: 50, torso: 37, shoulder: 15.5, hipW: 9.5, neck: 6, neckD: 6.6, upper: 23, fore: 21, hand: 15.5, armD: [6.2, 5], legD: [6.8, 5.2], stance: 15, ankle: 9.4,
        head: {
            w: 44, h: 47, slide: 0.2,
            pts: [[-14, -22], [9, -23], [19, -17], [21.5, 0], [22, 13], [17, 21.5], [6, 24], [-8, 24], [-18, 21], [-21.5, 12], [-21, -3], [-19, -15]],
            pts34: [[-16.5, -22], [6, -23.6], [16, -18.6], [19, -2], [21.6, 11], [19, 21], [9, 24.6], [-5, 24.6], [-17, 21.6], [-22, 12], [-23.6, -3], [-22, -15]],
        },
        eye: { x: 0, y: -5, r: [5.7, 5.3], gap: 1.6, pupil: 0.24, brow: true, browW: 1.6, tall: 1.04 },
        nose: { x: 0, y: 4.4, kind: 'big', size: 5.2 },
        mouth: { x: 0, y: 15.4, w: 21 },
        ear: { y: 1, r: 4.8 },
        top: { color: TEE, sleeve: 6.5, sleeveW: 11.5, bw: 20, hem: 0, neckW: 6, collar: null, cuff: '#c94a3d' },
        bottom: { kind: 'shorts', color: '#5d7f9c', len: 1.02, wide: [17, 18.5], band: '#4a6a86' },
        shoes: { upper: C.magenta, sole: VISOR },
        shoe: flipflop,
        hairBack: (g, K, H) => {
            // a bun, high and to one side, a pencil through it
            T.shape(g, [[0, -23], [1.6, -30.4], [8, -35.6], [15, -33], [19.6, -27], [17, -21.4], [6, -20]], { fill: HAIRC, w: K.w, seed: 'dot-bun' });
            T.line(g, [[5, -30.6], [9, -28], [14.4, -29.6]], { w: K.fine, seed: 'dot-bun1' });
            T.line(g, [[4.6, -26.6], [9.4, -24.6]], { w: K.fine, seed: 'dot-bun2' });
            T.shape(g, [[2.4, -24.4, 1], [3.6, -25.8, 1], [22.6, -39, 1], [24.4, -40.6, 1], [23.6, -38, 1]], { fill: C.roadLine, w: K.fine, seed: 'dot-pin' });
        },
        hairFront: (g, K, H) => {
            // hair swept back above the visor's band, a wisp at each temple
            const a = H.turn, tn = (pts) => turned(pts, a, 2.6, 0.13);
            T.shape(g, tn([[-20.4, -13.6, 1], [-18.6, -19.6], [-14, -23.4], [9, -24.4], [19.4, -18], [20.8, -13.6, 1], [0, -12.4]]), { fill: HAIRC, w: K.w, seed: 'dot-hair' });
            for (const [x, l] of [[-10, 3.4], [-3, 4.2], [5, 3.8], [12, 3]]) T.line(g, [[x, -23.6 + Math.abs(x) * 0.08], [x + 0.8, -23.6 + l]], { w: K.fine, seed: 'dot-hl' + x });
            for (const s of a > 0.3 ? [-1] : [-1, 1]) T.shape(g, tn([[s * 20.8, -12.4, 1], [s * 23, -8], [s * 21.6, -1, 1], [s * 19.4, -8]]), { fill: HAIRC, w: K.fine, seed: 'dot-wisp' + s });
            // the visor: a band round the head and a brim towards us
            T.shape(g, tn([[-21.6, -16.4, 1], [0, -14.6], [21.6, -16.4, 1], [21.4, -11.6, 1], [0, -9.8], [-21.4, -11.6, 1]]), { fill: VISOR, w: K.w, seed: 'dot-band' });
            const f = H.fx * 0.9;
            T.shape(g, [[-17 + f, -12.2, 1], [-21.6 + f, -8.4], [-12 + f, -5], [2 + f, -4.2], [15 + f, -5.4], [22.6 + f, -9], [17 + f, -12.2, 1], [0 + f, -10.2]], { fill: VISOR_L, w: K.w, seed: 'dot-brim' });
            T.line(g, [[-12 + f, -7.4], [2 + f, -6.6], [14 + f, -7.6]], { w: K.fine, seed: 'dot-brimst' });
            // gold hoops
            T.line(g, T.ellipse(-23.4 + a * 22 * 0.34 + (a > 0.3 ? 2 : 0), 9 + a, 1.9, 2.7, 0, 8), { w: K.fine * 1.1, seed: 'dot-hoop0', closed: true, color: '#e0a800' });
            if (a < 0.25) T.line(g, T.ellipse(23.4 - a * 12, 8.6, 1.9, 2.7, 0, 8), { w: K.fine * 1.1, seed: 'dot-hoop1', closed: true, color: '#e0a800' });
        },
        face: (g, K, H) => {
            // laugh lines, crow's feet and a strong chin
            const x = H.fx;
            T.line(g, [[-9.6 + x, 6.4], [-11.6 + x, 10.6], [-11 + x, 14]], { w: K.fine, seed: 'dot-ll0' });
            T.line(g, [[9.6 + x, 6.4], [11.6 + x, 10.6], [11 + x, 14]], { w: K.fine, seed: 'dot-ll1' });
            T.line(g, [[-2.4 + x, 20.6], [0.4 + x, 21.4], [3 + x, 20.4]], { w: K.fine, seed: 'dot-chin' });
            T.line(g, [[-14.6 + x * 0.6, -2], [-17, -0.6]], { w: K.fine, seed: 'dot-crow0' });
            T.line(g, [[14.6 + x * 0.6, -2], [17, -0.6]], { w: K.fine, seed: 'dot-crow1' });
        },
        over: (g, K) => {
            // the apron: neck strap, bib, a pocket with her fish slice, the hut's fish, grease
            const { J, S } = K, t = S.torso;
            g.save();
            g.translate(J.hipC[0], J.hipC[1]);
            g.rotate(K.P.lean);
            for (const s of [-1, 1]) {
                T.line(g, [[s * 9, -t + 10], [s * 5.6, -t + 0.4]], { w: K.w * 2.6, seed: 'dot-ns' + s, taper: false });
                T.line(g, [[s * 9, -t + 10], [s * 5.6, -t + 0.4]], { w: K.w * 1.5, seed: 'dot-ns' + s, color: CREAM, taper: false });
            }
            T.shape(g, [[-10.6, -t + 9.4, 1], [10.6, -t + 9.4, 1], [12.4, -t + 18], [19.6, -8, 1], [21, 20, 1], [0, 22], [-21, 20, 1], [-19.6, -8, 1], [-12.4, -t + 18]], { fill: CREAM, w: K.w, seed: 'dot-apron' });
            T.line(g, [[-19.4, -7.4], [0, -6], [19.4, -7.4]], { w: K.fine, seed: 'dot-tie' });
            // the fish
            T.shape(g, [[-8, -t + 17.6], [-1.4, -t + 14], [5.6, -t + 17.2, 1], [10.4, -t + 13.8, 1], [9.2, -t + 18], [10.6, -t + 22.4, 1], [5.6, -t + 19, 1], [-1.4, -t + 22]], { fill: VISOR_L, w: K.fine, seed: 'dot-fish' });
            dot(g, -4.6, -t + 17, 0.65, C.ink);
            T.line(g, [[-1.4, -t + 16], [-0.2, -t + 18], [-1.4, -t + 20]], { w: K.fine * 0.7, seed: 'dot-gill' });
            // the fish slice, in the pocket
            T.shape(g, [[3.6, 5, 1], [6.8, 5, 1], [7.6, -7.4, 1], [12, -8.6, 1], [13, -20, 1], [0.6, -20.4, 1], [0, -9.4, 1], [3.8, -7.6, 1]], { fill: C.grey, w: K.fine, seed: 'dot-slice' });
            for (let i = 0; i < 3; i++) T.line(g, [[3.4 + i * 3.2, -18.2], [3.6 + i * 3.2, -11.2]], { w: K.fine, seed: 'dot-slot' + i });
            T.shape(g, [[-4.6, 1.4, 1], [15.4, 0.8, 1], [15, 13.6], [5.4, 15.2], [-4.2, 13.8]], { fill: CREAM, w: K.w, seed: 'dot-pocket' });
            T.line(g, [[-3.8, 3.6], [14.8, 3]], { w: K.fine * 0.7, seed: 'dot-pst' });
            // grease
            for (const [x, y, r] of [[-12.4, 7.4, 1.7], [-14.6, 11, 1], [-8, -2.4, 0.9], [10.4, 18, 1.2], [-6, 16, 0.7]]) dot(g, x, y, r, '#f0cf8a');
            g.restore();
        },
        front: (g, K) => {
            // an anchor on her forearm
            const { J } = K;
            const q = mix(J.elbow[1], J.wrist[1], 0.48), u = unit(sub(J.wrist[1], J.elbow[1])), a = Math.atan2(u[1], u[0]) - Math.PI / 2;
            g.save();
            g.translate(q[0], q[1]);
            g.rotate(a);
            const ink = C.navy, o = { w: K.fine * 0.75, color: ink, amp: 0 };
            T.line(g, [[0, -2.2], [0, 2.4]], { ...o, seed: 'dot-an1' });
            T.line(g, [[-1.3, -1.2], [1.3, -1.2]], { ...o, seed: 'dot-an2' });
            T.line(g, [[-1.9, 0.8], [0, 2.6], [1.9, 0.8]], { ...o, seed: 'dot-an3' });
            g.restore();
        },
    };
    Cast.add('dot', spec, 1);
})();
