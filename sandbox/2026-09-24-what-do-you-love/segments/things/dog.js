// Montage object «dog» (see ../things.js for the contract).
(() => {
    const P = Paper, E = Ease, C = WL.COL;
    const { place, cut, circleU } = Things.kit;
    // Dog: measured piece by piece on the reference (12.3 s). Authored in "crop pixels" (a
    // 1000² view of the reference crop 700,500 → 2000,1800 at 2160 px), origin at (560, 600);
    // on the card it is drawn at s = 0.602, which maps it back 1:1.
    const DOG = { body: '#c39969', haunch: '#ae825d', ear: '#7a503a', cream: '#ecdcb8', muzzle: '#e8d1a7', collar: '#cc3a40', tag: '#efd443', tongue: '#e08991', nose: '#2e2629' };
    Things.dog = (g, x, y, s, t) => {
        const sp = (pts, n = 8) => PaperDetail.spline(pts.map(([a, b]) => [a - 560, b - 600]), n);
        const dcut = (pts, col, seed, o = {}) => cut(c0, sp(pts), col, seed, { border: 4.2, shadow: 0.12, step: 2.6, ...o });
        let c0 = null;
        place(g, 'th-dog2', { x: -500, y: -380, w: 920, h: 760 }, (c) => {
            c0 = c;
            const grain = (col, seed, angle) => ({ inner: (cc, box) => PaperDetail.woodGrain(cc, box, col, { seed, angle }) });
            // tail, behind everything
            dcut([[742, 772], [788, 758], [812, 718], [820, 664], [824, 622], [836, 606], [852, 616], [855, 676], [843, 748], [812, 800], [772, 830]], DOG.body, 'dogtail2');
            // body and far front leg in one piece
            dcut([[388, 548], [452, 530], [540, 522], [626, 536], [696, 580], [746, 650], [776, 742], [770, 852], [722, 922], [600, 934], [480, 930], [420, 926], [362, 924], [352, 850], [356, 742], [366, 632]], DOG.body, 'dogbody2');
            // near front leg, its own piece (the chest patch hides its top edge)
            dcut([[362, 684], [424, 684], [436, 780], [434, 912], [396, 924], [354, 920], [350, 800]], DOG.body, 'dogleg2', { shadow: 0.08 });
            // back spot, then the haunch over it
            dcut([[522, 656], [540, 618], [585, 600], [632, 612], [656, 650], [648, 700], [600, 726], [550, 722], [526, 696]], DOG.ear, 'dogspot2', grain(DOG.ear, 'spotg', 0.5));
            dcut([[655, 686], [722, 702], [768, 752], [782, 820], [764, 888], [712, 932], [650, 942], [585, 930], [542, 890], [528, 820], [546, 752], [592, 704]], DOG.haunch, 'doghaunch2');
            // chest patch
            dcut([[404, 574], [438, 588], [452, 650], [450, 730], [432, 782], [402, 790], [374, 764], [364, 690], [368, 616], [382, 584]], DOG.cream, 'dogchest2');
            // paws: near front, far front, back
            dcut([[322, 918], [360, 904], [404, 906], [420, 924], [406, 946], [360, 954], [322, 944], [314, 930]], DOG.cream, 'dogpaw1', { border: 3.6 });
            dcut([[420, 916], [458, 906], [496, 910], [508, 928], [494, 946], [456, 950], [424, 942]], DOG.cream, 'dogpaw2', { border: 3.6 });
            dcut([[514, 914], [560, 900], [630, 900], [668, 914], [672, 936], [640, 952], [572, 956], [522, 944], [510, 928]], DOG.cream, 'dogpaw3', { border: 3.6 });
            // head
            dcut([[232, 330], [290, 276], [370, 260], [446, 284], [488, 350], [492, 430], [458, 500], [382, 526], [300, 512], [242, 462], [216, 396]], DOG.body, 'doghead2');
            // collar round the neck, tag hanging from it
            dcut([[294, 506], [340, 520], [398, 514], [448, 478], [488, 478], [496, 500], [472, 522], [420, 530], [360, 540], [314, 532]], DOG.collar, 'dogcollar2', { border: 3.4 });
            dcut([[370, 544], [388, 551], [392, 569], [380, 584], [360, 584], [349, 569], [353, 551]], DOG.tag, 'dogtag2', { border: 3, inner: (cc) => {
                cc.strokeStyle = PaperDetail.shade(DOG.tag, -18);
                cc.globalAlpha = 0.5;
                cc.lineWidth = 2;
                cc.beginPath();
                cc.arc(370 - 560, 567 - 600, 9, 0, Math.PI * 2);
                cc.stroke();
                cc.globalAlpha = 1;
            } });
            // long ear, over the head and the collar
            dcut([[402, 287], [440, 292], [462, 340], [468, 420], [455, 500], [420, 532], [380, 526], [362, 470], [360, 380], [372, 316]], DOG.ear, 'dogear2', grain(DOG.ear, 'earg', Math.PI / 2 - 0.06));
            // muzzle, lifted towards the flower
            dcut([[118, 258], [160, 238], [225, 238], [276, 262], [302, 310], [290, 360], [242, 382], [180, 370], [130, 332], [110, 292]], DOG.muzzle, 'dogmuzzle2');
            // nose: dark paper with a soft shine
            dcut([[92, 282], [98, 254], [126, 240], [152, 246], [158, 270], [134, 292], [106, 294]], DOG.nose, 'dognose2', { border: 3.2, tex: { alpha: [0.15, 0.3] }, inner: (cc) => {
                cc.fillStyle = 'rgba(255,255,255,0.18)';
                cc.beginPath();
                cc.ellipse(128 - 560, 254 - 600, 12, 6, -0.4, 0, Math.PI * 2);
                cc.fill();
            } });
            // mouth line and tongue
            P.markerStroke(c, PaperDetail.spline([[146, 326], [175, 342], [206, 352]].map(([a, b]) => [a - 560, b - 600]), 6, false), '#6b4a3a', 6, 'dogmouth', 0.9);
            dcut([[198, 362], [226, 358], [236, 378], [228, 396], [208, 398], [197, 382]], DOG.tongue, 'dogtongue2', { border: 2.6, inner: (cc) => P.markerStroke(cc, [[216 - 560, 366 - 600], [216 - 560, 386 - 600]], PaperDetail.shade(DOG.tongue, -14), 2.2, 'tongueline', 0.6) });
            // eye with its catch-light
            c.fillStyle = '#1e1a1d';
            c.beginPath();
            c.arc(297 - 560, 294 - 600, 17, 0, Math.PI * 2);
            c.fill();
            c.fillStyle = '#fff';
            c.beginPath();
            c.arc(291 - 560, 287 - 600, 5.5, 0, Math.PI * 2);
            c.fill();
        }, x, y, s, 0, 0.8);
        // wag: speed lines by the tail flicker on twos in the middle of the card
        const lt = t - 12;
        if (lt > 0.2 && lt < 0.4 && Math.floor(t * 12) % 2 === 0) {
            for (const [a, b] of [[[890, 600], [940, 572]], [[878, 650], [928, 625]], [[866, 700], [916, 677]]]) {
                P.markerStroke(g, [a, b].map(([px, py]) => [x + (px - 560) * s, y + (py - 600) * s]), '#2d2440', 7 * s, 'dogwag' + a[1], 0.95);
            }
        }
    };
})();
