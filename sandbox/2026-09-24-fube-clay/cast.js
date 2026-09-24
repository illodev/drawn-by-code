// fube-clay · the cast and the set in plasticine (styles/clay/clay.js). Global: FC.
// Laura (Aardman-like: big white eyes, glasses rolled from black clay, a bun), her chunky
// hands, the office set, the laptop, the invoice, the stamp, the plane and the tax office's
// mailbox. Every piece is a Clay piece (volume, fingerprints, contact shadow).
const FC = (() => {
    const C = Clay;
    const COL = {
        wall: '#bcd7c9', desk: '#d9a36c', deskFront: '#c78f5b', skin: '#ecb993', skinDark: '#dc9f7c',
        hair: '#5b3424', navy: '#2d4a8f', cream: '#f6efe0', shirt: '#f4efe4', coral: '#d2563f', green: '#2f8a5b',
        mustard: '#e3b04b', ink: '#2a2530', grey: '#a7abb4', dark: '#3b3d45', wood: '#9b6a43', sky: '#a9d4ea',
        paper: '#fbf6ea', terracotta: '#c8734e', leaf: '#4f9a5c',
    };
    const put = (g, x, y, s, rot, fn) => { g.save(); g.translate(x, y); if (rot) g.rotate(rot); if (s !== 1) g.scale(s, s); fn(); g.restore(); };
    const P = (g, key, shape, col, o) => C.draw(g, key, shape, col, o);
    const small = (k = {}) => ({ bevel: 3, shine: 0.7, prints: 0, marks: 0, speckle: 0.3, shadowBlur: 3, shadowOffset: [2, 3], ...k });
    // a ring rolled from a clay snake (glasses, a clock rim): an evenodd silhouette
    function ring(cx, cy, rx, ry, th) {
        const pad = th + 2;
        return {
            box: { x: cx - rx - pad, y: cy - ry - pad, w: (rx + pad) * 2, h: (ry + pad) * 2 },
            fn: (c) => { c.beginPath(); c.ellipse(cx, cy, rx + th / 2, ry + th / 2, 0, 0, 7); c.ellipse(cx, cy, rx - th / 2, ry - th / 2, 0, 0, 7); c.fill('evenodd'); },
        };
    }
    // the font for printed text (UI, labels): the brand's, else a sans
    const font = (w, px, mono) => `${w} ${px}px "${mono ? BRAND.mono : BRAND.font}", sans-serif`;
    function print(g, str, x, y, px, col, o = {}) {
        g.save();
        g.font = font(o.weight ?? 500, px, o.mono);
        g.fillStyle = col;
        g.textAlign = o.align ?? 'left';
        g.textBaseline = o.base ?? 'alphabetic';
        g.globalAlpha *= o.alpha ?? 1;
        g.fillText(str, x, y);
        g.restore();
    }

    // ---------------------------------------------------------------- the brand mark in clay
    function mark(g, x, y, s, key = 'mark', col) {
        put(g, x, y, s, 0, () => BRAND.mark(g, (c, pts, color, k) => P(g, key + k, pts, col ?? color, { bevel: 6, shine: 0.6, prints: 1, marks: 0, shadowBlur: 5, shadowOffset: [3, 5] })));
    }

    // ---------------------------------------------------------------- hands
    // Chunky clay hands: four fingers and a thumb, each its own sausage with a nail.
    // Local frame: wrist at (0, 0), palm width ≈ 64. Drawn as her RIGHT hand; side 'left'
    // mirrors.
    //   'rest'      lying on the desk seen from the front: the back of the hand, the fingers
    //               towards the camera (short, tips down, nails), the thumb on the inner side
    //   'pointBack' pointing seen from the back (POV): fingers up (-y), the index out with its
    //               nail, the other three folded (knuckle bumps), the thumb along the -x side
    function nail(g, key, x, y, rot, w, h) {
        put(g, x, y, 1, rot, () => P(g, key, C.bean(0, 0, w, h, key, 0.3), '#f7d2bd', small({ bevel: 1.8, shine: 1, shadow: 0.35, shadowBlur: 1.5, shadowOffset: [0.6, 1.2] })));
    }
    function hand(g, pose, side, x, y, s, rot, v = 0, cuff = COL.cream) {
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        g.scale(side === 'left' ? -s : s, s);
        const o = (k) => ({ variant: v, bevel: 6, shine: 0.55, prints: k, marks: 1, shadowBlur: 5, shadowOffset: [3, 5] });
        const sk = COL.skin, key = 'hand-' + pose;
        if (pose === 'rest') {
            // the cuff, the back of the hand, then the four fingers ON it, curling towards the
            // camera (from the knuckles down to the tips, nails at the bottom), the thumb inside
            P(g, key + 'cuff', C.lumpy(C.roundRect(-36, -34, 72, 34, 13), 'cuff', 1), cuff, { ...o(0), bevel: 7 });
            P(g, key + 'back' + v, C.lumpy([[-32, -6], [0, -10], [32, -6], [36, 12], [30, 26], [0, 30], [-30, 26], [-36, 12]], key + 'back' + v, 1.2), sk, o(1));
            P(g, key + 'th' + v, C.lumpy(C.capsule([[28, 2], [42, 18], [44, 34]], [11, 9.5]), key + 'th' + v, 0.6), C.shade(sk, -4), o(0));
            nail(g, key + 'thn', 44, 35, -0.2, 11, 8);
            [[-21, 44, 10.5], [-6, 48, 11.5], [9, 47, 11], [23, 42, 9.5]].forEach(([fx, fy, r], i) => {
                P(g, key + 'f' + i + v, C.lumpy(C.capsule([[fx + 1, fy - 34], [fx, fy - 16], [fx - 1, fy]], [r, r * 0.95]), key + 'f' + i + v, 0.5), C.shade(sk, 2 - i * 2), o(0));
                nail(g, key + 'n' + i, fx - 1, fy + 2, 0, r * 1.2, r * 0.9);
            });
        } else if (pose === 'pointBack') {
            P(g, key + 'cuff', C.lumpy(C.roundRect(-38, -2, 76, 44, 15), 'cuffp', 1.2), cuff, { ...o(0), bevel: 8 });
            P(g, key + 'idx' + v, C.lumpy(C.capsule([[-18, -50], [-21, -92], [-23, -126]], [12.5, 11]), key + 'idx' + v, 0.5), C.shade(sk, 1), o(1));
            nail(g, key + 'idxn', -23, -121, -0.05, 13, 16);
            [[-2, -62, 12], [13, -60, 11.5], [26, -54, 10.5]].forEach(([fx, fy, r], i) => P(g, key + 'k' + i + v, C.bean(fx, fy, r * 2.1, r * 1.8, key + 'k' + i + v, 0.5), C.shade(sk, -3 - i * 2), o(0)));
            P(g, key + 'back' + v, C.lumpy([[-32, 4], [-34, -28], [-28, -54], [-8, -66], [12, -64], [32, -52], [36, -24], [32, 4]], key + 'backp' + v, 1.2), sk, o(2));
            P(g, key + 'th' + v, C.lumpy(C.capsule([[-30, -14], [-42, -38], [-42, -56]], [11.5, 10]), key + 'thp' + v, 0.6), C.shade(sk, -5), o(0));
            nail(g, key + 'thnp', -42, -53, -0.1, 10, 12);
        }
        g.restore();
    }

    // ---------------------------------------------------------------- Laura
    // Local frame: the centre of her head at (0, 0).
    // o: { look: [x, y] (-1..1), blink, mouth: 'smile' | 'o' | 'grin', tilt, v (boil) }
    function lauraBody(g, x, y, s, o = {}) {
        const v = o.v ?? 0, ov = (k = {}) => ({ variant: v, bevel: 9, shine: 0.4, prints: 3, marks: 3, ...k });
        put(g, x, y, s, 0, () => {
            P(g, 'l-body' + v, C.lumpy([[-164, 150], [-132, 114], [-56, 102], [56, 102], [132, 114], [164, 150], [182, 360], [-182, 360]], 'lbody' + v, 3), COL.navy, ov({ bevel: 16, marks: 12, prints: 5 }));
            // knit pressed in with a tool: rows of little V marks
            g.save();
            g.strokeStyle = 'rgba(20,30,70,0.35)';
            g.lineWidth = 1.6;
            g.lineCap = 'round';
            for (let r = 0; r < 7; r++) for (let c = -5; c <= 5; c++) {
                const kx = c * 26 + (r % 2) * 13, ky = 150 + r * 28;
                if (Math.abs(kx) < 50 && ky < 200) continue;
                g.beginPath();
                g.moveTo(kx - 5, ky - 4);
                g.lineTo(kx, ky + 3);
                g.lineTo(kx + 5, ky - 4);
                g.stroke();
            }
            g.restore();
            P(g, 'l-shirt', C.lumpy([[-44, 102], [44, 102], [0, 200]], 'lshirt', 1.2), COL.shirt, ov({ bevel: 5, prints: 1 }));
            P(g, 'l-neck', C.capsule([[0, 70], [0, 110]], 27), COL.skinDark, ov({ bevel: 6, prints: 0 }));
            for (const sd of [-1, 1]) P(g, 'l-collar' + sd, C.lumpy([[sd * 4, 100], [sd * 54, 94], [sd * 42, 142]], 'lcol' + sd, 1), COL.shirt, ov({ bevel: 5, prints: 0 }));
            [212, 256, 300].forEach((by, i) => P(g, 'l-btn' + i, C.bean(0, by, 17, 16, 'btn' + i, 0.6), COL.coral, small({ bevel: 4 })));
        });
    }
    function lauraHead(g, x, y, s, o = {}) {
        const v = o.v ?? 0, ov = (k = {}) => ({ variant: v, bevel: 9, shine: 0.45, prints: 3, marks: 3, ...k });
        put(g, x, y, s, o.tilt ?? 0, () => {
            P(g, 'l-bun' + v, C.bean(0, -140, 88, 78, 'bun' + v, 2), COL.hair, ov({ bevel: 11 }));
            for (const sd of [-1, 1]) P(g, 'l-ear' + sd, C.bean(sd * 92, 14, 28, 40, 'ear' + sd, 1), COL.skinDark, ov({ bevel: 6, prints: 0 }));
            // earrings: coral balls
            for (const sd of [-1, 1]) P(g, 'l-earring' + sd, C.bean(sd * 94, 40, 13, 13, 'ering' + sd, 0.3), COL.coral, small());
            P(g, 'l-head' + v, C.lumpy(C.ellipse(0, 0, 92, 104, 16), 'head' + v, 1.6), COL.skin, ov({ bevel: 13, shine: 0.5, prints: 4 }));
            const hair = [[-100, 34], [-106, -26], [-84, -84], [-34, -112], [26, -114], [80, -88], [106, -30], [100, 34], [86, 44], [82, -6], [60, -40], [14, -56], [-10, -50], [-44, -60], [-78, -24], [-86, 44]];
            P(g, 'l-hair' + v, C.lumpy(hair, 'hair' + v, 1.5), COL.hair, ov({ bevel: 11, shine: 0.35, marks: 8 }));
            // carved strands
            g.save();
            g.strokeStyle = 'rgba(38,18,10,0.5)';
            g.lineWidth = 2.2;
            g.lineCap = 'round';
            for (const [a, b, c] of [[[-8, -54], [-40, -96], [-72, -78]], [[4, -58], [22, -102], [62, -92]], [[22, -54], [58, -80], [92, -46]], [[-30, -60], [-66, -72], [-90, -18]], [[-4, -120], [0, -150], [18, -168]]]) {
                g.beginPath();
                g.moveTo(...a);
                g.quadraticCurveTo(...b, ...c);
                g.stroke();
            }
            g.restore();
            // blush
            for (const sd of [-1, 1]) {
                const gr = g.createRadialGradient(sd * 58, 44, 0, sd * 58, 44, 24);
                gr.addColorStop(0, 'rgba(238,118,104,0.42)');
                gr.addColorStop(1, 'rgba(238,118,104,0)');
                g.fillStyle = gr;
                g.fillRect(sd * 58 - 26, 18, 52, 52);
            }
            // eyes: white balls, pupils that look, lids that blink (skin lids pressed on)
            const [lx, ly] = o.look ?? [0, 0];
            for (const sd of [-1, 1]) {
                const ex = sd * 36;
                P(g, 'l-eye' + sd, C.bean(ex, 0, 40, 46, 'eye' + sd, 0.4), '#fbf8f2', small({ bevel: 5, shine: 0.9, speckle: 0.1 }));
                if (o.blink) {
                    P(g, 'l-lid' + sd, C.lumpy([[ex - 22, -22], [ex + 22, -22], [ex + 23, 4], [ex, 10], [ex - 23, 4]], 'lid' + sd, 0.5), COL.skin, small({ bevel: 4 }));
                    g.save();
                    g.strokeStyle = 'rgba(60,30,20,0.7)';
                    g.lineWidth = 2.4;
                    g.beginPath();
                    g.moveTo(ex - 18, 4);
                    g.quadraticCurveTo(ex, 11, ex + 18, 4);
                    g.stroke();
                    g.restore();
                } else {
                    put(g, ex + lx * 8, 3 + ly * 9, 1, 0, () => P(g, 'l-pupil', C.ellipse(0, 0, 9.5, 11, 14), '#1c1a22', small({ bevel: 3, shine: 1.2, shadow: false })));
                }
            }
            // glasses: two rings of black clay, a bridge, arms to the ears
            for (const sd of [-1, 1]) P(g, 'l-glass' + sd, ring(sd * 38, 2, 31, 28, 6), '#26222a', small({ bevel: 2.5, shine: 1, shadowBlur: 3, shadowOffset: [2, 4] }));
            P(g, 'l-bridge', C.capsule([[-8, -2], [0, -5], [8, -2]], 3), '#26222a', small({ bevel: 1.5 }));
            for (const sd of [-1, 1]) P(g, 'l-garm' + sd, C.capsule([[sd * 69, -4], [sd * 88, -2]], 3), '#26222a', small({ bevel: 1.5 }));
            // nose and mouth
            P(g, 'l-nose', C.bean(0, 34, 24, 20, 'nose', 0.6), C.shade(COL.skin, -4), small({ bevel: 5, shine: 0.8 }));
            const m = o.mouth ?? 'smile';
            if (m === 'smile') P(g, 'l-smile', C.capsule([[-26, 60], [-12, 68], [0, 70], [12, 68], [26, 60]], [3.4, 3.4]), '#7a2e26', small({ bevel: 1.4, shine: 0.3, shadow: false }));
            else if (m === 'o') P(g, 'l-o', C.bean(0, 66, 22, 26, 'mo', 0.5), '#5a1f1c', small({ bevel: 3, shadow: false }));
            else {
                P(g, 'l-grin', C.lumpy([[-32, 56], [32, 56], [22, 78], [0, 86], [-22, 78]], 'grin', 0.6), '#5a1f1c', small({ bevel: 3, shadow: false }));
                P(g, 'l-teeth', C.lumpy([[-26, 58], [26, 58], [22, 66], [-22, 66]], 'teeth', 0.3), '#fbf8f2', small({ bevel: 1.5, shadow: false }));
            }
        });
    }
    // her arms resting on the desk (behind the hands); wrists world positions
    function lauraArms(g, x, y, s, v = 0) {
        put(g, x, y, s, 0, () => {
            // upper arm and forearm as two sausages (one bent sausage crosses itself)
            for (const sd of [-1, 1]) {
                P(g, 'l-uarm' + sd + v, C.lumpy(C.capsule([[sd * 140, 140], [sd * 170, 262]], [40, 36]), 'uarm' + sd + v, 1.5), COL.navy, { variant: v, bevel: 12, shine: 0.35, prints: 2, marks: 5 });
                P(g, 'l-farm' + sd + v, C.lumpy(C.capsule([[sd * 170, 262], [sd * 116, 292]], [35, 32]), 'farm' + sd + v, 1.2), C.shade(COL.navy, 4), { variant: v, bevel: 11, shine: 0.4, prints: 1, marks: 3 });
            }
        });
    }

    // ---------------------------------------------------------------- the set
    function wall(g, v = 0) {
        g.fillStyle = COL.wall;
        g.fillRect(-100, -100, 1800, 800);
        P(g, 'set-wall', C.lumpy(C.roundRect(-60, -60, 1720, 740, 30), 'wall', 3, 4), COL.wall, { bevel: 16, shine: 0.15, shadow: false, prints: 10, marks: 60, speckle: 0.5 });
        // wallpaper: little clay dots pressed in a grid
        for (let r = 0; r < 7; r++) for (let c = 0; c < 18; c++) {
            const x = 40 + c * 92 + (r % 2) * 46, y = 50 + r * 90;
            if (x > 70 && x < 440 && y < 470) continue;
            P(g, 'set-dot' + ((r + c) % 3), C.bean(0, 0, 13, 11, 'dot' + ((r + c) % 3), 0.5), ['#a6c9b8', '#d7e7de', '#e6c6a0'][(r + c) % 3], small({ bevel: 2.5, shadowBlur: 2, shadowOffset: [1, 2] }));
        }
    }
    function window_(g, tq) {
        // frame, sky, a clay cloud drifting, hills, the cross bars; a curtain
        P(g, 'win-frame', C.lumpy(C.roundRect(90, 70, 340, 380, 26), 'wframe', 2), COL.cream, { bevel: 12, shine: 0.4, prints: 3 });
        P(g, 'win-sky', C.roundRect(116, 96, 288, 328, 14), COL.sky, { bevel: 10, shine: 0.1, prints: 0, marks: 2, shadow: false });
        g.save();
        g.beginPath();
        g.rect(116, 96, 288, 328);
        g.clip();
        P(g, 'win-hill1', C.lumpy(C.ellipse(190, 440, 170, 90, 16), 'hill1', 3), COL.leaf, { bevel: 10, shine: 0.3, shadow: false });
        P(g, 'win-hill2', C.lumpy(C.ellipse(360, 450, 150, 80, 16), 'hill2', 3), C.shade(COL.leaf, 12), { bevel: 10, shine: 0.3, shadow: false });
        const cx = 200 + ((tq * 6) % 80);
        put(g, cx, 170, 1, 0, () => P(g, 'win-cloud', { box: { x: -70, y: -40, w: 140, h: 80 }, fn: (c) => { c.beginPath(); for (const [x, y, r] of [[-38, 10, 26], [0, -4, 34], [38, 10, 24], [0, 16, 26]]) { c.moveTo(x + r, y); c.arc(x, y, r, 0, 7); } c.fill(); } }, '#fbfbf7', { bevel: 8, shine: 0.6 }));
        g.restore();
        P(g, 'win-bar-v', C.roundRect(252, 96, 16, 328, 6), COL.cream, { bevel: 5, shine: 0.3 });
        P(g, 'win-bar-h', C.roundRect(116, 250, 288, 16, 6), COL.cream, { bevel: 5, shine: 0.3 });
        P(g, 'win-sill', C.lumpy(C.roundRect(70, 440, 380, 34, 12), 'sill', 1.5), COL.cream, { bevel: 8, shine: 0.4 });
        // a cactus in a pot on the sill
        P(g, 'win-cactus', C.lumpy(C.capsule([[380, 430], [380, 372]], 16), 'cactus', 1), COL.leaf, { bevel: 7, shine: 0.4 });
        P(g, 'win-pot', C.lumpy([[354, 410], [406, 410], [398, 446], [362, 446]], 'pot', 1), COL.terracotta, { bevel: 6, shine: 0.4 });
        // curtain
        P(g, 'win-curtain', C.lumpy([[40, 50], [120, 50], [110, 200], [132, 340], [96, 470], [30, 470]], 'curtain', 4), '#f0b59a', { bevel: 14, shine: 0.3, marks: 10 });
        g.save();
        g.strokeStyle = 'rgba(150,70,50,0.35)';
        g.lineWidth = 3;
        g.lineCap = 'round';
        for (const x of [60, 84, 104]) { g.beginPath(); g.moveTo(x, 70); g.quadraticCurveTo(x + 8, 260, x - 4, 450); g.stroke(); }
        g.restore();
        P(g, 'win-rod', C.capsule([[20, 52], [470, 52]], 7), COL.wood, small({ bevel: 3 }));
    }
    function shelf(g) {
        P(g, 'sh-board', C.lumpy(C.roundRect(1040, 250, 400, 26, 10), 'board', 1.5), COL.wood, { bevel: 8, shine: 0.3, marks: 6 });
        const books = [[1060, 44, 150, COL.navy], [1108, 36, 128, COL.coral], [1148, 40, 140, COL.mustard], [1192, 30, 118, COL.green], [1226, 44, 146, COL.cream]];
        books.forEach(([x, w, h, col], i) => {
            P(g, 'sh-book' + i, C.lumpy(C.roundRect(x, 250 - h, w, h, 7), 'book' + i, 1), col, { bevel: 7, shine: 0.4, prints: 1 });
            P(g, 'sh-band' + i, C.roundRect(x + 4, 250 - h + 22, w - 8, 8, 3), C.shade(col, -22), small({ bevel: 2, shadow: false }));
        });
        put(g, 1320, 250, 1, 0.34, () => P(g, 'sh-lean', C.lumpy(C.roundRect(-10, -120, 34, 120, 7), 'lean', 1), '#8c6bb0', { bevel: 7, shine: 0.4 }));
        // a plant: pot and leaves
        P(g, 'sh-pot', C.lumpy([[1370, 190], [1430, 190], [1420, 250], [1380, 250]], 'shpot', 1), COL.terracotta, { bevel: 7, shine: 0.4 });
        [[1380, 150, -0.6], [1400, 140, 0], [1422, 152, 0.6], [1392, 170, -0.9], [1414, 170, 0.9]].forEach(([x, y, a], i) =>
            put(g, x, y, 1, a, () => P(g, 'sh-leaf' + i, C.lumpy(C.ellipse(0, 0, 14, 34, 10), 'leaf' + i, 1), C.shade(COL.leaf, i * 4 - 6), small({ bevel: 5 }))));
    }
    function clock(g, tq, X = 1230, Y = 470, S = 1) {
        g.save();
        g.translate(X - 1230 * S, Y - 470 * S);
        g.scale(S, S);
        P(g, 'ck-face', C.bean(1230, 470, 150, 150, 'ckface', 1), '#fbf8f2', { bevel: 10, shine: 0.6 });
        P(g, 'ck-rim', ring(1230, 470, 72, 72, 14), COL.coral, { bevel: 6, shine: 0.6 });
        g.save();
        for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; put(g, 1230 + Math.cos(a) * 52, 470 + Math.sin(a) * 52, 1, 0, () => P(g, 'ck-tick' + (i % 3 ? 's' : 'b'), C.bean(0, 0, i % 3 ? 7 : 11, i % 3 ? 7 : 11, 'tick', 0.2), COL.ink, small({ bevel: 1.5, shadow: 0.4 }))); }
        g.restore();
        const sec = Math.floor(tq * 2) / 2;
        put(g, 1230, 470, 1, -0.6, () => P(g, 'ck-hour', C.capsule([[0, 4], [0, -34]], [5, 4]), COL.ink, small({ bevel: 2 })));
        put(g, 1230, 470, 1, 1.9, () => P(g, 'ck-min', C.capsule([[0, 4], [0, -48]], [4, 3]), COL.ink, small({ bevel: 2 })));
        put(g, 1230, 470, 1, sec * Math.PI / 15, () => P(g, 'ck-sec', C.capsule([[0, 8], [0, -52]], 1.8), COL.coral, small({ bevel: 1 })));
        P(g, 'ck-pin', C.bean(1230, 470, 12, 12, 'pin', 0.2), COL.coral, small());
        g.restore();
    }
    function desk(g) {
        P(g, 'dk-top', C.lumpy(C.roundRect(-60, 600, 1720, 70, 22), 'dtop', 3, 4), COL.desk, { bevel: 12, shine: 0.35, prints: 6, marks: 40, shadowOffset: [0, -8] });
        P(g, 'dk-front', C.lumpy(C.roundRect(-60, 656, 1720, 300, 20), 'dfront', 3, 4), COL.deskFront, { bevel: 14, shine: 0.2, prints: 5, marks: 50, shadow: false });
        // grain: long pressed lines
        g.save();
        g.strokeStyle = 'rgba(110,60,25,0.25)';
        g.lineWidth = 2;
        g.lineCap = 'round';
        for (const [y, x0, x1] of [[620, 60, 520], [640, 700, 1400], [700, 100, 800], [760, 900, 1560], [820, 40, 600], [880, 700, 1300]]) {
            g.beginPath();
            g.moveTo(x0, y);
            g.bezierCurveTo(x0 + 150, y - 6, x1 - 150, y + 6, x1, y);
            g.stroke();
        }
        g.restore();
    }
    // the laptop from behind (its lid towards the camera) with the brand sticker
    function laptopBack(g, X = 880) {
        // a thin lid (a slab, not a cushion): small bevel, a hinge strip, the base's edge
        P(g, 'lp-base', C.lumpy(C.roundRect(X - 140, 598, 280, 18, 7), 'lpbase', 0.8), C.shade(COL.grey, -12), { bevel: 4, shine: 0.6 });
        P(g, 'lp-lid', C.lumpy(C.roundRect(X - 128, 430, 256, 170, 12), 'lplid', 0.8, 5), COL.grey, { bevel: 5, soft: 4, shine: 0.8, prints: 2, marks: 2, shadowBlur: 10 });
        P(g, 'lp-hinge', C.roundRect(X - 120, 588, 240, 10, 4), C.shade(COL.grey, -25), small({ bevel: 2, shadow: false }));
        P(g, 'lp-sticker', C.bean(X, 508, 76, 76, 'lpstk', 0.8), COL.cream, small({ bevel: 4 }));
        mark(g, X, 510, 0.48, 'lpmark');
    }
    // the desk's drawer, a notebook with a pencil, a potted plant in the foreground
    function deskDetails(g) {
        P(g, 'dk-drawer', C.lumpy(C.roundRect(760, 700, 420, 130, 16), 'drawer', 1.5), C.shade(COL.deskFront, 4), { bevel: 10, shine: 0.3, marks: 8, shadow: 0.5 });
        P(g, 'dk-knob', C.bean(970, 764, 44, 30, 'knob', 0.6), COL.coral, small({ bevel: 5 }));
        put(g, 440, 618, 1, -0.05, () => {
            P(g, 'nb-body', C.lumpy(C.roundRect(-70, -14, 140, 24, 6), 'nb', 0.6), COL.mustard, small({ bevel: 4 }));
            P(g, 'nb-pages', C.roundRect(-64, -22, 128, 10, 3), COL.paper, small({ bevel: 2 }));
        });
        put(g, 450, 596, 1, 0.08, () => P(g, 'nb-pencil', C.capsule([[-80, 0], [70, 0]], 6), COL.coral, small({ bevel: 3 })));
    }
    function plant(g, x, y, s) {
        put(g, x, y, s, 0, () => {
            [[-90, -240, -0.7], [-30, -290, -0.2], [40, -280, 0.3], [100, -220, 0.8], [-120, -150, -1.1], [130, -140, 1.1], [0, -200, 0]].forEach(([lx, ly, a], i) =>
                put(g, lx * 0.6, ly * 0.55, 1, a, () => {
                    P(g, 'pl-leaf' + i, C.lumpy(C.ellipse(0, -70, 34, 90, 14), 'pleaf' + i, 2), C.shade(COL.leaf, (i % 3) * 7 - 8), { bevel: 9, shine: 0.6, prints: 1 });
                    P(g, 'pl-vein' + i, C.capsule([[0, -10], [0, -140]], 2.4), C.shade(COL.leaf, -28), small({ bevel: 1, shadow: false }));
                }));
            P(g, 'pl-pot', C.lumpy([[-110, -40], [110, -40], [90, 150], [-90, 150]], 'ppot', 2), COL.terracotta, { bevel: 14, shine: 0.45, prints: 3, marks: 6 });
            P(g, 'pl-rim', C.lumpy(C.roundRect(-122, -60, 244, 40, 14), 'prim', 1.5), C.shade(COL.terracotta, 8), { bevel: 9, shine: 0.5 });
        });
    }
    function mug(g, x, y) {
        P(g, 'mug-handle', ring(x + 40, y - 30, 16, 20, 11), COL.cream, { bevel: 4, shine: 0.6 });
        P(g, 'mug-body', C.lumpy(C.roundRect(x - 40, y - 84, 80, 90, 16), 'mug', 1), COL.cream, { bevel: 9, shine: 0.7 });
        P(g, 'mug-band', C.roundRect(x - 40, y - 58, 80, 14, 4), COL.coral, small({ bevel: 3, shadow: false }));
        P(g, 'mug-coffee', C.ellipse(x, y - 80, 32, 7, 14), '#5a3a2a', small({ bevel: 2, shadow: false }));
    }
    function penCup(g, x, y) {
        [[-18, -130, COL.coral], [0, -144, COL.mustard], [18, -126, COL.navy]].forEach(([dx, h, col], i) => {
            P(g, 'pc-pen' + i, C.capsule([[x + dx, y - 40], [x + dx * 1.3, y + h + 60]], 7), col, small({ bevel: 3 }));
            P(g, 'pc-tip' + i, C.bean(x + dx * 1.3, y + h + 56, 12, 16, 'tip' + i, 0.3), '#f1d3a8', small({ bevel: 2 }));
        });
        P(g, 'pc-cup', C.lumpy(C.roundRect(x - 40, y - 70, 80, 76, 14), 'pcup', 1), COL.green, { bevel: 9, shine: 0.6, prints: 2 });
    }
    function papers(g, x, y) {
        [0, 1, 2].forEach((i) => put(g, x + (i % 2) * 6, y - i * 9, 1, (i - 1) * 0.04, () => P(g, 'pp' + i, C.lumpy(C.roundRect(-80, -8, 160, 14, 4), 'pp' + i, 0.6), i === 1 ? '#f3e6c6' : COL.paper, small({ bevel: 3 }))));
    }

    // ---------------------------------------------------------------- the invoice
    // A slab of cream clay with the invoice pressed on it in ink. Local frame: centre at 0,
    // 400 × 540 units. `stamped`: QR and the green label.
    function qr(g, x, y, sz, seed) {
        const r = Motion.rng('qr' + seed), n = 21, cs = sz / n;
        g.fillStyle = COL.ink;
        for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
            const inF = (a, b) => a < 7 && b < 7;
            const f = inF(i, j) || inF(n - 1 - i, j) || inF(i, n - 1 - j);
            if (f) {
                const fi = Math.min(i, n - 1 - i) < 7 ? (i < 7 ? i : n - 1 - i) : i, fj = j < 7 ? j : n - 1 - j;
                const d = Math.max(Math.abs(fi - 3), Math.abs(fj - 3));
                if (d === 3 || d <= 1) g.fillRect(x + i * cs, y + j * cs, cs + 0.2, cs + 0.2);
            } else if (r() < 0.5) g.fillRect(x + i * cs, y + j * cs, cs + 0.2, cs + 0.2);
        }
    }
    function invoicePrint(c, stamped) {
        const cp = BRAND.copy, cl = BRAND.col;
        const W = 400, H = 540, x0 = -W / 2 + 34, x1 = W / 2 - 34;
        print(c, cp.invoice, x1, -H / 2 + 60, 26, cl.navy, { weight: 700, align: 'right' });
        print(c, cp.number, x1, -H / 2 + 84, 15, COL.grey, { mono: true, align: 'right' });
        print(c, cp.client, x0, -H / 2 + 130, 13, COL.grey);
        print(c, cp.clientName, x0, -H / 2 + 154, 20, COL.ink, { weight: 700 });
        c.fillStyle = 'rgba(42,37,48,0.15)';
        c.fillRect(x0, -H / 2 + 172, x1 - x0, 2);
        cp.lines.forEach(([l, a], i) => {
            print(c, l, x0, -H / 2 + 206 + i * 30, 15, COL.ink);
            print(c, a, x1, -H / 2 + 206 + i * 30, 15, COL.ink, { mono: true, align: 'right' });
        });
        print(c, cp.base, x0 + 120, -H / 2 + 316, 12, COL.grey);
        print(c, cp.baseValue, x1, -H / 2 + 316, 12, COL.ink, { mono: true, align: 'right' });
        print(c, cp.tax, x0 + 120, -H / 2 + 336, 12, COL.grey);
        print(c, cp.taxValue, x1, -H / 2 + 336, 12, COL.ink, { mono: true, align: 'right' });
        c.fillStyle = 'rgba(210,86,63,0.12)';
        c.fillRect(x0, -H / 2 + 350, x1 - x0, 40);
        print(c, cp.total, x0 + 10, -H / 2 + 377, 18, COL.ink, { weight: 700 });
        print(c, cp.amount, x1 - 8, -H / 2 + 378, 22, cl.brand, { weight: 700, mono: true, align: 'right' });
        if (stamped) {
            qr(c, x0, H / 2 - 124, 92, 'inv');
            c.fillStyle = cl.green;
            c.fillRect(x0 + 108, H / 2 - 110, 150, 30);
            print(c, 'VERI*FACTU', x0 + 118, H / 2 - 89, 16, '#fff', { weight: 700 });
            print(c, cp.number + ' · #a41', x0 + 108, H / 2 - 56, 12, COL.grey, { mono: true });
        } else {
            c.strokeStyle = 'rgba(42,37,48,0.25)';
            c.setLineDash([6, 6]);
            c.lineWidth = 2;
            c.strokeRect(x0, H / 2 - 124, 92, 92);
            c.setLineDash([]);
        }
    }
    function invoice(g, stamped, v = 0) {
        P(g, 'inv-slab' + v, C.lumpy(C.roundRect(-200, -270, 400, 540, 18), 'inv' + v, 1.6, 5), COL.paper, { variant: v, bevel: 9, shine: 0.45, prints: 4, marks: 6, speckle: 0.35, shadowBlur: 12, shadowOffset: [8, 14] });
        const m = g.getTransform(), px = Math.hypot(m.a, m.b), res = [0.5, 0.75, 1, 1.5, 2, 3].find((r) => r >= px) ?? 3;
        Motion.sprite('inv-print' + (stamped ? 's' : ''), { x: -200, y: -270, w: 400, h: 540 }, res, (c) => invoicePrint(c, stamped)).draw(g);
        mark(g, -126, -214, 0.42, 'invmark');
    }
    // the sheet folding into a plane: four drawings on twos (0 = the sheet ... 3 = the plane)
    const FOLD = [
        [[-200, -270], [200, -270], [200, 270], [-200, 270]],
        [[0, -300], [200, -110], [200, 270], [-200, 270], [-200, -110]],
        [[0, -310], [110, -40], [96, 270], [-96, 270], [-110, -40]],
        [[0, -300], [46, 60], [150, 250], [0, 180], [-150, 250], [-46, 60]],
    ];
    // straight edges subdivided, so the rounding of the outline keeps the folded corners
    const dense = (pts, n = 4) => pts.flatMap((p, i) => { const q = pts[(i + 1) % pts.length]; return [...Array(n)].map((_, k) => [p[0] + (q[0] - p[0]) * k / n, p[1] + (q[1] - p[1]) * k / n]); });
    function fold(g, d) {
        P(g, 'fold' + d, C.lumpy(dense(FOLD[d]), 'fold' + d, 1, 3), COL.paper, { bevel: 8, shine: 0.5, prints: 2, shadowBlur: 10, shadowOffset: [8, 12] });
        g.save();
        g.strokeStyle = 'rgba(120,90,60,0.35)';
        g.lineWidth = 3;
        g.lineCap = 'round';
        g.beginPath();
        if (d === 1) { g.moveTo(-200, -110); g.lineTo(200, -110); }
        if (d >= 2) { g.moveTo(0, -300); g.lineTo(0, d === 3 ? 180 : 270); }
        g.stroke();
        g.restore();
        if (d === 3) P(g, 'fold-stripe', C.capsule([[-100, 214], [0, 150], [100, 214]], 7), COL.coral, small({ bevel: 3, shadow: false }));
    }

    // ---------------------------------------------------------------- the stamp
    function stamp(g, x, y, s, rot, v = 0) {
        put(g, x, y, s, rot, () => {
            P(g, 'st-knob' + v, C.bean(0, -210, 86, 70, 'knob' + v, 1.5), COL.wood, { variant: v, bevel: 10, shine: 0.6, marks: 6 });
            P(g, 'st-neck', C.lumpy(C.roundRect(-20, -190, 40, 100, 12), 'neck', 1), C.shade(COL.wood, -10), { bevel: 7, shine: 0.5, marks: 4 });
            P(g, 'st-block', C.lumpy(C.roundRect(-86, -100, 172, 72, 16), 'block', 1.5), COL.wood, { bevel: 10, shine: 0.55, marks: 8 });
            P(g, 'st-rubber', C.lumpy(C.roundRect(-80, -34, 160, 32, 8), 'rubber', 1), COL.coral, { bevel: 6, shine: 0.7 });
            mark(g, 0, -64, 0.5, 'stmark', COL.cream);
        });
    }

    // ---------------------------------------------------------------- the mailbox
    function mailbox(g, x, y, s, flag, shake = 0) {
        put(g, x + shake, y, s, 0, () => {
            P(g, 'mb-body', C.lumpy([[-110, 0], [-112, -150], [-92, -218], [-46, -250], [0, -258], [46, -250], [92, -218], [112, -150], [110, 0]], 'mbbody', 2), COL.navy, { bevel: 16, shine: 0.55, prints: 4, marks: 8 });
            P(g, 'mb-slot', C.lumpy(C.roundRect(-70, -196, 140, 26, 12), 'mbslot', 0.8), '#14183a', { bevel: 7, shine: 0.2, shadow: false });
            P(g, 'mb-label', C.lumpy(C.roundRect(-64, -130, 128, 60, 12), 'mblabel', 1), COL.cream, small({ bevel: 5 }));
            print(g, BRAND.copy.office, 0, -88, 34, COL.navy, { weight: 700, align: 'center' });
            P(g, 'mb-foot', C.lumpy(C.roundRect(-100, -6, 200, 20, 8), 'mbfoot', 1), '#1a2458', { bevel: 5 });
            // the flag on its post: rotates from lying (0) to up (1)
            put(g, 104, -60, 1, -flag * Math.PI / 2, () => {
                P(g, 'mb-post', C.capsule([[0, 0], [76, 0]], 7), COL.grey, small({ bevel: 3 }));
                P(g, 'mb-flag', C.lumpy(C.roundRect(52, -44, 44, 38, 8), 'mbflag', 0.8), COL.coral, small({ bevel: 5 }));
            });
            P(g, 'mb-pivot', C.bean(104, -60, 18, 18, 'mbpiv', 0.2), COL.grey, small());
        });
    }

    return { COL, put, P, small, ring, print, mark, hand, lauraBody, lauraHead, lauraArms, wall, window_, shelf, clock, desk, laptopBack, deskDetails, plant, mug, penCup, papers, invoice, invoicePrint, fold, stamp, mailbox, qr };
})();
