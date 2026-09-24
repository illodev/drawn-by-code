// «what do you love?» replica · shared pieces: palette, marker text, note, paper plane,
// stars, the flower and the girl. Logical units 1000×1000.
const Sets = {};

const WL = (() => {
    const P = Paper, E = Ease;
    const COL = {
        sky: '#1e2051', band: '#2b2e65', band2: '#343b81', moon: '#efe8cd', star: '#e8cf6e',
        flower: '#d87c65', flowerDark: '#c56a55', flowerCheek: '#e98b87', eye: '#231a1f',
        house: '#3f3470', houseText: '#5b4f8a', roof: '#2a2455', town: '#1a1c46', town2: '#23255a', window: '#f0c95a',
        wall: '#f0cc51', curtain: '#df848d', frame: '#ece3c9', desk: '#c6a175', skirting: '#3c2a64',
        skin: '#e9b996', cheek: '#ec8e8e', hair: '#2b211f', clip: '#f2cf3b', sweater: '#389486', sweaterDark: '#2d7f72', collar: '#faf8f1',
        wood: '#b8895b', light: '#d3aa6a', cover: '#5b3a86', paper: '#f7f3e7', rule: '#b7c3de', margin: '#e59a8c', ink: '#3862b1',
        pot: '#c9774e', leaf: '#5aa34f', red: '#d9473b',
    };
    let kit = null;
    const init = (env) => (kit = PaperKit.make(env, { font: 'Stack' }));
    const sprite = (...a) => kit.sprite(...a);

    // --- marker text (Short Stack + a second translucent pass) -------------------------
    const widths = new Map();
    function write(g, text, x, y, size, color = COL.ink, o = {}) {
        const p = o.p ?? 1;
        if (p <= 0) return 0;
        g.save();
        g.font = `${size}px "Stack"`;
        g.textBaseline = 'alphabetic';
        const key = g.font + text;
        if (!widths.has(key)) widths.set(key, Array.from({ length: text.length + 1 }, (_, i) => g.measureText(text.slice(0, i)).width));
        const xs = widths.get(key), total = xs[xs.length - 1];
        const x0 = o.align === 'center' ? x - total / 2 : o.align === 'right' ? x - total : x;
        const shown = p * text.length;
        g.beginPath();
        g.rect(x0 - size, y - size * 1.3, xs[Math.floor(shown)] + (xs[Math.min(text.length, Math.floor(shown) + 1)] - xs[Math.floor(shown)]) * (shown % 1) + size, size * 2);
        g.clip();
        g.lineJoin = 'round';
        g.lineCap = 'round';
        g.fillStyle = color;
        g.strokeStyle = color;
        g.lineWidth = size * 0.05;
        g.globalAlpha = o.alpha ?? 0.95;
        g.fillText(text, x0, y);
        g.strokeText(text, x0, y);
        g.globalAlpha = (o.alpha ?? 1) * 0.3;
        g.fillText(text, x0 + size * 0.015, y + size * 0.012);
        g.restore();
        return total;
    }
    const textW = (g, text, size) => ((g.font = `${size}px "Stack"`), g.measureText(text).width);

    // --- lined paper (the note) -----------------------------------------------------------
    // (x, y) centre; w, h size; o.text: [line1, line2] revealed by o.p (0–1); o.circle: «you» circled
    function note(g, x, y, w, h, rot, seed, o = {}) {
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        if (o.flip) g.scale(-1, 1);
        sprite('note:' + seed + w + 'x' + h + (o.torn ?? 1), { x: -w / 2 - 10, y: -h / 2 - 12, w: w + 20, h: h + 24 }, (c) => {
            const top = [];
            // top edge torn off the spiral binding (irregular teeth)
            const r = P.rng(seed + 'teeth');
            for (let i = 0; i <= 24; i++) top.push([-w / 2 + (w * i) / 24, -h / 2 + (o.torn === 0 ? 0 : (i % 2 ? 7 : 0) + r() * 4)]);
            P.cutout(c, [...top, [w / 2, h / 2], [-w / 2, h / 2]], COL.paper, seed, {
                border: 2.2, paper: '#fffdf6', shadow: 0.22, jag: 0.6, tex: { lVar: 1.2, sVar: 1.5, alpha: [0.15, 0.35] },
                inner: (cc) => {
                    cc.strokeStyle = COL.rule;
                    cc.lineWidth = Math.max(1, h * 0.006);
                    for (let yy = -h / 2 + h * 0.22; yy < h / 2; yy += h * 0.155) (cc.beginPath(), cc.moveTo(-w / 2, yy), cc.lineTo(w / 2, yy), cc.stroke());
                    cc.strokeStyle = COL.margin;
                    cc.beginPath();
                    cc.moveTo(-w / 2 + w * 0.07, -h / 2);
                    cc.lineTo(-w / 2 + w * 0.07, h / 2);
                    cc.stroke();
                },
            });
        }, 1.5).draw(g);
        if (o.flip) g.scale(-1, 1);
        const lines = o.text ?? [];
        const size = o.size ?? h * 0.25;
        if (lines.length) {
            const p = o.p ?? 1, total = lines.join('').length;
            let done = 0;
            g.save();
            if (o.flip) {
                // back side: the text shows through, mirrored and faded
                g.scale(-1, 1);
                g.globalAlpha = 0.28;
            }
            lines.forEach((ln, i) => {
                const lp = Math.max(0, Math.min(1, (p * total - done) / ln.length));
                done += ln.length;
                const lx = o.lineX?.[i] ?? -w / 2 + w * 0.14;
                const ly = -h / 2 + h * (o.lineY?.[i] ?? (0.42 + i * 0.3));
                write(g, ln, lx, ly, size, COL.ink, { p: lp });
                if (o.circle && i === 1 && ln.startsWith('you')) {
                    const cw = textW(g, 'you', size);
                    const u = o.circle;
                    if (u > 0) {
                        const pts = [];
                        for (let k = 0; k <= 40 * u; k++) {
                            const a = Math.PI * 0.9 + (k / 40) * Math.PI * 2.15;
                            pts.push([lx + cw / 2 + Math.cos(a) * cw * 0.62, ly - size * 0.3 + Math.sin(a) * size * 0.46]);
                        }
                        if (pts.length > 1) P.markerStroke(g, pts, '#d9533f', size * 0.09, 'circle' + seed, 0.9);
                    }
                }
            });
            if (o.doodle) flowerDoodle(g, w * 0.3, h * 0.3, h * 0.1, o.doodle);
            g.restore();
        }
        g.restore();
    }

    // little marker-drawn flower (the flower's signature on the note)
    function flowerDoodle(g, x, y, r, p = 1) {
        for (let k = 0; k < 10; k++) {
            if (k / 10 > p) break;
            const a = (k / 10) * Math.PI * 2;
            P.markerStroke(g, [[x + Math.cos(a) * r * 0.3, y + Math.sin(a) * r * 0.3], [x + Math.cos(a) * r, y + Math.sin(a) * r]], '#d9533f', r * 0.14, 'doodle' + k, 0.9);
        }
    }

    // --- paper plane ----------------------------------------------------------------------
    // points towards +x; s = scale (1 ≈ 60 long)
    function plane(g, x, y, s, rot, seed = 'plane') {
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        g.scale(s, s);
        sprite('plane', { x: -40, y: -24, w: 76, h: 48 }, (c) => {
            P.cutout(c, [[30, 0], [-32, -18], [-18, 0], [-32, 16]], '#fbf8f0', 'plane', { border: 0, shadow: 0.25, jag: 0.4, tex: { alpha: [0.1, 0.25] } });
            P.cutout(c, [[30, 0], [-18, 0], [-26, 10]], '#dcd6c8', 'plane2', { border: 0, shadow: 0, jag: 0.3, tex: false });
            c.strokeStyle = '#b9b2a2';
            c.lineWidth = 0.8;
            c.beginPath();
            c.moveTo(30, 0);
            c.lineTo(-24, -4);
            c.stroke();
        }, 3).draw(g);
        g.restore();
    }
    // dotted trail behind a path
    function trail(g, pts, color = 'rgba(240,235,220,0.8)') {
        g.save();
        g.strokeStyle = color;
        g.lineWidth = 2.2;
        g.setLineDash([6, 8]);
        g.lineCap = 'round';
        g.beginPath();
        pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.stroke();
        g.restore();
    }

    // --- stars and sparkles -----------------------------------------------------------------
    function star(g, x, y, r, rot = 0) {
        const s = sprite('star', { x: -12, y: -12, w: 24, h: 24 }, (c) => {
            const pts = [];
            for (let i = 0; i < 10; i++) {
                const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? 4 : 9.5;
                pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
            }
            P.cutout(c, pts, COL.star, 'star', { border: 0, shadow: 0, jag: 0.3, tex: false });
        }, 4);
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        g.scale(r / 10, r / 10);
        s.draw(g);
        g.restore();
    }
    function plus(g, x, y, r, color = '#e8e2cf') {
        g.save();
        g.strokeStyle = color;
        g.lineWidth = r * 0.28;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(x - r, y);
        g.lineTo(x + r, y);
        g.moveTo(x, y - r);
        g.lineTo(x, y + r);
        g.stroke();
        g.restore();
    }
    // little yellow ticks around something that shakes or shines (u: 0→1→0)
    function ticks(g, x, y, r0, r1, n, u, color = COL.star, rot = 0) {
        if (u <= 0.02) return;
        g.save();
        g.strokeStyle = color;
        g.lineCap = 'round';
        g.lineWidth = 4;
        g.globalAlpha = Math.min(1, u * 1.5);
        for (let k = 0; k < n; k++) {
            const a = rot + (k / n) * Math.PI * 2;
            const a0 = r0 + (r1 - r0) * 0.2 * u, a1 = r0 + (r1 - r0) * (0.3 + 0.7 * u);
            g.beginPath();
            g.moveTo(x + Math.cos(a) * a0, y + Math.sin(a) * a0);
            g.lineTo(x + Math.cos(a) * a1, y + Math.sin(a) * a1);
            g.stroke();
        }
        g.restore();
    }

    // «scribbled text» texture (walls, frames): rows of illegible handwriting
    function scribbleFill(c, box, color, seed, o = {}) {
        const lh = o.lineH ?? 26;
        for (let yy = box.y + lh; yy < box.y + box.h; yy += lh) P.scribble(c, box.x, yy, box.w, 1, lh, color, seed + yy, { alpha: o.alpha ?? 0.45, width: o.width ?? 1.4, scale: o.scale ?? 1.5 });
    }

    // flat marker-textured background (montage cards, walls)
    function flat(g, env, key, color, o = {}) {
        kit.paperBg(g, key, color, { bleed: o.bleed ?? 80, tex: { len: [40, 120], h: [10, 18], lVar: 2.5, alpha: [0.3, 0.6], density: 1 } });
    }

    // =====================================================================================
    // THE FLOWER: a 12-ray sun with a face. (x, y) = centre; R = ray length.
    // o.pose: 'free' | 'holding' (arms towards a note, plus legs) ; o.mouth: 'smile' |
    // 'o' | 'grin' | 'think' ; o.eyes: 'open' | 'closed' | 'happy' ; o.rot: ray rotation;
    // o.wiggle: 0–1 happy shake ; o.arms: [[x,y],[x,y]] hands (relative, in R units)
    // =====================================================================================
    function ray(g, x0, y0, x1, y1, w) {
        const len = Math.hypot(x1 - x0, y1 - y0);
        const s = sprite('ray', { x: -14, y: -16, w: 128, h: 32 }, (c) => {
            P.cutout(c, P.roundRect(-10, -11, 120, 22, 11), COL.flower, 'ray', { border: 2.6, shadow: 0.12, jag: 0.8, tex: { angle: 0, alpha: [0.25, 0.5] } });
        }, 3);
        g.save();
        g.translate(x0, y0);
        g.rotate(Math.atan2(y1 - y0, x1 - x0));
        g.scale(len / 110, w / 22);
        s.draw(g);
        g.restore();
    }
    function flower(g, x, y, R, o = {}) {
        const t = o.t ?? 0;
        const wig = o.wiggle ?? 0;
        g.save();
        g.translate(x, y);
        g.rotate((o.tilt ?? 0) + Math.sin(t * 30) * 0.05 * wig);
        const w = R * 0.21;
        const rays = [];
        if (o.pose === 'holding') {
            // 8 rays fanned out on top, 2 arms and 2 legs
            for (let k = 0; k < 8; k++) {
                const a = Math.PI + 0.05 + (k / 7) * (Math.PI - 0.1);
                rays.push([Math.cos(a) * R * 0.25, Math.sin(a) * R * 0.25, Math.cos(a) * R, Math.sin(a) * R]);
            }
            const arms = o.arms ?? [[-0.5, 0.55], [0.5, 0.55]];
            for (const [hx, hy] of arms) {
                const ex = hx * R * 1.05, ey = hy * R * 0.3;
                rays.push([hx * R * 0.2, 0, ex, ey], [ex, ey, hx * R, hy * R]);
            }
            for (const s of [-1, 1]) rays.push([s * R * 0.12, R * 0.2, s * R * 0.26, (o.legs ?? 1.05) * R]);
        } else {
            const n = 12, rot = o.rot ?? 0;
            for (let k = 0; k < n; k++) {
                const a = rot + (k / n) * Math.PI * 2 + Math.sin(t * 8 + k) * 0.03 * wig;
                const L = R * (1 + ((k % 2) ? -0.04 : 0.03));
                rays.push([Math.cos(a) * R * 0.2, Math.sin(a) * R * 0.2, Math.cos(a) * L, Math.sin(a) * L]);
            }
        }
        for (const [x0, y0, x1, y1] of rays) ray(g, x0, y0, x1, y1, w);
        // central disc
        sprite('flower-disc', { x: -40, y: -40, w: 80, h: 80 }, (c) => {
            P.cutout(c, P.ellipse(0, 0, 33, 33), COL.flower, 'disc', { border: 0, shadow: 0, jag: 0.5, tex: { alpha: [0.25, 0.5] } });
        }, 3).draw((g.save(), g.scale(R / 110, R / 110), g));
        g.restore();
        face(g, R, o);
        g.restore();
    }
    function face(g, R, o) {
        const k = R / 110;
        g.save();
        g.scale(k, k);
        const eyes = o.eyes ?? 'open';
        g.fillStyle = COL.flowerCheek;
        for (const s of [-1, 1]) (g.beginPath(), g.ellipse(s * 21, 8, 7, 5, 0, 0, Math.PI * 2), g.fill());
        g.strokeStyle = COL.eye;
        g.fillStyle = COL.eye;
        g.lineCap = 'round';
        g.lineWidth = 2.6;
        for (const s of [-1, 1]) {
            if (eyes === 'open') {
                g.beginPath();
                g.arc(s * 13, -4, 5, 0, Math.PI * 2);
                g.fill();
                g.fillStyle = '#fff';
                g.beginPath();
                g.arc(s * 13 + 1.6, -5.8, 1.6, 0, Math.PI * 2);
                g.fill();
                g.fillStyle = COL.eye;
            } else if (eyes === 'happy') {
                g.beginPath();
                g.arc(s * 13, -2, 4.5, Math.PI * 1.1, Math.PI * 1.9);
                g.stroke();
            } else {
                g.beginPath();
                g.arc(s * 13, -6, 4.5, Math.PI * 0.15, Math.PI * 0.85);
                g.stroke();
            }
        }
        const m = o.mouth ?? 'smile';
        g.lineWidth = 2.4;
        if (m === 'o') {
            g.beginPath();
            g.ellipse(0, 9, 3.6, 4.4, 0, 0, Math.PI * 2);
            g.stroke();
        } else if (m === 'grin') {
            g.fillStyle = COL.eye;
            g.beginPath();
            g.arc(0, 6, 6, 0, Math.PI);
            g.fill();
        } else if (m === 'think') {
            g.beginPath();
            g.moveTo(-3, 9);
            g.lineTo(4, 7);
            g.stroke();
        } else {
            g.beginPath();
            g.arc(0, 5, 5, Math.PI * 0.15, Math.PI * 0.85);
            g.stroke();
        }
        g.restore();
    }

    // =====================================================================================
    // THE GIRL (bust behind the desk). (x, y) = centre of the desk edge; s = scale (1 =
    // the interior medium shot). o.pose: 'desk' | 'pencil' | 'throw' | 'wave' | 'note' |
    // 'hug' | 'pin' ; o.eyes: 'open' | 'closed' | 'up' | 'happy' ; o.mouth: 'smile' |
    // 'o' | 'grin' ; o.look: [dx, dy]
    // =====================================================================================
    function tube(g, pts, w, color, seed) {
        // arm: a strip with a paper edge, cached per pose (key = rounded points)
        const key = 'tube:' + seed + pts.map(([a, b]) => Math.round(a) + ',' + Math.round(b)).join(';') + w;
        const bb = P.bbox(pts, w + 10);
        sprite(key, bb, (c) => {
            P.cutout(c, P.noodle(P.bezier(pts[0], pts[1], pts[1], pts[2], 16), w, w * 0.9), color, seed, { border: 2.6, shadow: 0.15, jag: 0.7 });
        }, 1.4).draw(g);
    }
    function hand(g, x, y, r) {
        sprite('hand', { x: -30, y: -30, w: 60, h: 60 }, (c) => P.cutout(c, P.ellipse(0, 0, 25, 25), COL.skin, 'hand', { border: 2.4, shadow: 0.12, tex: { alpha: [0.15, 0.3] } }), 2)
            .draw((g.save(), g.translate(x, y), g.scale(r / 25, r / 25), g));
        g.restore();
    }
    const ARMS = {
        desk: [[[-185, -205], [-250, -70], [-110, -18]], [[185, -205], [250, -70], [110, -18]]],
        pencil: [[[-185, -205], [-250, -70], [-110, -18]], [[185, -205], [285, -170], [225, -400]]],
        throw: [[[-185, -205], [-250, -70], [-110, -18]], [[185, -205], [300, -250], [265, -460]]],
        release: [[[-185, -205], [-250, -70], [-110, -18]], [[185, -205], [330, -260], [390, -420]]],
        wave: [[[-185, -205], [-250, -70], [-110, -18]], [[185, -205], [290, -200], [270, -420]]],
        note: [[[-185, -205], [-240, -90], [-150, -100]], [[185, -205], [240, -90], [150, -100]]],
        hug: [[[-185, -205], [-190, -60], [60, -120]], [[185, -205], [190, -60], [-60, -120]]],
        pin: [[[-185, -205], [-250, -70], [-110, -18]], [[185, -205], [330, -240], [360, -420]]],
    };
    function girl(g, x, y, s, o = {}) {
        const t = o.t ?? 0;
        g.save();
        g.translate(x, y + Math.sin(t * 2.2) * 2);
        g.scale(s, s);
        const pose = o.pose ?? 'desk';
        const arms = o.arms ?? ARMS[pose];
        // body (sweater) and white collar
        sprite('girl-body', { x: -230, y: -290, w: 460, h: 300 }, (c) => {
            P.cutout(c, [[-150, -262], [150, -262], [205, -200], [215, 0], [-215, 0], [-205, -200]], COL.sweater, 'sweater', { border: 3, shadow: 0.15 });
            P.cutout(c, [[-70, -262], [0, -225], [70, -262], [55, -278], [-55, -278]], COL.collar, 'collar', { border: 2, shadow: 0.1 });
        }, 1.4).draw(g);
        // neck
        sprite('girl-neck', { x: -40, y: -305, w: 80, h: 60 }, (c) => P.cutout(c, P.roundRect(-26, -300, 52, 45, 10), COL.skin, 'neckskin', { border: 0, shadow: 0 }), 1.4).draw(g);
        // head
        head(g, o);
        // arms
        for (let i = 0; i < 2; i++) {
            const a = arms[i];
            tube(g, a, 62, COL.sweater, 'arm' + i);
            hand(g, a[2][0], a[2][1], 27);
        }
        if (pose === 'pencil') {
            const [hx, hy] = arms[1][2];
            P.markerStroke(g, [[hx - 5, hy + 10], [hx - 10, hy - 55]], '#3862b1', 10, 'pencil', 1);
        }
        g.restore();
    }
    function head(g, o) {
        const tilt = o.tilt ?? 0;
        g.save();
        g.translate(0, -365);
        g.rotate(tilt);
        // back hair (bob)
        sprite('girl-hair', { x: -165, y: -170, w: 330, h: 290 }, (c) => {
            P.cutout(c, [...P.ellipse(0, -30, 140, 130, 48, Math.PI, Math.PI * 2), [140, -30], [148, 100], [95, 108], [-95, 108], [-148, 100], [-140, -30]], COL.hair, 'hair', { border: 3, shadow: 0.15, tex: { alpha: [0.3, 0.6] } });
        }, 1.4).draw(g);
        // face
        sprite('girl-face', { x: -120, y: -125, w: 240, h: 250 }, (c) => {
            P.cutout(c, P.roundRect(-105, -105, 210, 212, 70), COL.skin, 'face', { border: 2.4, shadow: 0.1, tex: { alpha: [0.15, 0.3] } });
        }, 1.4).draw(g);
        // fringe and hair clip
        sprite('girl-fringe', { x: -150, y: -170, w: 300, h: 140 }, (c) => {
            P.cutout(c, [...P.ellipse(0, -30, 138, 125, 40, Math.PI, Math.PI * 2), [138, -30], [120, -40], [40, -60], [-60, -45], [-120, -20], [-138, -30]], COL.hair, 'fringe', { border: 0, shadow: 0, tex: { alpha: [0.3, 0.6] } });
            P.cutout(c, P.roundRect(-30, -9, 60, 18, 6).map(([px, py]) => [px * Math.cos(-0.45) - py * Math.sin(-0.45) + 70, px * Math.sin(-0.45) + py * Math.cos(-0.45) - 95]), COL.clip, 'clip', { border: 1.8, shadow: 0.1 });
        }, 1.4).draw(g);
        // cheeks
        g.fillStyle = COL.cheek;
        for (const s of [-1, 1]) (g.beginPath(), g.ellipse(s * 62, 30, 20, 17, 0, 0, Math.PI * 2), g.fill());
        // eyes
        const eyes = o.eyes ?? 'open', look = o.look ?? [0, 0];
        g.strokeStyle = COL.eye;
        g.fillStyle = COL.eye;
        g.lineCap = 'round';
        g.lineWidth = 5;
        for (const s of [-1, 1]) {
            const ex = s * 42, ey = -8;
            if (eyes === 'closed') (g.beginPath(), g.moveTo(ex - 16, ey), g.lineTo(ex + 16, ey), g.stroke());
            else if (eyes === 'happy') (g.beginPath(), g.arc(ex, ey + 6, 14, Math.PI * 1.15, Math.PI * 1.85), g.stroke());
            else {
                g.fillStyle = '#fbf6ec';
                g.beginPath();
                g.ellipse(ex, ey, 15, 14, 0, 0, Math.PI * 2);
                g.fill();
                g.fillStyle = COL.eye;
                const ly = eyes === 'up' ? -6 : look[1] * 6;
                g.beginPath();
                g.arc(ex + look[0] * 6, ey + ly, 8, 0, Math.PI * 2);
                g.fill();
            }
        }
        // mouth
        const m = o.mouth ?? 'smile';
        g.lineWidth = 5;
        if (m === 'o') (g.beginPath(), g.ellipse(0, 52, 9, 11, 0, 0, Math.PI * 2), g.stroke());
        else if (m === 'grin') {
            g.fillStyle = '#7a2a2a';
            g.beginPath();
            g.arc(0, 44, 20, 0.1, Math.PI - 0.1);
            g.fill();
        } else (g.beginPath(), g.arc(0, 36, 17, Math.PI * 0.2, Math.PI * 0.8), g.stroke());
        g.restore();
    }

    // where a girl's hand ends up on screen (i: 0 left, 1 right), for props held in it
    const girlHand = (pose, i, x = 530, y = 868, s = 0.74) => [x + ARMS[pose][i][2][0] * s, y + ARMS[pose][i][2][1] * s];

    return { COL, init, girlHand, get kit() { return kit; }, sprite, write, textW, note, flowerDoodle, plane, trail, star, plus, ticks, scribbleFill, flat, flower, girl, ARMS, hand, tube };
})();
