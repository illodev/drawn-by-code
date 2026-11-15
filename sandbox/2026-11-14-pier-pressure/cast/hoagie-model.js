// pier-pressure · Hoagie, drawn by hand in code. Every frame is a whole new drawing: this file
// holds how he is built (each shape written here point by point, with its proportions and
// colours measured on his approved model sheet), and a pose says where everything is in that
// frame: how far he has sunk into his knees, whether he is up on his toes, how his body leans,
// his head, his eyes and lids, his mouth, where the thumb arm's elbow and fist are, where the
// camcorder is and which way it faces. Nothing here comes from a traced drawing.
// Global: HoagieModel. Load after toon.js.
//
//   HoagieModel.draw(g, x, y, s, pose)
//       the point between his soles on (x, y); s frame units per model unit (he is 448 units
//       tall standing: the size of his drawing on the sheet).
//   pose = {
//     crouch: 0,          how far the upper body has come down over the legs (units)
//     toes: 0,            0…1 up on his toes
//     lean: 0,            radians, the upper body about the hips (positive = to our right)
//     stretch: 1,         the upper body's length
//     tilt: 0, nod: 0,    the head about the neck (radians); the face slid down in the head (units)
//     look: [0, 0],       the pupils
//     lids: 0,            0 open … 1 shut;  squint: true → lids come from below too, brows down
//     brows: 0,           raised (units)
//     mouth: 0.6,         0 a closed smirk … 0.6 the grin … 1 wide open;  'o' a small round O
//     cow: 0,             the cowlick about its root (radians)
//     arm: { elbow: [x, y], fist: [x, y], thumb: angle or null, k: size }   (model units)
//     cam: { at: [x, y], front: bool, tilt }                              the camcorder
//     halo: colour        a sticker's edge round the whole figure
//   }
const HoagieModel = (() => {
    const T = SkateToon;
    const SKIN = '#f3bd90', HAIR = '#ecbd66', ORANGE = '#e86924', ORANGE_D = '#bf4f17', OLIVE = '#6f7549', OLIVE_D = '#5a6039', NAVY = '#253250', WHITE = '#fffdf6',
        NOSE = '#de7c84', MOUTH = '#571f25', TONGUE = '#e9858c', GREY = '#8d8e93', GREY_D = '#55565c', LENS = '#27304d', STRAP = '#2b2a2c', YOLK = '#e9b23b', FRECKLE = '#b56b3d', INK = T.COL.ink;
    const LW = 2.15; // the line, in model units
    const FEET = [136, 454], HIP = [138, 292], NECK = [134, 166];
    const ell = (cx, cy, rx, ry, n = 14, rot = 0) => Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2, x = Math.cos(a) * rx, y = Math.sin(a) * ry;
        return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)];
    });
    const turn = ([x, y, c], [ox, oy], a, k = 1, ky = k) => {
        const dx = (x - ox) * k, dy = (y - oy) * ky, r = [ox + dx * Math.cos(a) - dy * Math.sin(a), oy + dx * Math.sin(a) + dy * Math.cos(a)];
        return c ? [...r, 1] : r;
    };

    function draw(g, x, y, s, pose = {}) {
        const { crouch = 0, toes = 0, lean = 0, stretch = 1, tilt = 0, nod = 0, look = [0, 0], lids = 0, squint = false, brows = 0, mouth = 0.72, cow = 0, arm = null, cam = null } = pose;
        const lift = toes * 15;
        // a point of the upper body: stretched and leant about the hips, and down with the crouch
        const up = (p) => { const q = turn(p, HIP, lean, 1, stretch); q[1] += crouch - lift; return q; };
        // a point of the head: tipped about the neck, then carried by the upper body
        const hd = (p) => up(turn(p, NECK, tilt));
        const fc = ([px, py, c]) => hd(c ? [px, py + nod, 1] : [px, py + nod]); // a point of the face
        const pass = (halo) => {
            const S = (pts, fill, seed, o = {}) => {
                if (!halo) return T.shape(g, pts, { fill, w: LW, seed, amp: 0.12, ...o });
                const p = T.path(pts, true), P = new Path2D();
                P.moveTo(p[0][0], p[0][1]);
                for (const q of p) P.lineTo(q[0], q[1]);
                P.closePath();
                g.fillStyle = g.strokeStyle = halo; g.lineWidth = 18; g.lineJoin = 'round';
                g.fill(P); g.stroke(P);
            };
            const L = (pts, seed, o = {}) => !halo && T.line(g, pts, { w: LW, seed, amp: 0.12, ...o });
            // a limb: one even width along a centreline, inked then filled
            const tube = (pts, d, fill, seed) => {
                const p = T.path(pts, false), P = new Path2D();
                P.moveTo(p[0][0], p[0][1]);
                for (let i = 1; i < p.length; i++) P.lineTo(p[i][0], p[i][1]);
                g.lineCap = 'round'; g.lineJoin = 'round';
                g.strokeStyle = halo || INK; g.lineWidth = halo ? d + 18 : d + LW * 2; g.stroke(P);
                if (!halo) { g.strokeStyle = fill; g.lineWidth = d; g.stroke(P); }
            };

            // --- legs, socks, shoes (he stands on them: they stay, the body moves over them) ---
            for (const side of [-1, 1]) {
                const mx = (px) => 136 + side * (136 - px); // drawn for his right leg (our left), mirrored for the other
                const M = (pts) => (side < 0 ? pts : [...pts].reverse()).map(([px, py, c]) => (c ? [mx(px), py, 1] : [mx(px), py]));
                // up on his toes the heel comes off the floor: the shoe tips about its toe
                const sh = (pts) => M(pts).map((p) => (toes ? turn(p, [mx(34), 442], side * toes * 0.3) : p));
                const ankle = sh([[96, 404]])[0];
                tube([[mx(97), 352 + crouch * 0.5 - lift], [mx(96), 380 - lift * 0.6], [ankle[0], ankle[1] - 2]], 23, SKIN, 'leg' + side);
                tube([[mx(96), 372 - lift * 0.7], [ankle[0], ankle[1]]], 25, WHITE, 'sock' + side);
                if (!halo) { // the sock's stripe
                    g.strokeStyle = NAVY; g.lineWidth = 7; g.lineCap = 'butt';
                    g.beginPath(); g.moveTo(mx(96) - 12.5, 381 - lift * 0.66); g.lineTo(mx(96) + 12.5, 381 - lift * 0.66); g.stroke();
                }
                // the shoe: its sole, the navy upper, the rubber toe cap, three laces
                S(sh([[16, 434], [20, 430, 1], [120, 430, 1], [123, 436], [120, 445, 1], [20, 447, 1]]), WHITE, 'sole' + side);
                S(sh([[24, 432, 1], [26, 420], [42, 404], [64, 394], [82, 386], [102, 386], [116, 398], [121, 416], [121, 432, 1]]), NAVY, 'upper' + side);
                S(sh([[19, 432, 1], [20, 418], [32, 405], [50, 398], [60, 404], [62, 420], [58, 432, 1]]), WHITE, 'cap' + side);
                L(sh([[22, 440], [70, 442], [119, 439]]), 'stripe' + side, { color: ORANGE, w: 3 });
                for (let i = 0; i < 3; i++) {
                    const lace = sh([[66 + i * 9, 409 - i * 6], [86 + i * 8, 400 - i * 6]]);
                    L(lace, 'laceI' + side + i, { w: 7.4, amp: 0 });
                    L(lace, 'laceW' + side + i, { w: 3.6, color: WHITE, amp: 0 });
                }
            }

            // --- shorts ---
            const st = (p) => [p[0], p[1] + (crouch - lift) * 0.9, p[2]].filter((v) => v !== undefined);
            S([[60, 280, 1], [216, 280, 1], [224, 318], [226, 352, 1], [150, 364, 1], [137, 322, 1], [124, 364, 1], [48, 352, 1], [50, 318]].map(st), OLIVE, 'shorts');
            L([[137, 290], [137, 322]].map(st), 'fly');
            for (const side of [-1, 1]) {
                const mx = (px) => 137 + side * (137 - px);
                S([[56, 304, 1], [92, 308, 1], [90, 344, 1], [52, 340, 1]].map(([px, py, c]) => st([mx(px), py, c])), OLIVE, 'pocket' + side);
                L([[55, 318], [91, 322]].map(([px, py]) => st([mx(px), py])), 'flap' + side);
                S(ell(mx(73), 314, 3.4, 3.4, 8).map(st), OLIVE_D, 'stud' + side, { w: 1.4 });
            }

            // --- the shirt ---
            const body = [[76, 170], [104, 160, 1], [134, 172, 1], [164, 160, 1], [204, 166], [214, 226], [218, 284, 1], [140, 300, 1], [62, 286, 1], [60, 226]].map(up);
            const sleeveR = [[196, 162, 1], [226, 170], [240, 200, 1], [218, 210, 1], [206, 192]].map(up), sleeveL = [[84, 164, 1], [54, 176], [42, 208, 1], [64, 216, 1], [78, 196]].map(up);
            const flowers = () => {
                // five white petals round a yolk, as the shirt is printed
                for (const [fx, fy, r, a0] of [[190, 182, 15, 0.3], [84, 250, 15, 1], [152, 264, 16, 0.5], [198, 244, 15, 0.1], [116, 226, 11, 0.8], [66, 196, 13, 0.4], [180, 292, 14, 0.2], [222, 196, 12, 0.9], [112, 290, 12, 0.6]]) {
                    const [cx, cy] = up([fx, fy]);
                    g.fillStyle = WHITE;
                    for (let i = 0; i < 5; i++) {
                        const a = a0 + lean + (i / 5) * Math.PI * 2;
                        g.beginPath(); g.ellipse(cx + Math.cos(a) * r * 0.62, cy + Math.sin(a) * r * 0.62, r * 0.5, r * 0.36, a, 0, 6.3); g.fill();
                    }
                    g.fillStyle = YOLK; g.beginPath(); g.arc(cx, cy, r * 0.24, 0, 6.3); g.fill();
                }
            };
            S(sleeveL, ORANGE, 'sleeveL', halo ? {} : { inside: flowers });
            S(sleeveR, ORANGE, 'sleeveR', halo ? {} : { inside: flowers });
            S(body, ORANGE, 'shirt', halo ? {} : { inside: flowers });
            if (!halo) {
                T.shape(g, [[110, 162, 1], [134, 214, 1], [158, 162, 1], [134, 170]].map(up), { fill: SKIN, w: LW, seed: 'chest', amp: 0.1 }); // the open collar
                S([[104, 160, 1], [134, 214, 1], [112, 204], [96, 178]].map(up), ORANGE, 'lapelL');
                S([[164, 160, 1], [134, 214, 1], [156, 204], [172, 178]].map(up), ORANGE, 'lapelR');
                L([[134, 214], [137, 298]].map(up), 'placket');
                for (const by of [232, 256, 280]) S(ell(141, by, 2.2, 2.2, 6).map(up), ORANGE_D, 'btn' + by, { w: 1.2 });
                L([[154, 212, 1], [180, 208, 1], [182, 236], [158, 240, 1], [154, 212, 1]].map(up), 'pocket');
                L([[154, 220], [181, 216]].map(up), 'pocketflap');
            }

            // --- the head ---
            const ear = (cx) => {
                S(ell(cx, 108, 27, 31, 14).map(hd), SKIN, 'ear' + cx);
                L([[cx - 9, 96], [cx + (cx < 134 ? -12 : 12), 104], [cx + (cx < 134 ? -8 : 8), 120], [cx + (cx < 134 ? 4 : -4), 116]].map(hd), 'curl' + cx);
            };
            ear(34); ear(234);
            S([[60, 62], [132, 36], [206, 60], [230, 100], [216, 138], [176, 162], [134, 168], [92, 162], [52, 140], [38, 102]].map(hd), SKIN, 'face');
            if (!halo) {
                // the buzz cut: a cap with its hairline in two bumps, stitched along its edge
                const cap = [[46, 92], [56, 64], [90, 42], [132, 34], [178, 42], [212, 64], [222, 92, 1], [208, 72], [182, 58], [156, 62], [134, 56, 1], [112, 62], [88, 56], [62, 70]].map(hd);
                T.shape(g, cap, { fill: HAIR, w: LW, seed: 'cap', amp: 0.12, stroke: false });
                L([[46, 92], [56, 64], [90, 42], [132, 34], [178, 42], [212, 64], [222, 92]].map(hd), 'capedge');
                for (let i = 0; i < 12; i++) {
                    const a = Math.PI * (1.08 + (0.84 * i) / 11), cx = 134 + Math.cos(a) * 94, cy = 104 + Math.sin(a) * 72;
                    L([[cx - Math.cos(a) * 5, cy - Math.sin(a) * 5], [cx + Math.cos(a) * 6, cy + Math.sin(a) * 6]].map(hd), 'stitch' + i, { amp: 0 });
                }
                L([[88, 56], [100, 50], [112, 54]].map(hd), 'browL', { color: '#c08a3a', w: 1.8 });
                L([[156, 54], [168, 49], [182, 53]].map(hd), 'browR', { color: '#c08a3a', w: 1.8 });
            }
            // the cowlick, about its root
            S([[124, 42, 1], [124, 24], [132, 10], [144, 4], [153, 9], [154, 20, 1], [147, 13], [140, 15], [136, 25], [139, 36], [143, 42, 1]].map((p) => hd(turn(p, [134, 42], cow))), HAIR, 'cow');
            if (!halo) {
                // eyes: two rounds that touch, a dot each
                const eyes = [[104, 90, 32, 31], [160, 88, 30, 30]];
                for (const [i, [ex, ey, rx, ry]] of eyes.entries()) {
                    const round = ell(ex, ey, rx, ry, 16).map(fc), P = new Path2D();
                    T.shape(g, round, { fill: WHITE, w: LW, seed: 'eye' + i, amp: 0.1 });
                    const pth = T.path(round, true);
                    P.moveTo(pth[0][0], pth[0][1]); for (const q of pth) P.lineTo(q[0], q[1]); P.closePath();
                    g.save();
                    g.clip(P);
                    if (lids < 0.99) {
                        const [px, py] = fc([ex + (i ? -14 : 17) + look[0], ey + 2 + look[1]]);
                        g.fillStyle = INK; g.beginPath(); g.arc(px, py, 5.6, 0, 6.3); g.fill();
                    }
                    if (lids > 0) {
                        // the lid, from the top; a squint brings the lower one up too
                        const yl = ey - ry + 2 * ry * Math.min(1, lids) * 0.78, lid = [[ex - rx - 4, ey - ry - 6, 1], [ex + rx + 4, ey - ry - 6, 1], [ex + rx + 4, yl, 1], [ex, yl + 5], [ex - rx - 4, yl, 1]].map(fc);
                        T.shape(g, lid, { fill: SKIN, w: LW, seed: 'lid' + i, amp: 0 });
                        if (squint) T.shape(g, [[ex - rx - 4, ey + ry + 6, 1], [ex + rx + 4, ey + ry + 6, 1], [ex + rx + 4, ey + ry * 0.45, 1], [ex, ey + ry * 0.3], [ex - rx - 4, ey + ry * 0.45, 1]].map(fc), { fill: SKIN, w: LW, seed: 'lidlow' + i, amp: 0 });
                    }
                    g.restore();
                    if (lids >= 0.99) {
                        // shut: the round goes, a happy arc stays
                        T.shape(g, round, { fill: SKIN, color: SKIN, w: LW * 1.4, seed: 'eye' + i, amp: 0.1 });
                        L([[ex - rx * 0.7, ey + 6], [ex, ey - 10], [ex + rx * 0.7, ey + 6]].map(fc), 'shut' + i);
                    }
                    if (squint || brows) L((i ? [[ex - 26, ey - 30 - brows + (squint ? 12 : 0)], [ex - 4, ey - 36 - brows + (squint ? 4 : 0)], [ex + 22, ey - 34 - brows]] : [[ex + 26, ey - 30 - brows + (squint ? 12 : 0)], [ex + 4, ey - 36 - brows + (squint ? 4 : 0)], [ex - 22, ey - 34 - brows]]).map(fc), 'brow' + i, { w: LW * 1.5 });
                }
                for (const [fx, fy] of [[68, 90], [62, 102], [77, 100], [194, 88], [202, 99], [188, 99]]) { const [px, py] = fc([fx, fy]); g.fillStyle = FRECKLE; g.beginPath(); g.arc(px, py, 2.5, 0, 6.3); g.fill(); }
                // the mouth
                if (mouth === 'o') S(ell(134, 138, 9, 11, 10).map(fc), MOUTH, 'mouth-o');
                else if (mouth < 0.15) {
                    L([[80, 118], [104, 132], [134, 136], [166, 130], [190, 112]].map(fc), 'smirk', { w: LW * 1.15 });
                    L([[74, 112], [80, 118], [80, 126]].map(fc), 'cheekL'); L([[196, 106], [190, 112], [192, 121]].map(fc), 'cheekR');
                } else {
                    const d = 38 * mouth, topc = [[72, 114, 1], [100, 124], [134, 127], [168, 122], [196, 110, 1]], lip = [...topc, [182, 124 + d * 0.62], [134, 128 + d], [88, 126 + d * 0.62]].map(fc);
                    T.shape(g, lip, { fill: MOUTH, w: LW, seed: 'mouth', amp: 0.1, inside: () => {
                        if (mouth > 0.8) T.shape(g, ell(134, 132 + d, 34, 16, 12).map(fc), { fill: TONGUE, w: LW, seed: 'tongue', amp: 0.1 });
                        // his teeth, in their braces
                        const band = [[66, 108, 1], [100, 122], [134, 125], [168, 120], [200, 104, 1], [196, 126], [168, 139], [134, 143], [100, 141], [74, 130]].map(fc);
                        T.shape(g, band, { fill: WHITE, w: LW, seed: 'teeth', amp: 0.08 });
                        for (const tx of [96, 115, 134, 153, 172]) L([[tx, 122], [tx + (tx - 134) * 0.04, 142]].map(fc), 'tooth' + tx, { w: 1.3, amp: 0 });
                        L([[78, 126], [106, 133], [134, 135], [162, 132], [190, 121]].map(fc), 'wire', { w: 1.4, color: '#7d7f86', amp: 0 });
                        for (const bx of [86, 105, 124, 144, 163, 181]) { const by = 134.5 - Math.pow((bx - 134) / 56, 2) * 9; T.shape(g, [[bx - 4, by - 3.5, 1], [bx + 4, by - 3.5, 1], [bx + 4, by + 3.5, 1], [bx - 4, by + 3.5, 1]].map(fc), { fill: '#c9cbd0', w: 1.2, seed: 'brk' + bx, amp: 0 }); }
                    } });
                    L([[66, 106], [72, 114], [72, 124]].map(fc), 'cheekL'); L([[202, 100], [196, 110], [199, 120]].map(fc), 'cheekR');
                }
                S(ell(134, 107, 15, 11, 12).map(fc), NOSE, 'nose');
            }

            // --- the strap, the camcorder and the hand(s) on it ---
            if (cam) {
                const [cx, cy] = up(cam.at), a = (cam.tilt ?? 0) + lean, C = (p) => turn([cx + p[0], cy + p[1], p[2]], [cx, cy], a);
                const nl = hd([108, 164]), nr = hd([162, 164]);
                tube([nl, [(nl[0] + cx) / 2 - 16, (nl[1] + cy) / 2 + 8], C([-14, -22])], 5.5, STRAP, 'strapL');
                tube([nr, [(nr[0] + cx) / 2 + 22, (nr[1] + cy) / 2 + 12], C([24, -18])], 5.5, STRAP, 'strapR');
                if (cam.front) {
                    // seen from the front: its face, the lens a round of glass
                    const sl = up([58, 204]), sr = up([218, 202]), hl = C([-36, 10]), hr = C([36, 10]);
                    // each elbow hangs below and outside the line from its sleeve to its hand
                    tube([sl, [Math.min(sl[0], hl[0]) - 16, Math.max(sl[1], hl[1]) + 24], hl], 20, SKIN, 'armL');
                    tube([sr, [Math.max(sr[0], hr[0]) + 16, Math.max(sr[1], hr[1]) + 24], hr], 20, SKIN, 'armR2');
                    S([[-30, -32, 1], [30, -32, 1], [34, 30, 1], [-34, 30, 1]].map(C), GREY, 'cam-body');
                    S([[-30, 8, 1], [30, 8, 1], [34, 30, 1], [-34, 30, 1]].map(C), GREY_D, 'cam-low');
                    S(ell(0, -4, 24, 24, 14).map(C), GREY_D, 'cam-ring');
                    S(ell(0, -4, 17, 17, 12).map(C), LENS, 'cam-glass');
                    if (!halo) { const [gx, gy] = C([-6, -10]); g.fillStyle = '#8fa0c8'; g.beginPath(); g.ellipse(gx, gy, 5, 3, -0.7, 0, 6.3); g.fill(); S([[16, -30, 1], [26, -30, 1], [26, -25, 1], [16, -25, 1]].map(C), '#d5323a', 'cam-rec', { w: 1.2 }); }
                    for (const side of [-1, 1]) {
                        S(ell(side * 37, 8, 13, 19, 12).map(C), SKIN, 'grip' + side);
                        for (const fy of [0, 9, 18]) L([[side * 28, fy], [side * 40, fy + 1]].map(C), 'fing' + side + fy);
                    }
                } else {
                    // seen from his side, held at his chest: the lens barrel to our left
                    tube([up([58, 206]), [cx - 36, cy + 26], C([-2, 34])], 20, SKIN, 'armL');
                    S([[-22, -30, 1], [34, -32, 1], [36, 30, 1], [-20, 32, 1]].map(C), GREY, 'cam-body');
                    S([[-22, 6, 1], [36, 4, 1], [36, 30, 1], [-20, 32, 1]].map(C), GREY_D, 'cam-low');
                    S([[-48, -22, 1], [-20, -24, 1], [-20, 22, 1], [-48, 20, 1]].map(C), GREY_D, 'cam-barrel');
                    S(ell(-50, -1, 13, 23, 14).map(C), STRAP, 'cam-ring');
                    S(ell(-52, -1, 8, 16, 12).map(C), LENS, 'cam-glass');
                    S([[-10, -20, 1], [6, -21, 1], [6, -15, 1], [-10, -14, 1]].map(C), '#d5323a', 'cam-rec', { w: 1.2 });
                    S([[-30, 14], [-18, 4], [4, 6], [14, 18], [12, 36], [-6, 46], [-26, 40], [-34, 28]].map(C), SKIN, 'gripS');
                    for (const fy of [16, 25, 34]) L([[-14, fy], [10, fy + 2]].map(C), 'fingS' + fy);
                }
            }

            // --- the thumb arm ---
            if (arm) {
                const sh0 = up([222, 190]), k = arm.k ?? 1, [fx, fy] = arm.fist, fa = arm.rot ?? 0, F = (p) => turn([fx + p[0] * k, fy + p[1] * k, p[2]], [fx, fy], fa);
                tube([sh0, arm.elbow, [fx - 6 * k, fy + 8 * k]], 21 * (0.9 + 0.1 * k), SKIN, 'armR');
                if (arm.thumb != null) {
                    const ta = arm.thumb, tp = (r) => F([Math.sin(ta) * r - 6, -Math.cos(ta) * r - 6]);
                    tube([tp(8), tp(46)], 21 * k, SKIN, 'thumb');
                }
                S([[-22, -8], [-12, -24], [10, -26], [26, -14], [28, 8], [18, 24], [-8, 26], [-24, 12]].map(F), SKIN, 'fist');
                for (const ly of [-12, 0, 12]) L([[4, ly], [27, ly + 1]].map(F), 'knuck' + ly);
            }
        };
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.translate(-FEET[0], -FEET[1]);
        if (pose.halo) pass(pose.halo);
        pass(null);
        g.restore();
    }
    return { draw, FEET };
})();
