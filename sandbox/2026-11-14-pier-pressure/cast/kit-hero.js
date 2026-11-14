// pier-pressure · Kit, drawn by hand: one whole drawing of one pose (in the air, after the
// gull), every contour authored and inked in strokes (SkateToon's `hand` mode), instead of a
// puppet assembled from parts. Lanky, as the genre draws its kids; nothing in it is a
// primitive: the eyes are eggs of their own, the teeth a row with a gap, the tee a tube whose
// hoops bow round it, the boots a 3D model in real perspective (cast/boot3d.js).
// Global: Hero.kitJump(g, x, y, s): (x, y) is the drawing's origin (the box runs from about
// −40, −80 to 320, 400), s output units per unit.
(() => {
    const T = SkateToon, C = T.COL, K0 = SkateKid, { star, plaster, dot } = Cast;
    const SKIN = '#cf8440', HAIR = '#a6d93a', RED = C.red, TEAL = '#17a3a0', TEAL_D = '#0d6f6e', YEL = '#ffd23c', WHITE = C.white;

    function kitJump(g, x, y, s) {
        let w = (T.LINE / s) * 1.3, f = (T.LINE_FINE / s) * 1.2;
        const S = (pts, fill, seed, o = {}) => T.shape(g, pts, { fill, w, seed: 'kh-' + seed, hand: true, ...o });
        const L = (pts, seed, o = {}) => T.line(g, pts, { w: f, seed: 'kh-' + seed, hand: true, ...o });
        const BOOT = { upper: YEL, sole: WHITE, stripe: RED, cap: WHITE, high: true };
        g.save();
        g.translate(x, y);
        g.scale(s, s);

        // an arm and its hand in one skin, then a wristband
        const arm = (sh, el, wr, pose, size, side, seed, band, back = false) => {
            const fa = K0.unit(K0.sub(wr, el)), th = Math.atan2(fa[0], -fa[1]);
            const poly = T.ribbon(K0.soft(sh, el, wr, 0.6), 11, 8.4, { step: 0.6 }).map((p) => K0.rot(K0.sub(p, wr), -th));
            g.save();
            g.translate(wr[0], wr[1]);
            g.rotate(th);
            T.hand(g, pose, size, { side, back, fill: SKIN, w, seed: 'kh-' + seed, arm: { poly } });
            S([[-5.6, 4.6, 1], [0, 5.4], [5.6, 4.6, 1], [5.9, 10.4, 1], [0, 11.2], [-5.9, 10.4, 1]], band, seed + 'band', { w: f });
            g.restore();
        };
        // a ring round a sleeve: the hem's curve (a, b, c) moved d towards the shoulder
        const ring = (a, b, c, d, th, dir, seed) => {
            const m = (p, k) => [p[0] + dir[0] * k, p[1] + dir[1] * k];
            const ext = (p, q, k) => [p[0] + (p[0] - q[0]) * k, p[1] + (p[1] - q[1]) * k];
            const A = ext(a, b, 0.4), Cc = ext(c, b, 0.4);
            S([[...m(A, d), 1], m(b, d), [...m(Cc, d), 1], [...m(Cc, d + th), 1], m(b, d + th * 1.1), [...m(A, d + th), 1]], RED, seed, { w: f * 0.8 });
        };

        // 1 · her board, falling away under her
        Cast.board(g, 118, 418, 2.2, 0.16);

        // 2 · the far arm (her left), up after the gull: the shoulder rides up with it
        arm([192, 156], [242, 150], [290, 124], 'open', 44, 'L', 'farm', C.roadLine);
        S([[183, 141, 1], [202, 130], [220, 127, 1], [229, 139], [232, 151], [228, 166, 1], [212, 170], [200, 169], [187, 174, 1]], WHITE, 'fsleeve', {
            inside: () => {
                for (const [i, d] of [4, 16, 28].entries()) ring([220, 127], [232, 150], [228, 166], d, 6, [-0.98, 0.16], 'fsr' + i);
            },
        });
        L([[217, 131], [226, 150], [223, 163]], 'fsleeve-hem');

        // 3 · the trailing leg (her left), hanging behind her, its boot dangling toe-down and
        // seen from its side
        S(T.ribbon(K0.soft([112, 240], [62, 268], [34, 316], 0.62), 12, 9.4, { step: 0.6 }), SKIN, 'fleg', { dense: true });
        S(T.ribbon([[47, 294], [40, 305], [34, 316]], 13.4, 14.4, { step: 0.6, wave: [0.5, 4] }), WHITE, 'fsock', { dense: true });
        for (const [i, k] of [0.16, 0.4].entries()) {
            const q = [47 - 13 * k, 294 + 22 * k];
            L([[q[0] - 6.2, q[1] - 3.6], [q[0] + 6.2, q[1] + 3.6]], 'fsock-s' + i, { color: RED, w: f * 1.8, taper: false, amp: 0.1, cap: 'butt', hand: false });
        }
        Cast.boot3d(g, [34, 316], 80, [0.25, 0.95, 0.25], [0.95, -0.25, -0.1], { ...BOOT, w, fine: f, seed: 'kh-fboot' });

        // 4 · the shorts: baggy, one leg along the trailing thigh, the other towards us with an
        // opening we look into
        S([[92, 226, 1], [82, 230], [72, 238, 1], [70, 249], [76, 260], [88, 271, 1], [99, 268], [107, 265], [114, 267, 1], [121, 279], [139, 288], [162, 284], [175, 270, 1], [181, 252], [180, 234, 1], [134, 244]], TEAL, 'shorts');
        S([[72, 238, 1], [70, 249], [76, 260], [88, 271, 1], [93, 267.4, 1], [82, 257.6], [76.4, 248], [77.6, 235.6, 1]], WHITE, 'shorts-band', { w: f });
        L([[112, 263], [102, 255], [95, 245]], 'shorts-f1');
        L([[110, 268], [101, 266], [93, 259]], 'shorts-f2');
        L([[124, 264], [128, 272], [137, 277]], 'shorts-f3');
        L([[173, 244], [166, 252], [164, 262]], 'shorts-f4');
        L([[92, 233], [88, 246], [95, 259]], 'shorts-seam', { color: WHITE, w: f * 1.5 });
        S([[124, 266], [130, 256], [146, 252], [163, 256], [171, 266], [166, 278], [150, 283], [133, 279]], WHITE, 'open-band');
        S([[129, 267], [134, 259.6], [147, 256.6], [160, 260], [166, 267.4], [162, 275.6], [149, 279], [136, 276]], TEAL_D, 'open-in', { w: f });

        // 5 · the near leg (her right), kicked at the camera: the shin, then the boot from under
        S(T.ribbon([[148, 269], [160, 284], [176, 300]], 12, 11, { step: 0.6 }), SKIN, 'nleg', { dense: true });
        Cast.boot3d(g, [176, 300], 90, [0.5, -0.78, 0.36], [-0.5, -0.16, -0.85], { ...BOOT, w, fine: f, seed: 'kh-nboot', D: 2.4 });

        // 6 · the tee: a long tube hanging from the shoulders, its hoops bowing round it, its hem
        // lifting behind her
        const N = [168, 142], hd = [-0.359, 0.934], n = [0.934, 0.359];
        S([[157, 134, 1], [141, 136], [125, 145, 1], [117, 160], [108, 178], [99, 200], [91, 218], [81, 233, 1], [92, 244], [108, 247], [124, 254], [143, 253], [160, 247], [171, 242], [182, 233, 1], [186, 214], [187, 196], [191, 176], [195, 158, 1], [180, 140, 1], [168, 146]], WHITE, 'tee', {
            inside: () => {
                for (let i = 0; i < 7; i++) {
                    const t = 12 + i * 15.4, c = [N[0] + hd[0] * t, N[1] + hd[1] * t], bow = 6 + i * 0.7, th = 7.4 + (i % 3) * 0.5;
                    const P = (a, b) => [c[0] + n[0] * a + hd[0] * b, c[1] + n[1] * a + hd[1] * b];
                    S([[...P(-66, -3), 1], P(-28, bow * 0.7), P(8, bow), P(38, bow * 0.6), [...P(66, -3), 1], [...P(66, th - 2.4), 1], P(38, bow * 0.6 + th), P(8, bow + th), P(-28, bow * 0.7 + th), [...P(-66, th - 2.4), 1]], RED, 'hoop' + i, { w: f * 0.8 });
                }
            },
        });
        L([[115, 172], [121, 182], [119, 194]], 'tee-f1');
        L([[188, 184], [181, 192], [179, 203]], 'tee-f2');
        L([[94, 228], [108, 236], [128, 244], [146, 243]], 'tee-f3');
        L([[99, 204], [106, 209], [110, 217]], 'tee-f4');
        S(star(161, 185, 11.5, 5, -1.25), C.roadLine, 'tee-star', { w: f });

        // 7 · neck, the collar's rib in front of it
        S(T.ribbon([[166, 147], [175, 133], [185, 119]], 13, 12.4, { step: 0.6 }), SKIN, 'neck', { dense: true });
        S(T.ribbon([[155, 133], [159, 143], [168, 148.6], [177.6, 146], [182.4, 138]], 5.8, 5.8, { step: 0.5 }), RED, 'collar', { dense: true, w: f });
        for (const [i, [cx, cy, a]] of [[157.6, 140.6, -0.5], [163.6, 146.4, -0.15], [172.4, 147.6, 0.2], [179.4, 142.8, 0.6]].entries()) L([[cx + Math.sin(a) * 2.4, cy - 2.4], [cx - Math.sin(a) * 2.4, cy + 2.4]], 'collar-r' + i, { w: f * 0.7, amp: 0, hand: false });

        // 8 · the head, three quarters to the right, thrown back
        const HS = 1.3;
        g.save();
        g.translate(194, 64);
        g.rotate(-0.2);
        g.scale(HS, HS);
        w /= HS;
        f /= HS;
        // a tuft of a bunch: a fat blade of hair from its bobble, two strands along it
        const blade = (bx, by, ang, len, wd, seed, hook = 0.34) => {
            const c = Math.cos(ang), sn = Math.sin(ang), P = (a, b) => [bx + c * a - sn * b, by + sn * a + c * b];
            S([[...P(-2, -wd * 0.42), 1], P(len * 0.3, -wd * 0.6), P(len * 0.66, -wd * 0.46), [...P(len, wd * hook), 1], P(len * 0.72, wd * 0.34), P(len * 0.4, wd * 0.56), [...P(-2, wd * 0.42), 1]], HAIR, seed);
            L([P(len * 0.1, -wd * 0.1), P(len * 0.36, -wd * 0.16), P(len * 0.6, -wd * 0.06)], seed + 'l');
            L([P(len * 0.16, wd * 0.2), P(len * 0.36, wd * 0.24)], seed + 'm');
        };
        // the far bunch, behind the skull
        for (const [i, [a, l, k]] of [[-0.1, 40, 0.5], [-1.52, 42, -0.2], [-0.52, 56, 0.4], [-1.02, 52, 0.1]].entries()) blade(34, -52, a, l, 22, 'fb' + i, k);
        // the skull, a brow, a cheek that bulges, the jaw dropped open
        S([[-50, -26], [-41, -40], [-21, -48], [3, -49.6], [26, -45], [42, -34], [49.6, -19], [50.6, -5], [54, 7], [52.6, 21], [45, 35], [31, 45.6], [12, 50], [-7, 47.4], [-25, 39], [-41, 27], [-53, 11], [-57.6, -8]], SKIN, 'head');
        // the ear, inside the outline, with its stud
        S([[-48, -4], [-41, -12], [-32, -8], [-29.6, 3], [-34, 13], [-42, 14], [-46, 6]], SKIN, 'ear');
        L([[-43.6, -4], [-36.4, -6.6], [-33.6, 1], [-38.6, 5.6]], 'ear-a');
        L([[-39, 0], [-41, 8.4]], 'ear-b');
        dot(g, -38, 12, 1.5, C.roadLine);
        // freckles on the near cheek
        for (const [fx, fy] of [[-23, 4], [-17, 7.6], [-25, 10]]) dot(g, fx, fy, 0.95, '#8a4f1e');
        // the mouth: the dark, the tongue, a row of top teeth with her gap, the lip
        S([[-27, 14, 1], [-13, 13.6], [5, 10.6], [26, 8.6], [46, 10.6, 1], [47.6, 22], [39, 36], [23, 44.4], [5, 43.4], [-11, 36], [-22, 25]], C.mouth, 'mouth', {
            inside: () => {
                g.fillStyle = '#3d0f17';
                g.beginPath();
                g.ellipse(12, 26, 22, 8, -0.06, 0, Math.PI * 2);
                g.fill();
                S([[-7, 48], [-4, 38], [6, 32.6], [18, 31.4], [29, 34.4], [36, 41], [37, 49]], C.tongue, 'tongue', { w: f });
                L([[14, 33.6], [15, 39], [17.4, 44]], 'tongue-l');
                // each tooth its own size, hanging from the lip
                const U = (tx) => (tx < 5 ? 10.6 + ((5 - tx) / 32) * 3.6 : tx < 26 ? 10.6 - ((tx - 5) / 21) * 2 : 8.6 + ((tx - 26) / 20) * 2);
                for (const [i, [a, b, len]] of [[-25, -15.4, 7], [-15.4, -5, 9], [-5, 6.4, 10.4], [13.4, 24.6, 10.6], [24.6, 34.6, 9.4], [34.6, 44, 7.4]].entries()) {
                    S([[a, U(a) - 4, 1], [b, U(b) - 4, 1], [b - 0.4, U(b) + len * 0.72], [(a + b) / 2 + 0.6, U((a + b) / 2) + len], [a + 0.5, U(a) + len * 0.74]], WHITE, 'tooth' + i, { w: f });
                }
            },
        });
        L([[-29.6, 8.4], [-32.6, 13.6], [-29.6, 19.6]], 'cheek-a');
        L([[48, 5.4], [51, 10.4], [48.6, 15.6]], 'cheek-b');
        // the nose, a hook, and its plaster
        T.line(g, [[12, 0], [10.6, 5.6], [13.6, 10], [20, 11], [24.6, 7.6], [24, 2.6]], { w, seed: 'kh-nose', hand: true });
        plaster(g, { fine: f, w }, 18.6, 0, -0.18, 8.8, 'kh-plaster');
        // the eyes: eggs of their own, the near one bigger, the far one out at the head's edge
        const pupil = (cx, cy, r, seed) => S([[cx - r, cy + 0.4], [cx - r * 0.5, cy - r], [cx + r * 0.6, cy - r * 0.9], [cx + r, cy + 0.2], [cx + r * 0.4, cy + r * 1.05], [cx - r * 0.6, cy + r * 0.9]], C.ink, seed, { w: f * 0.5 });
        S([[-25, -19], [-21.6, -32], [-9, -40], [5, -37], [13, -26], [13.4, -12], [6, -1], [-8, 3], [-20, -5]], WHITE, 'eye0', { inside: () => pupil(4.6, -27, 3.9, 'pupil0') });
        S([[16.6, -22], [19.4, -34], [28.6, -39.6], [38.6, -35], [44.4, -23], [43, -10], [36, -1.6], [25.6, -2], [18.4, -10]], WHITE, 'eye1', { inside: () => pupil(36, -27.4, 3.4, 'pupil1') });
        // the cap of hair and its fringe: fat locks swept the way she is going, each its own
        S([
            [53, -15, 1], [51.6, -27], [47, -34], [40, -29, 1], [36, -40], [31.6, -46, 1], [25, -43], [19, -36], [15, -31, 1], [11.6, -41], [5, -48, 1],
            [-3, -43], [-9, -36], [-13.6, -30, 1], [-17, -41], [-25, -46.4, 1], [-33, -39], [-39, -29], [-43, -18, 1], [-45, -27], [-50, -31, 1], [-54, -19], [-56.6, -2, 1],
            [-61.6, -22], [-55, -39], [-45, -50], [-28, -57.6], [-6, -60.6], [16, -59], [35, -51.6], [47, -40],
        ], HAIR, 'cap');
        L([[-22, -58.6], [-20, -52], [-22.6, -47]], 'cap-a');
        L([[2, -60], [5, -53], [4, -48.6]], 'cap-b');
        L([[27, -55.6], [30, -50], [29.6, -46.4]], 'cap-c');
        L([[-46, -44], [-44, -38], [-46.6, -32.6]], 'cap-d');
        // lashes
        for (const [i, [x0, y0, x1, y1]] of [[-20, -34, -24.6, -40], [-24, -27, -29.6, -30.6], [-25.6, -19.6, -30.6, -20.6], [40.6, -33, 45, -39.4], [44, -26, 49.6, -29.6], [44.4, -18.6, 50.6, -19.6]].entries()) L([[x0, y0], [x1, y1]], 'lash' + i);
        // the near bunch, on top, and the two bobbles
        for (const [i, [a, l, k]] of [[-3.0, 42, -0.4], [-1.48, 48, 0.3], [-2.56, 60, -0.3], [-2.02, 62, 0.1]].entries()) blade(-38, -50, a, l, 25, 'nb' + i, k);
        for (const [i, [bx, by, r]] of [[34, -52, 8], [-38, -50, 9]].entries()) {
            S([[bx - r, by + 0.6], [bx - r * 0.6, by - r * 0.8], [bx + r * 0.3, by - r], [bx + r, by - r * 0.2], [bx + r * 0.7, by + r * 0.8], [bx - r * 0.3, by + r]], C.magenta, 'bob' + i);
            L([[bx - r * 0.5, by - r * 0.3], [bx - r * 0.1, by - r * 0.6]], 'bob-l' + i, { color: WHITE, w: f * 0.9 });
        }
        w *= HS;
        f *= HS;
        g.restore();

        // 9 · the near arm (her right), thrown back for balance, over its sleeve's root
        arm([122, 154], [90, 174], [60, 166], 'open', 44, 'R', 'narm', C.magenta);
        S([[135, 139, 1], [122, 138], [108, 141], [91, 148, 1], [90, 158], [94, 170], [107, 184, 1], [115, 182], [121, 180], [127, 177, 1], [131, 160]], WHITE, 'nsleeve', {
            inside: () => {
                for (const [i, d] of [5, 17, 29].entries()) ring([91, 148], [93, 168], [107, 184], d, 6.2, [0.883, -0.468], 'nsr' + i);
            },
        });
        L([[95.6, 150.6], [98, 167], [110, 181]], 'nsleeve-hem');
        L([[125, 151], [116, 156], [109, 158]], 'nsleeve-f');
        g.restore();
    }

    window.Hero = { kitJump };
})();
