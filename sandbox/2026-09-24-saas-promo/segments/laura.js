// Laura, a freelancer at her desk. Built like the replica's girl: every part is its own
// piece of paper (bun, hair, face, ears, fringe, glasses, brows, neck, shirt collar, knitted
// cardigan with buttons, upper arms, forearms, cuffs, hands).
// (x, y) = centre of the desk edge; s = scale (1 = the medium shot).
// o.eyes: 'open' | 'closed' | 'happy' | 'wink' ; o.look: [dx, dy] (-1..1) ; o.mouth:
// 'smile' | 'o' | 'grin' | 'flat' ; o.tilt ; o.layer: 'body' | 'arms' (a desk between)
// o.arms: [[shoulder, elbow, hand], [..]] ; o.hands: [pose, pose] (PaperDetail.hand poses)
// Global: Laura.
const Laura = (() => {
    const P = Paper, D = PaperDetail;
    const COL = {
        skin: '#e8b48f', cheek: '#ef9a8a', hair: '#4a2c22', hairLight: '#6b4031', cardigan: '#2f4f86',
        shirt: '#fbf7ee', button: '#d2563f', frame: '#2a2530', eye: '#231a1f', lip: '#b8554a',
    };
    const sprite = (...a) => Props.sprite(...a);
    const cut = (c, pts, col, seed, o = {}) => P.cutout(c, pts, col, seed, { border: 2.6, shadow: 0.15, ...o });
    const knitPiece = (c, pts, seed, col = COL.cardigan) => cut(c, pts, col, seed, { tex: { alpha: [0.2, 0.4] }, inner: (cc, box) => D.knit(cc, box, col, { seed, size: 8, alpha: 0.16 }) });

    // [shoulder, elbow, hand] per arm with the desk edge at y = 0
    const ARMS = {
        desk: [[[-118, -250], [-190, -86], [-86, -70]], [[118, -250], [190, -86], [86, -70]]],
        cheer: [[[-118, -250], [-190, -86], [-80, -30]], [[118, -250], [236, -170], [214, -330]]],
        point: [[[-118, -250], [-190, -86], [-80, -30]], [[118, -250], [220, -120], [300, -180]]],
    };
    const HANDS = { desk: ['rest', 'rest'], cheer: ['rest', 'fist'], point: ['rest', 'pointBack'] };

    function segment(g, a, b, w, seed) {
        const key = 'laura-seg:' + seed + [a, b].map(([x, y]) => Math.round(x / 2) + ',' + Math.round(y / 2)).join(';');
        sprite(key, P.bbox([a, b], w + 12), (c) => knitPiece(c, P.noodle([a, b], w, w * 0.92), seed), 1.5).draw(g);
    }

    function draw(g, x, y, s, o = {}) {
        const t = o.t ?? 0, arms = o.arms ?? ARMS[o.pose ?? 'desk'], hands = o.hands ?? HANDS[o.pose ?? 'desk'];
        const body = o.layer !== 'arms', limbs = o.layer !== 'body';
        g.save();
        g.translate(x, y + Math.sin(Math.floor(t * 12) / 12 * 2.4) * 1.5);
        g.scale(s, s);
        if (body) {
            // cardigan body (A-line), shirt collar in the V, two coral buttons
            sprite('laura-torso', { x: -190, y: -300, w: 380, h: 320 }, (c) => {
                knitPiece(c, D.spline([[-118, -268], [-54, -290], [54, -290], [118, -268], [150, -180], [164, 0], [-164, 0], [-150, -180]], 6), 'torso');
                cut(c, [[-44, -286], [0, -196], [44, -286], [22, -290], [0, -250], [-22, -290]], COL.shirt, 'vneck', { border: 1.6, shadow: 0.1 });
                for (const [bx, by] of [[0, -160], [2, -100], [3, -44]]) cut(c, P.ellipse(bx, by, 7.5, 7.5, 24), COL.button, 'btn' + by, { border: 1.4, shadow: 0.25 });
                P.markerStroke(c, [[0, -196], [4, -2]], D.shade(COL.cardigan, -12), 3, 'placket', 0.7);
            }, 1.5).draw(g);
            sprite('laura-neck', { x: -40, y: -350, w: 80, h: 80 }, (c) => cut(c, P.roundRect(-22, -344, 44, 66, 14), COL.skin, 'neck', { border: 0, shadow: 0, tex: { alpha: [0.1, 0.2] } }), 1.6).draw(g);
            sprite('laura-collar', { x: -90, y: -310, w: 180, h: 70 }, (c) => {
                cut(c, [[-4, -290], [-70, -296], [-50, -254]], COL.shirt, 'collarL', { border: 1.6, shadow: 0.2 });
                cut(c, [[4, -290], [70, -296], [50, -254]], COL.shirt, 'collarR', { border: 1.6, shadow: 0.2 });
            }, 1.6).draw(g);
            head(g, o);
        }
        if (limbs) {
            for (let i = 0; i < 2; i++) {
                const [sh, el, hd] = arms[i];
                segment(g, sh, el, 56, 'upper' + i);
                segment(g, el, hd, 50, 'fore' + i);
                const rot = Math.atan2(hd[1] - el[1], hd[0] - el[0]) + Math.PI / 2;
                if (hands[i]) D.hand(g, hd[0], hd[1], 60, rot, hands[i], { skin: COL.skin, side: i === 0 ? 'right' : 'left', cuff: COL.shirt });
            }
        }
        g.restore();
    }

    function head(g, o) {
        const eyes = o.eyes ?? 'open', look = o.look ?? [0, 0], m = o.mouth ?? 'smile';
        g.save();
        g.translate(0, -424);
        g.rotate(o.tilt ?? 0);
        // bun and the hair behind the face, with strands
        sprite('laura-hairback', { x: -150, y: -210, w: 300, h: 330 }, (c) => {
            cut(c, D.spline([[-40, -170], [-22, -196], [8, -202], [34, -186], [44, -160], [30, -136], [0, -128], [-30, -140]], 6), COL.hair, 'bun', { border: 2.8, tex: false, inner: (cc, box) => D.strands(cc, box, COL.hair, { seed: 'bun', angle: 0.3 }) });
            cut(c, D.spline([[-104, 60], [-116, -20], [-104, -100], [-60, -140], [0, -148], [60, -140], [104, -100], [116, -20], [104, 60], [70, 40], [-70, 40]], 8), COL.hair, 'hairback', { border: 2.8, tex: false, inner: (cc, box) => D.strands(cc, box, COL.hair, { seed: 'hairback', angle: Math.PI / 2 }) });
        }, 1.6).draw(g);
        // ears with a small coral earring
        sprite('laura-ears', { x: -110, y: -40, w: 220, h: 90 }, (c) => {
            for (const sd of [-1, 1]) {
                cut(c, D.spline([[sd * 78, -18], [sd * 94, -22], [sd * 100, 0], [sd * 92, 22], [sd * 78, 20]], 5), COL.skin, 'ear' + sd, { border: 2, tex: { alpha: [0.1, 0.2] } });
                cut(c, P.ellipse(sd * 92, 34, 6, 6, 20), COL.button, 'earring' + sd, { border: 1.2, shadow: 0.2 });
            }
        }, 1.6).draw(g);
        // face: an egg with a soft jaw
        sprite('laura-face', { x: -95, y: -120, w: 190, h: 240 }, (c) => {
            cut(c, D.spline([[-70, -70], [-44, -104], [0, -112], [44, -104], [70, -70], [80, -10], [72, 46], [42, 90], [0, 104], [-42, 90], [-72, 46], [-80, -10]], 8), COL.skin, 'face', { tex: { alpha: [0.1, 0.22] } });
        }, 1.6).draw(g);
        // side-swept fringe: its own piece, with strands
        sprite('laura-fringe', { x: -120, y: -160, w: 240, h: 150 }, (c) => {
            cut(c, D.spline([[-100, -30], [-96, -96], [-50, -140], [10, -150], [66, -130], [102, -86], [106, -40], [80, -66], [40, -84], [-6, -80], [-46, -64], [-78, -42]], 8), COL.hair, 'fringe', { border: 2.4, tex: false, inner: (cc, box) => D.strands(cc, box, COL.hair, { seed: 'fringe', angle: 0.25 }) });
            P.markerStroke(c, [[-60, -116], [-10, -132], [40, -126]], COL.hairLight, 4, 'hairshine', 0.6);
        }, 1.6).draw(g);
        // cheeks, nose
        g.fillStyle = COL.cheek;
        g.globalAlpha = 0.8;
        for (const sd of [-1, 1]) (g.beginPath(), g.ellipse(sd * 46, 34, 16, 12, 0, 0, Math.PI * 2), g.fill());
        g.globalAlpha = 1;
        g.strokeStyle = D.shade(COL.skin, -20);
        g.lineCap = 'round';
        g.lineWidth = 3.2;
        g.beginPath();
        g.moveTo(-2, 8);
        g.quadraticCurveTo(8, 24, -4, 28);
        g.stroke();
        // eyes (behind the glasses)
        g.strokeStyle = COL.eye;
        g.fillStyle = COL.eye;
        for (const sd of [-1, 1]) {
            const ex = sd * 32, ey = -4;
            const closed = eyes === 'closed' || (eyes === 'wink' && sd === 1);
            g.lineWidth = 4;
            if (closed) {
                g.beginPath();
                g.arc(ex, ey - 6, 11, Math.PI * 0.2, Math.PI * 0.8);
                g.stroke();
            } else if (eyes === 'happy') {
                g.beginPath();
                g.arc(ex, ey + 5, 10, Math.PI * 1.15, Math.PI * 1.85);
                g.stroke();
            } else {
                g.beginPath();
                g.ellipse(ex + look[0] * 4, ey + look[1] * 3, 7, 8.5, 0, 0, Math.PI * 2);
                g.fill();
                g.fillStyle = '#fff';
                g.beginPath();
                g.arc(ex + look[0] * 4 + 2.4, ey + look[1] * 3 - 3, 2.4, 0, Math.PI * 2);
                g.fill();
                g.fillStyle = COL.eye;
            }
            // brows: short thick strokes that follow the mood
            const lift = eyes === 'happy' || m === 'grin' ? -4 : m === 'o' ? -8 : 0;
            g.lineWidth = 4.5;
            g.beginPath();
            g.moveTo(ex - 13, ey - 30 + lift + (sd < 0 ? 2 : 0));
            g.quadraticCurveTo(ex, ey - 36 + lift, ex + 13, ey - 30 + lift + (sd > 0 ? 2 : 0));
            g.stroke();
        }
        // glasses: two rounded frames and a bridge, over the eyes
        g.save();
        g.strokeStyle = COL.frame;
        g.lineWidth = 3.4;
        g.globalAlpha = 0.95;
        for (const sd of [-1, 1]) {
            g.beginPath();
            g.roundRect(sd * 32 - 24, -24, 48, 38, 13);
            g.stroke();
        }
        g.beginPath();
        g.moveTo(-8, -10);
        g.quadraticCurveTo(0, -15, 8, -10);
        g.moveTo(-56, -14);
        g.lineTo(-76, -18);
        g.moveTo(56, -14);
        g.lineTo(76, -18);
        g.stroke();
        g.restore();
        // mouth
        g.lineWidth = 4;
        g.strokeStyle = COL.lip;
        g.fillStyle = '#3a1d24';
        if (m === 'o') {
            g.beginPath();
            g.ellipse(0, 56, 7, 9, 0, 0, Math.PI * 2);
            g.fill();
        } else if (m === 'grin') {
            g.beginPath();
            g.moveTo(-20, 48);
            g.quadraticCurveTo(0, 52, 20, 48);
            g.quadraticCurveTo(10, 70, 0, 70);
            g.quadraticCurveTo(-10, 70, -20, 48);
            g.fill();
        } else if (m === 'flat') {
            g.beginPath();
            g.moveTo(-12, 54);
            g.lineTo(12, 53);
            g.stroke();
        } else {
            g.beginPath();
            g.arc(0, 38, 17, Math.PI * 0.22, Math.PI * 0.78);
            g.stroke();
        }
        g.restore();
    }

    // A hand wrapped round a mug's body (PaperDetail pose 'wrap'), in Laura's local units.
    // m: the mug's centre, r: its tilt, side: 'right' (her right hand, from the left of the
    // image) or 'left', mugW: the mug's width. The hand turns with the mug (a rigid hold).
    // Returns the wrist (end the forearm there) and draw(g, drawMug): the thumb behind, the
    // mug, then the back of the hand and the fingers across its front.
    function wrap(m, r, side, mugW, size = 60) {
        const k = size / 60, rot = (side === 'right' ? Math.PI / 2 : -Math.PI / 2) + r;
        const mir = side !== D.HAND_VIEW.wrap, lx = (mir ? 2 : -2) * k, ly = (-24 - mugW / 2 / k) * k;
        const wrist = [m[0] - (lx * Math.cos(rot) - ly * Math.sin(rot)), m[1] - (lx * Math.sin(rot) + ly * Math.cos(rot))];
        return {
            wrist, rot,
            draw(g, drawMug) {
                D.hand(g, wrist[0], wrist[1], size, rot, 'wrap', { skin: COL.skin, side, cuff: COL.shirt, part: 'back' });
                drawMug();
                D.hand(g, wrist[0], wrist[1], size, rot, 'wrap', { skin: COL.skin, side, part: 'front' });
            },
        };
    }

    return { COL, ARMS, HANDS, draw, wrap };
})();
