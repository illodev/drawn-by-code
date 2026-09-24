// Montage object «music» (see ../things.js for the contract).
// A red eighth note (head, stem and flag, three pieces) and a blue beamed pair (one stems +
// beam piece, two heads in front), all cut from printed sheet music: staves and little notes
// show inside every piece. The red note hops (10.75–10.83 s) with two ground dashes under it,
// the blue pair stretches a little, a sparkle hangs by the flag. Measured on the reference
// (10.583–10.917 s), authored in "crop pixels" of the crop 200,720 at 2160 px (like the dog)
// and converted to logical units around (350, 700): the card draws it at s = 1.
(() => {
    const P = Paper, D = PaperDetail;
    const { place, cut } = Things.kit;
    const O = [350, 700];
    const px = ([a, b]) => [(200 + a) / 2.16 - O[0], (720 + b) / 2.16 - O[1]];
    const lg = ([a, b]) => [a - O[0], b - O[1]];
    const COL = { red: '#c8363f', blue: '#34428f', spark: '#efe39c', ink: '#2b2530' };
    const PIECE = { border: 3.4, shadow: 0.13, tex: { alpha: [0.18, 0.4], lVar: 3.5 } };

    // Printed sheet music inside a piece: groups of five staff lines and small quarter notes
    // (oval head, stem up on the right), in the paper's light ink.
    function sheet(c, box, seed, o) {
        const r = P.rng(seed), sp = 8.1, period = 74;
        let y = box.y - period + r() * period;
        c.save();
        c.lineCap = 'round';
        for (; y < box.y + box.h + 30; y += period) {
            c.strokeStyle = o.ink;
            c.globalAlpha = o.lineA;
            c.lineWidth = 0.85;
            for (let i = 0; i < 5; i++) {
                c.beginPath();
                c.moveTo(box.x - 4, y + i * sp);
                c.lineTo(box.x + box.w + 4, y + i * sp);
                c.stroke();
            }
            for (let x = box.x + r() * 18; x < box.x + box.w + 6; x += 17 + r() * 20) {
                const hy = y + 4 * sp - Math.floor(r() * 8) * (sp / 2);
                c.globalAlpha = o.noteA;
                c.fillStyle = o.ink;
                c.beginPath();
                c.ellipse(x, hy, 5.3, 3.7, -0.38, 0, Math.PI * 2);
                c.fill();
                c.lineWidth = 0.9;
                c.beginPath();
                c.moveTo(x + 4.7, hy - 1.2);
                c.lineTo(x + 4.7, hy - 26 - r() * 4);
                c.stroke();
            }
        }
        c.restore();
    }
    const printed = (col, seed, lineA, noteA) => ({ ...PIECE, inner: (cc, box) => sheet(cc, box, seed, { ink: '#f7efe8', lineA, noteA }) });
    const RED = (seed) => printed(COL.red, seed, 0.42, 0.72);
    const BLUE = (seed) => printed(COL.blue, seed, 0.42, 0.72);
    // a head: a slightly irregular tilted oval
    function head(cx, cy, a, b, rot, seed) {
        const r = P.rng(seed), n = 12, cs = Math.cos(rot), sn = Math.sin(rot);
        return D.spline(Array.from({ length: n }, (_, i) => {
            const t = (i / n) * Math.PI * 2, k = 1 + (r() - 0.5) * 0.06;
            const x = Math.cos(t) * a * k, y = Math.sin(t) * b * k;
            return lg([cx + x * cs - y * sn, cy + x * sn + y * cs]);
        }), 8);
    }

    // red note, pivot at the head's centre (174.5, 751.4)
    const RPIV = lg([174.5, 751.4]);
    function redNote(c) {
        c.save();
        c.translate(-RPIV[0], -RPIV[1]);
        cut(c, P.noodle(D.spline([[218.5, 392], [216.8, 450], [218.6, 520], [217.4, 600], [218.9, 670], [219.5, 728]].map(lg), 6, false), 23, 21), COL.red, 'mn-rstem', RED('mn-rstem'));
        cut(c, P.noodle(D.spline([[210.5, 374], [238, 399], [264.5, 420], [287.5, 443], [302, 471], [306.5, 503], [302.5, 535], [291, 563], [279, 581]].map(lg), 6, false), 31, 19), COL.red, 'mn-rflag', RED('mn-rflag'));
        cut(c, head(174.5, 751.4, 63.4, 41.7, -0.44, 'mn-rhead'), COL.red, 'mn-rhead', RED('mn-rhead'));
        c.restore();
    }
    // blue pair: stems + beam in one piece (drawn stretchable from its foot), heads on top
    const BFOOT = lg([450, 800]);
    function blueStems(c) {
        c.save();
        c.translate(-BFOOT[0], -BFOOT[1]);
        cut(c, [[690, 885], [688, 700], [686, 500], [686, 322], [760, 302], [850, 280], [950, 255], [1030, 236], [1078, 222], [1080, 350], [1078, 550], [1075, 800],
            [1022, 800], [1024, 550], [1022, 330], [1021, 300], [950, 322], [850, 350], [770, 375], [744, 392], [742, 500], [741, 700], [740, 885]].map(px), COL.blue, 'mn-bstems', BLUE('mn-bstems'));
        c.restore();
    }
    function blueHeads(c) {
        cut(c, head(372.7, 755.6, 60.6, 41.2, -0.36, 'mn-bh1'), COL.blue, 'mn-bh1', BLUE('mn-bh1'));
        cut(c, head(525.5, 713.9, 60.6, 41.2, -0.36, 'mn-bh2'), COL.blue, 'mn-bh2', BLUE('mn-bh2'));
    }

    // six drawings on twos (10.5 → 10.917)
    const RED_KEYS = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [-5.8, -86, -8], [-11.6, -46, -5], [0, 0, 0]];
    const BLUE_STRETCH = [0, 0, 0, 0.035, 0.012, 0];

    Things.music = (g, x, y, s, t, part) => {
        if (part === 'front') return;
        const card = t >= 10.5 && t < 11;
        const step = card ? Math.max(0, Math.min(5, Math.floor((t - 10.5) * 12 + 1e-6))) : 0;
        const at = ([a, b]) => [x + a * s, y + b * s];
        // blue pair
        const bs = BLUE_STRETCH[step];
        g.save();
        g.translate(...at(BFOOT));
        g.scale(1, 1 + bs);
        place(g, 'th-music-bstems', { x: -52, y: -378, w: 208, h: 336 }, blueStems, 0, 0, s, 0, 1.3);
        g.restore();
        place(g, 'th-music-bheads', { x: -52, y: -48, w: 305, h: 165 }, blueHeads, x, y, s, 0, 1.3);
        // red note
        const [dx, dy, rd] = RED_KEYS[step];
        const [rx, ry] = at([RPIV[0] + dx, RPIV[1] + dy]);
        place(g, 'th-music-red', { x: -78, y: -398, w: 242, h: 460 }, redNote, rx, ry, s, (rd * Math.PI) / 180, 1.3);
        if (t >= 16) return;
        // sparkle by the flag
        const [sx, sy] = at(lg([290.5, 390])), sr = 16 * s;
        P.markerStroke(g, [[sx - sr, sy + 1 * s], [sx + sr, sy - 1 * s]], COL.spark, 3.3 * s, 'mn-spk1', 0.95);
        P.markerStroke(g, [[sx + 1 * s, sy - sr], [sx - 1 * s, sy + sr]], COL.spark, 3.3 * s, 'mn-spk2', 0.95);
        // the hop: two dashes on the ground under the red note
        if (step === 3 || step === 4) {
            const o = step === 4 ? -2 : 0;
            for (const [a, b] of [[[106, 846], [138, 836]], [[211, 851], [247, 841]]]) {
                P.markerStroke(g, [at(lg([a[0], a[1] + o])), at(lg([b[0], b[1] + o]))], COL.ink, 4.2 * s, 'mn-dash' + a[0], 0.95);
            }
        }
    };
})();
