// pier-pressure · Kit, drawn by hand: one whole drawing of one pose (in the air, after the
// gull), every contour authored, instead of a puppet assembled from parts. Lanky, as the
// genre draws its kids: the head a quarter of the figure, a long tee that hangs as a tube
// (hoops that bow round it, bell sleeves with ringed hems), shorts with an opening we look
// into, thin limbs, a boot kicked at the camera drawn as a slab with its wall and tread.
// Global: Hero.kitJump(g, x, y, s): the drawing's box is about 300 × 380 units, (x, y) its
// top left, s output units per unit.
(() => {
    const T = SkateToon, C = T.COL, K0 = SkateKid, { star, plaster, dot } = Cast;
    const SKIN = '#cf8440', HAIR = '#a6d93a', RED = C.red, TEAL = '#17a3a0', TEAL_D = '#0d6f6e', YEL = '#ffd23c', WHITE = C.white;

    function kitJump(g, x, y, s) {
        let w = (T.LINE / s) * 1.3, f = (T.LINE_FINE / s) * 1.2;
        const S = (pts, fill, seed, o = {}) => T.shape(g, pts, { fill, w, seed: 'kh-' + seed, ...o });
        const L = (pts, seed, o = {}) => T.line(g, pts, { w: f, seed: 'kh-' + seed, ...o });
        g.save();
        g.translate(x, y);
        g.scale(s, s);

        // an arm and its hand in one skin, then a wristband
        const arm = (sh, el, wr, size, side, seed, band) => {
            const fa = K0.unit(K0.sub(wr, el)), th = Math.atan2(fa[0], -fa[1]);
            const poly = T.ribbon(K0.soft(sh, el, wr), 10.5, 8.2, { step: 0.6 }).map((p) => K0.rot(K0.sub(p, wr), -th));
            g.save();
            g.translate(wr[0], wr[1]);
            g.rotate(th);
            T.hand(g, 'open', size, { side, fill: SKIN, w, seed: 'kh-' + seed, arm: { poly } });
            S([[-5.4, 5, 1], [5.4, 5, 1], [5.6, 10.5, 1], [-5.6, 10.5, 1]], band, seed + 'band', { w: f });
            g.restore();
        };
        // a ring round a sleeve: the hem's curve (a, b, c) moved d towards the shoulder
        const ring = (a, b, c, d, th, dir, seed) => {
            const m = (p, k) => [p[0] + dir[0] * k, p[1] + dir[1] * k];
            const ext = (p, q, k) => [p[0] + (p[0] - q[0]) * k, p[1] + (p[1] - q[1]) * k];
            const A = ext(a, b, 0.4), Cc = ext(c, b, 0.4);
            S([[...m(A, d), 1], m(b, d), [...m(Cc, d), 1], [...m(Cc, d + th), 1], m(b, d + th), [...m(A, d + th), 1]], RED, seed, { w: f * 0.8 });
        };

        // 1 · her board, falling away under her
        Cast.board(g, 84, 352, 2.2, 0.26);

        // 2 · the far arm (her left), up after the gull, and its sleeve
        arm([190, 160], [240, 156], [280, 124], 47, 'L', 'farm', C.roadLine);
        S([[182, 145, 1], [204, 139], [222.5, 138.6, 1], [231, 157], [225.5, 175.4, 1], [206, 177], [186, 176, 1]], WHITE, 'fsleeve', {
            inside: () => {
                for (const [i, d] of [4, 16, 28].entries()) ring([222.5, 138.6], [231, 157], [225.5, 175.4], d, 6, [-0.997, 0.08], 'fsr' + i);
            },
        });
        L([[218.4, 141], [226, 157], [221, 173]], 'fsleeve-hem');

        // 3 · the trailing leg (her left), bent up behind: leg, sock, boot seen from its side
        S(T.ribbon(K0.soft([112, 240], [58, 258], [30, 224]), 11.5, 9, { step: 0.6 }), SKIN, 'fleg', { dense: true });
        S(T.ribbon([[43, 240], [36, 232], [29, 223]], 13, 14, { step: 0.6 }), WHITE, 'fsock', { dense: true });
        for (const [i, k] of [0.16, 0.42].entries()) {
            const q = [43 - 14 * k, 240 - 17 * k];
            L([[q[0] - 5.4, q[1] + 4.5], [q[0] + 5.4, q[1] - 4.5]], 'fsock-s' + i, { color: RED, w: f * 1.9, taper: false, amp: 0.1, cap: 'butt' });
        }
        g.save();
        g.translate(30, 224);
        g.rotate(2.452);
        g.scale(2.3, 2.3);
        K0.shoe(g, { S: { ankle: 11 }, w: w / 2.3, fine: f / 2.3 }, { upper: YEL, sole: WHITE, stripe: RED, tongue: WHITE, high: true, cap: WHITE }, false, 'kh-fboot');
        g.restore();

        // 4 · the shorts: one leg along the trailing thigh, the other towards us, its opening a
        // ring we look into
        S([[92, 226, 1], [84, 229], [76.6, 234, 1], [79, 251], [87.4, 266, 1], [100, 265], [112, 264], [122, 276], [140, 284], [160, 280], [172, 266, 1], [178, 250], [178, 234, 1], [134, 244]], TEAL, 'shorts');
        S([[76.6, 234, 1], [79, 251], [87.4, 266, 1], [93, 264, 1], [84.6, 249.6], [82.4, 232.4, 1]], WHITE, 'shorts-band', { w: f });
        L([[112, 262], [103, 256], [97, 247]], 'shorts-f1');
        L([[114, 266], [108, 272], [100, 273]], 'shorts-f2');
        L([[124, 262], [128, 270], [136, 275]], 'shorts-f3');
        L([[170, 244], [164, 252], [163, 261]], 'shorts-f4');
        S(T.ellipse(147, 268, 23.5, 14.5, 0.22, 16), WHITE, 'open-band');
        S(T.ellipse(147.6, 268.6, 19, 10.6, 0.22, 16), TEAL_D, 'open-in', { w: f });

        // 5 · the near leg (her right), kicked at the camera: a little of the shin, then the sole
        S(T.ribbon([[148, 269], [158, 282], [168, 296]], 11.5, 10.5, { step: 0.6 }), SKIN, 'nleg', { dense: true });
        g.save();
        g.translate(178, 318);
        g.rotate(0.3);
        const O = [[-20, 34], [-26, 10], [-27, -14], [-20, -32], [-6, -40], [10, -38], [24, -28], [28, -8], [24, 14], [20, 34], [10, 41], [-10, 41]];
        const sh = (pts, dx, dy) => pts.map(([px, py, c]) => [px + dx, py + dy, c]);
        // the upper behind the sole: the toe's rubber cap, the canvas, the collar
        S([[-22, 40], [-40, 22], [-44, -8], [-36, -34], [-20, -49], [0, -52], [8, -40], [-8, -20], [-12, 30]], YEL, 'sole-upper');
        S([[-37.6, -31, 1], [-20, -49], [0, -52], [8, -40, 1], [-10, -37], [-24, -24]], WHITE, 'sole-cap', { w: f });
        L([[-38, 6], [-32, 10], [-27, 8]], 'sole-st1');
        L([[-36, 18], [-30, 21], [-25, 19]], 'sole-st2');
        // the sole's wall, its welt, then its face
        S(sh(O, -7, -4.5), WHITE, 'sole-wall');
        L(sh(O.slice(0, 6), -3.6, -2.4), 'sole-welt', { color: RED, w: f * 1.25, taper: false });
        S(O, '#eef0ea', 'sole-face');
        // tread: a rim, bars under the ball of the foot, a block under the heel, a mark in the arch
        L(O.map(([px, py]) => [px * 0.8, (py - 1) * 0.86 + 1]), 'sole-rim', { closed: true, w: f * 0.9 });
        for (const [i, yy] of [-29, -22, -15, -8].entries()) L([[-17 + Math.abs(yy + 18) * 0.25, yy + 1], [0, yy - 1.2], [19 - Math.abs(yy + 18) * 0.3, yy + 0.6]], 'sole-bar' + i, { w: f * 1.1 });
        S([[-14, 12, 1], [15, 11, 1], [15, 28], [7, 34], [-7, 34], [-14, 28]], C.grey, 'sole-heel', { w: f });
        for (const [i, yy] of [18, 25].entries()) L([[-11, yy], [12, yy - 0.6]], 'sole-hbar' + i, { w: f * 0.9 });
        S(T.ellipse(1, 2.5, 8, 4.6, -0.1, 10), RED, 'sole-arch', { w: f * 0.9 });
        g.restore();

        // 6 · the tee: a long tube hanging from the shoulders, its hoops bowing round it
        const N = [168, 142], hd = [-0.359, 0.934], n = [0.934, 0.359];
        S([[157, 135, 1], [140, 138], [124, 147, 1], [102, 190], [86, 234, 1], [108, 250], [140, 253], [166, 243], [178, 232, 1], [187, 196], [193, 160, 1], [179, 141, 1], [168, 147]], WHITE, 'tee', {
            inside: () => {
                for (let i = 0; i < 7; i++) {
                    const t = 12 + i * 15.2, c = [N[0] + hd[0] * t, N[1] + hd[1] * t], bow = 7;
                    const P = (a, b) => [c[0] + n[0] * a + hd[0] * b, c[1] + n[1] * a + hd[1] * b];
                    S([[...P(-64, -2), 1], P(0, bow), [...P(64, -2), 1], [...P(64, 5.6), 1], P(0, bow + 7.6), [...P(-64, 5.6), 1]], RED, 'hoop' + i, { w: f * 0.8 });
                }
            },
        });
        L([[112, 178], [119, 186], [117, 197]], 'tee-f1');
        L([[183, 186], [177, 194], [176, 204]], 'tee-f2');
        L([[98, 232], [122, 243], [148, 243]], 'tee-f3');
        S(star(160, 184, 11.5, 5, -1.25), C.roadLine, 'tee-star', { w: f });

        // 7 · neck, the collar's rib in front of it
        S(T.ribbon([[166, 147], [175, 132], [186, 116]], 12.5, 12, { step: 0.6 }), SKIN, 'neck', { dense: true });
        S(T.ribbon([[155, 134], [160, 144], [168, 148.4], [177, 145.4], [181.4, 138]], 5.6, 5.6, { step: 0.5 }), RED, 'collar', { dense: true, w: f });
        for (const [i, [cx, cy, a]] of [[158, 141, -0.5], [164, 146.4, -0.15], [172, 147.4, 0.2], [178.6, 142.6, 0.6]].entries()) L([[cx - Math.sin(a) * -2.4, cy - 2.4], [cx + Math.sin(a) * -2.4, cy + 2.4]], 'collar-r' + i, { w: f * 0.7, amp: 0 });

        // 8 · the head, three quarters to the right, thrown back
        const HS = 1.3;
        g.save();
        g.translate(194, 64);
        g.rotate(-0.2);
        g.scale(HS, HS);
        w /= HS;
        f /= HS;
        // a blade of a bunch: a fat leaf from its bobble, two strands along it
        const blade = (bx, by, ang, len, wd, seed) => {
            const c = Math.cos(ang), sn = Math.sin(ang), P = (a, b) => [bx + c * a - sn * b, by + sn * a + c * b];
            S([[...P(-2, -wd * 0.42), 1], P(len * 0.4, -wd * 0.62), P(len * 0.8, -wd * 0.3), [...P(len, wd * 0.34), 1], P(len * 0.56, wd * 0.56), [...P(-2, wd * 0.42), 1]], HAIR, seed);
            L([P(len * 0.12, -wd * 0.06), P(len * 0.42, -wd * 0.08), P(len * 0.7, wd * 0.06)], seed + 'l');
            L([P(len * 0.2, wd * 0.22), P(len * 0.44, wd * 0.24)], seed + 'm');
        };
        // the far bunch, behind the skull
        for (const [i, [a, l]] of [[-0.12, 42], [-1.5, 44], [-0.55, 56], [-1.02, 54]].entries()) blade(34, -52, a, l, 22, 'fb' + i);
        // the skull and the jaw, dropped open
        S([[-52, -28], [-32, -43], [0, -48], [28, -44], [46, -30], [53, -10], [52, 10], [47, 28], [34, 43], [12, 50], [-14, 45], [-38, 31], [-54, 12], [-58, -8]], SKIN, 'head');
        // the ear, inside the outline, with its stud
        S([[-47, -5], [-39, -12], [-30, -6], [-29, 7], [-36, 15], [-45, 10]], SKIN, 'ear');
        L([[-43, -4], [-35, -6], [-33, 2], [-38, 6]], 'ear-a');
        L([[-38, -1], [-41, 8]], 'ear-b');
        dot(g, -37.4, 12.6, 1.5, C.roadLine);
        // the mouth: the dark, the tongue, a band of top teeth with her gap, the cheeks' hooks
        S([[-24, 17, 1], [0, 12.5], [24, 11], [45, 13, 1], [43, 26], [30, 39], [10, 43], [-10, 36]], C.mouth, 'mouth', {
            inside: () => {
                g.fillStyle = '#3d0f17';
                g.beginPath();
                g.ellipse(12, 26, 21, 8, -0.05, 0, Math.PI * 2);
                g.fill();
                S([[-6, 47], [-2, 36.6], [10, 32], [24, 33.4], [34, 39], [36, 48]], C.tongue, 'tongue', { w: f });
                L([[13, 34.6], [15.6, 43]], 'tongue-l');
                S([[-27, 13, 1], [0, 8.5], [24, 7], [48, 9, 1], [45.6, 21.6, 1], [24, 18.8], [0, 20.4], [-21.4, 25.4, 1]], WHITE, 'teeth', { w: f });
                const U = (tx) => (tx < 0 ? 12.5 + (-tx / 24) * 4.5 : tx < 24 ? 12.5 - (tx / 24) * 1.5 : 11 + ((tx - 24) / 21) * 2);
                g.fillStyle = C.mouth;
                g.fillRect(8.4, U(11) - 2, 6.6, 11);
                for (const [i, tx] of [-12, -2, 8.4, 15, 24.4, 34].entries()) L([[tx, U(tx) - 1], [tx + 0.4, U(tx) + 8.6]], 'tooth' + i, { amp: 0.1, taper: false });
            },
        });
        L([[-27, 10], [-30.6, 15.6], [-27, 21.4]], 'cheek-a');
        L([[47, 7], [50, 12], [47.6, 17.4]], 'cheek-b');
        // the nose and its plaster
        T.line(g, [[12, 2], [13, 8], [18.5, 10.4], [24, 7.6], [24.4, 2]], { w, seed: 'kh-nose' });
        plaster(g, { fine: f, w }, 18.4, 0.4, -0.16, 8.6, 'kh-plaster');
        // the eyes: the near one bigger, the far one out at the head's edge, both on the gull
        for (const [i, [cx, cy, rx, ry, px, py, pr]] of [[-6, -18, 19, 21, 5, -27, 3.8], [30, -19, 14, 19, 36, -27, 3.3]].entries()) {
            S(T.ellipse(cx, cy, rx, ry, i ? 0.1 : -0.06, 16), WHITE, 'eye' + i, {
                inside: () => {
                    g.fillStyle = C.ink;
                    g.beginPath();
                    g.ellipse(px, py, pr, pr * 1.12, 0, 0, Math.PI * 2);
                    g.fill();
                },
            });
        }
        // the cap of hair and its fringe: three fat locks swept the way she is going
        S([
            [53, -16, 1], [50, -32], [40, -30, 1], [33, -45, 1], [24, -40], [16, -32, 1], [6, -47, 1], [-4, -41], [-13, -31, 1],
            [-24, -45, 1], [-34, -36], [-42, -20, 1], [-49, -30, 1], [-56, -2, 1],
            [-61, -24], [-48, -48], [-16, -60], [18, -58], [45, -43],
        ], HAIR, 'cap');
        L([[-20, -59], [-19, -52], [-22, -47]], 'cap-a');
        L([[4, -59], [6, -52], [4.6, -48]], 'cap-b');
        L([[26, -56], [28, -50], [27, -46]], 'cap-c');
        // lashes
        for (const [i, [x0, y0, x1, y1]] of [[-20.6, -31, -26, -37], [-24, -24, -30.6, -27], [-25, -17, -31.6, -17.4], [40, -32, 44.6, -38], [43, -25, 48.6, -28.4], [44, -18, 50, -18.6]].entries()) L([[x0, y0], [x1, y1]], 'lash' + i);
        // the near bunch, on top, and the two bobbles
        for (const [i, [a, l]] of [[-3.0, 44], [-1.5, 48], [-2.55, 60], [-2.02, 62]].entries()) blade(-38, -50, a, l, 25, 'nb' + i);
        for (const [i, [bx, by, r]] of [[34, -52, 8], [-38, -50, 9]].entries()) {
            S(T.ellipse(bx, by, r, r * 0.94, 0.3, 12), C.magenta, 'bob' + i);
            L([[bx - r * 0.45, by - r * 0.35], [bx - r * 0.05, by - r * 0.6]], 'bob-l' + i, { color: WHITE, w: f * 0.9 });
        }
        w *= HS;
        f *= HS;
        g.restore();

        // 9 · the near arm (her right), thrown back, over its sleeve's root
        arm([122, 154], [88, 172], [56, 158], 47, 'R', 'narm', C.magenta);
        S([[135, 140, 1], [112, 140], [90, 149, 1], [93.7, 169], [108, 183, 1], [118, 181], [126, 177, 1], [131, 160]], WHITE, 'nsleeve', {
            inside: () => {
                for (const [i, d] of [5, 17, 29].entries()) ring([90, 149], [93.7, 169], [108, 183], d, 6.2, [0.883, -0.468], 'nsr' + i);
            },
        });
        L([[94.6, 151], [98, 168.6], [110.6, 180.4]], 'nsleeve-hem');
        L([[124, 152], [115, 157], [108, 158]], 'nsleeve-f');
        g.restore();
    }

    window.Hero = { kitJump };
})();
