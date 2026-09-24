// Block «compliance» of the edit (see ../../scene.js EDIT). Defines Shots.compliance(g, lt, env).
// A closer shot of the wall above Laura's desk: a big cork board with the two deadlines as
// tear-off calendar pages (BRAND.copy.deadlines), the wall clock ticking on the beat, a twine
// of earlier invoices hanging from clothes pegs (a green fingerprint seal between each two:
// the hash chain) that runs down into the tax office's mailbox on the desk.
//   0.5 / 1.0  a green tick lands on each deadline page (handled, not scary)
//   1.0–1.4    the new invoice slides in from the right and settles
//   1.5        the stamp comes down by itself on the beat: QR + the green label appear
//   2.0–2.5    the stamped invoice shrinks onto the twine and clicks into a peg; its seal
//              pops between it and the previous invoice (2.5)
//   3.0–4.0    the chain feeds along the twine into the mailbox; the flag goes up at 4.0
// Title BRAND.copy.comply at 0.5. Everything is cut once (cached sprites) and moves on twos.
(() => {
    const P = Paper, D = PaperDetail, E = Ease;
    const sprite = (...a) => Props.sprite(...a);
    const cut = (c, pts, col, seed, o = {}) => P.cutout(c, pts, col, seed, { border: 2.2, shadow: 0.18, ...o });
    const flat = (c, pts, col, seed, o = {}) => P.cutout(c, pts, col, seed, { border: 0, shadow: 0, ...o });
    const R = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    const xf = (pts, x, y, a = 0, s = 1) => pts.map(([px, py]) => [x + (px * Math.cos(a) - py * Math.sin(a)) * s, y + (px * Math.sin(a) + py * Math.cos(a)) * s]);
    const ell = (cx, cy, rx, ry, n = 40, a = 0) => xf(P.ellipse(0, 0, rx, ry, n), cx, cy, a);
    const local = (c, x, y, a, fn) => (c.save(), c.translate(x, y), c.rotate(a), fn(c), c.restore());
    const drawing = (lt) => Math.floor(lt * 12 + 1e-6);
    const q2 = (lt) => drawing(lt) / 12; // time quantised to twos
    const C = () => Office.COL;

    // ------------------------------------------------------------------ layout
    const BOARD = { x0: 58, y0: 46, x1: 790, y1: 548, f: 22 };
    const CLOCK = { x: 1430, y: 196, r: 104 };
    const MAIL = { x: 1330, y: 796, s: 0.95 };
    const DESK_Y = 772; // the desk's top face starts here
    // the twine: tied to a nail on the board's frame, sagging down into the mailbox slot
    const TW_A = [BOARD.x1 - 6, 404], TW_B = [1286, MAIL.y - 158 * MAIL.s];
    const TWINE = P.bezier(TW_A, [960, 590], [1150, 640], TW_B, 90);
    const TW_S = [0];
    for (let i = 1; i < TWINE.length; i++) TW_S.push(TW_S[i - 1] + Math.hypot(TWINE[i][0] - TWINE[i - 1][0], TWINE[i][1] - TWINE[i - 1][1]));
    const TW_L = TW_S[TW_S.length - 1];
    function twineAt(s) {
        s = Math.max(0, Math.min(TW_L, s));
        let i = 1;
        while (i < TW_S.length - 1 && TW_S[i] < s) i++;
        const f = (s - TW_S[i - 1]) / (TW_S[i] - TW_S[i - 1] || 1), [ax, ay] = TWINE[i - 1], [bx, by] = TWINE[i];
        return { x: ax + (bx - ax) * f, y: ay + (by - ay) * f, a: Math.atan2(by - ay, bx - ax) };
    }
    const sAtX = (x) => {
        let i = 0;
        while (i < TWINE.length - 1 && TWINE[i][0] < x) i++;
        return TW_S[i];
    };
    const SP = 114; // spacing of the invoices along the twine
    const S0 = sAtX(1112); // the newest invoice's place, just before the mailbox

    // ------------------------------------------------------------------ the static set
    function wall(c) {
        const col = C(), k = 1.4;
        c.fillStyle = col.wall;
        c.fillRect(-80, -80, 1760, 1080);
        P.marker(c, { x: -120, y: -100, w: 1840, h: 1100 }, col.wall, 'cmp-wall', { len: [80, 220], h: [16, 30], lVar: 3, alpha: [0.3, 0.6], density: 1.05 });
        // the same printed wallpaper as the office, closer: pairs of stripes and sprigs
        const r = P.rng('cmp-wallpaper');
        c.save();
        c.lineCap = 'round';
        for (let x = -40, cl = 0; x < 1700; x += 78 * k, cl++) {
            c.strokeStyle = col.wallInk;
            for (const dx of [0, 6 * k]) {
                c.globalAlpha = dx ? 0.35 : 0.55;
                c.lineWidth = dx ? 1.3 : 2.1;
                c.beginPath();
                for (let y = -80; y <= 900; y += 20) c.lineTo(x + dx + Math.sin(y * 0.016 + cl) * 1.2, y);
                c.stroke();
            }
            for (let y = -40 + (cl % 2) * 44 * k; y < 900; y += 88 * k) {
                c.save();
                c.translate(x + 42 * k + (r() - 0.5) * 5, y);
                c.rotate((r() - 0.5) * 0.5);
                c.scale(k, k);
                c.globalAlpha = 0.5;
                c.strokeStyle = col.sprig;
                c.lineWidth = 1.3;
                c.beginPath();
                c.moveTo(0, 9);
                c.quadraticCurveTo(-2, 0, 1, -9);
                c.stroke();
                c.fillStyle = col.sprig;
                for (const [lx, ly, la] of [[-4, 2, -0.7], [4, -2, 0.7], [-3, -5, -0.5]]) (c.beginPath(), c.ellipse(lx, ly, 4, 1.8, la, 0, Math.PI * 2), c.fill());
                c.fillStyle = col.bud;
                c.globalAlpha = 0.55;
                c.beginPath();
                c.arc(1.5, -10.5, 2.3, 0, Math.PI * 2);
                c.fill();
                c.restore();
            }
        }
        c.restore();
    }
    function pin(c, x, y, col, seed, r = 8) {
        c.save();
        c.fillStyle = 'rgba(40,20,30,0.28)';
        c.beginPath();
        c.ellipse(x + 4, y + 5, r, r * 0.85, 0, 0, Math.PI * 2);
        c.fill();
        c.restore();
        cut(c, ell(x, y, r, r, 24), col, 'cpin' + seed, { border: 1.3, shadow: 0, tex: { alpha: [0.2, 0.4] } });
        c.fillStyle = 'rgba(255,255,255,0.75)';
        c.beginPath();
        c.ellipse(x - r * 0.3, y - r * 0.34, r * 0.3, r * 0.22, -0.5, 0, Math.PI * 2);
        c.fill();
    }
    function sticky(c, w, h, col, seed, rows = 3) {
        cut(c, R(-w / 2, -h / 2, w, h), col, seed, {
            border: 1.5, shadow: 0.22, jag: 0.5, tex: { alpha: [0.2, 0.4] },
            inner: (cc) => {
                cc.fillStyle = D.shade(col, -8);
                cc.globalAlpha = 0.35;
                cc.fillRect(-w / 2, -h / 2, w, h * 0.18);
                cc.globalAlpha = 1;
                D.cursive(cc, { x: -w / 2 + 10, y: -h / 2 + h * 0.22, w: w - 20, h: h * 0.7 }, '#4b3f55', { seed, lineH: h / (rows + 0.6), xh: 4, hw: 3, width: 1.2, alpha: 0.7, gap: 6 });
            },
        });
    }
    function board(c) {
        const col = C(), { x0, y0, x1, y1, f } = BOARD;
        // frame: four wooden battens, mitred, each its own piece of grain
        const bat = (pts, seed, ang) => cut(c, pts, col.woodLight, seed, { border: 2.4, shadow: 0.28, inner: (cc, box) => D.woodGrain(cc, box, col.woodLight, { seed, angle: ang }) });
        cut(c, [[x0 + f - 2, y0 + f - 2], [x1 - f + 2, y0 + f - 1], [x1 - f + 1, y1 - f + 2], [x0 + f - 1, y1 - f + 1]], col.cork, 'cmp-cork', {
            border: 0, shadow: 0.25, tex: { alpha: [0.2, 0.4] },
            inner: (cc, box) => {
                const r = P.rng('cmp-corkdots');
                for (let i = 0; i < 9000; i++) {
                    cc.fillStyle = r() < 0.55 ? D.shade(col.cork, -16) : D.shade(col.cork, 12);
                    cc.globalAlpha = 0.35 + r() * 0.35;
                    const s = 1 + r() * 2.4;
                    cc.fillRect(box.x + r() * box.w, box.y + r() * box.h, s, s * (0.6 + r() * 0.6));
                }
                cc.globalAlpha = 1;
                // old pin holes
                cc.fillStyle = 'rgba(60,35,25,0.55)';
                for (let i = 0; i < 40; i++) (cc.beginPath(), cc.arc(box.x + r() * box.w, box.y + r() * box.h, 1.3, 0, 7), cc.fill());
            },
        });
        bat([[x0, y0], [x1, y0], [x1 - f, y0 + f], [x0 + f, y0 + f]], 'cmp-batT', 0);
        bat([[x0, y1], [x0 + f, y1 - f], [x1 - f, y1 - f], [x1, y1]], 'cmp-batB', 0);
        bat([[x0, y0], [x0 + f, y0 + f], [x0 + f, y1 - f], [x0, y1]], 'cmp-batL', Math.PI / 2);
        bat([[x1, y0], [x1, y1], [x1 - f, y1 - f], [x1 - f, y0 + f]], 'cmp-batR', Math.PI / 2);
        // what else lives on the board (the deadline pages are drawn on top, they sway)
        // a postcard with a map, half hidden behind the first page
        local(c, 150, 120, -0.08, (cc) => {
            cut(cc, R(-78, -52, 156, 104), '#f3ecdc', 'cmp-map', { border: 1.8, shadow: 0.25, inner: (c2, box) => D.mapPaper(c2, box, { seed: 'cmp-map', ink: 'rgba(120,110,80,0.4)', width: 1.4 }) });
        });
        pin(c, 102, 86, col.green, 'map');
        // a polaroid of the sea, lower left
        local(c, 132, 470, 0.07, (cc) => {
            cut(cc, R(-48, -56, 96, 112), '#fbfaf5', 'cmp-pol', { border: 1.6, shadow: 0.25, tex: { alpha: [0.1, 0.2] } });
            flat(cc, R(-40, -48, 80, 74), '#a9d0dc', 'cmp-polsky', { tex: { alpha: [0.2, 0.3] } });
            flat(cc, R(-40, -6, 80, 32), '#3f78a8', 'cmp-polsea', { tex: { alpha: [0.2, 0.4] } });
            flat(cc, [[-40, 26], [-40, 8], [-10, 14], [20, 4], [40, 12], [40, 26]], '#e6cf9a', 'cmp-polsand', { tex: { alpha: [0.2, 0.4] } });
            flat(cc, ell(18, -28, 10, 10, 20), '#f2d68a', 'cmp-polsun', { tex: false });
            P.markerStroke(cc, [[-26, 42], [14, 40]], '#6d6474', 2, 'cmp-poltext', 0.6);
        });
        pin(c, 132, 422, col.coral, 'pol');
        // right column: sticky note, to-do list, receipt, colour swatches
        local(c, 712, 118, 0.07, (cc) => sticky(cc, 92, 86, col.sticky, 'cmp-stk1'));
        pin(c, 712, 86, col.navy, 'stk1');
        local(c, 706, 280, -0.04, (cc) => cut(cc, R(-44, -72, 88, 144), '#fbfaf5', 'cmp-todo', {
            border: 1.6, shadow: 0.25, tex: { alpha: [0.1, 0.2] },
            inner: (c2) => {
                c2.fillStyle = 'rgba(120,150,200,0.5)';
                for (let y = -50; y < 72; y += 15) c2.fillRect(-44, y, 88, 1.1);
                c2.fillStyle = 'rgba(220,120,110,0.6)';
                c2.fillRect(-30, -72, 1.2, 144);
                for (let k = 0; k < 7; k++) {
                    c2.strokeStyle = '#3f3a55';
                    c2.globalAlpha = 0.7;
                    c2.lineWidth = 1.3;
                    c2.strokeRect(-24, -60 + k * 15 + 3, 7, 7);
                    if (k < 5) P.markerStroke(c2, [[-24, -60 + k * 15 + 6], [-21, -60 + k * 15 + 10], [-15, -60 + k * 15 + 1]], col.green, 2, 'cmp-tick' + k, 0.9);
                }
                c2.globalAlpha = 1;
                D.cursive(c2, { x: -12, y: -64, w: 50, h: 104 }, '#3f3a55', { lineH: 15, xh: 4.4, hw: 3, width: 1, alpha: 0.7, gap: 5, seed: 'cmp-todo' });
            },
        }));
        pin(c, 706, 214, col.green, 'todo');
        local(c, 714, 444, 0.05, (cc) => {
            const zig = [];
            for (let i = 0; i <= 10; i++) zig.push([-36 + i * 7.2, 58 + (i % 2 ? 6 : 0)]);
            cut(cc, [[-36, -58], [36, -58], ...zig.reverse()], '#f7f3ea', 'cmp-rcpt', {
                border: 1.4, shadow: 0.25, tex: { alpha: [0.1, 0.25] },
                inner: (c2) => {
                    D.wordBars(c2, { x: -28, y: -48, w: 56, h: 72 }, { cols: 28, rowH: 7, barH: 2.2, ink: '#7d7390', seed: 'cmp-rcpt' });
                    c2.fillStyle = 'rgba(40,30,40,0.6)';
                    c2.fillRect(-28, 34, 56, 2.4);
                    c2.fillRect(8, 40, 20, 5);
                },
            });
        });
        pin(c, 714, 394, col.coral, 'rcpt');
        // a business card and a swatch strip at the bottom, between the pages
        local(c, 380, 494, -0.05, (cc) => cut(cc, R(-58, -30, 116, 60), col.coral, 'cmp-bcard', {
            border: 1.6, shadow: 0.25,
            inner: (c2) => {
                c2.fillStyle = '#fbf2ea';
                c2.globalAlpha = 0.9;
                c2.fillRect(-44, -14, 46, 7);
                c2.fillRect(-44, 2, 64, 4);
                c2.fillRect(-44, 12, 52, 4);
                c2.beginPath();
                c2.arc(34, -8, 10, 0, 7);
                c2.fill();
                c2.globalAlpha = 1;
            },
        }));
        pin(c, 336, 474, col.green, 'bcard');
        local(c, 560, 500, 0.06, (cc) => {
            cut(cc, R(-54, -20, 108, 40), '#fbfaf5', 'cmp-swatch', { border: 1.4, shadow: 0.25, tex: false });
            [col.coral, col.green, col.navy, col.mustard].forEach((cl, k) => flat(cc, R(-48 + k * 25, -14, 21, 28), cl, 'cmp-sw' + k, { tex: { alpha: [0.2, 0.3] } }));
        });
        pin(c, 520, 486, col.mustard, 'sw');
        // the nail on the right batten and the twine's knot
        cut(c, ell(TW_A[0], TW_A[1], 5, 5, 16), col.metal, 'cmp-nail', { border: 1, shadow: 0.35 });
    }
    function clockFace(c) {
        const col = C(), { x, y, r } = CLOCK;
        cut(c, ell(x, y, r, r, 72), col.navy, 'cmp-clockrim', { border: 2.8, shadow: 0.3, tex: { alpha: [0.25, 0.45] } });
        cut(c, ell(x, y, r - 15, r - 15, 72), '#fbf6ea', 'cmp-clockface', { border: 0, shadow: 0.25, tex: { alpha: [0.1, 0.22] } });
        for (let k = 0; k < 60; k++) {
            const a = (k / 60) * Math.PI * 2, big = k % 5 === 0, r0 = r - (big ? 34 : 26), r1 = r - 21;
            if (!big) {
                c.fillStyle = 'rgba(42,37,48,0.45)';
                c.beginPath();
                c.arc(x + Math.cos(a) * r1, y + Math.sin(a) * r1, 1.5, 0, 7);
                c.fill();
            } else P.markerStroke(c, [[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * r1, y + Math.sin(a) * r1]], col.ink, k % 15 === 0 ? 5.6 : 3.6, 'cmp-tk' + k, 0.85);
        }
        // the maker's name as a printed bar and a little coral logo dot
        c.fillStyle = 'rgba(42,37,48,0.35)';
        c.fillRect(x - 16, y + 34, 32, 3);
        c.fillStyle = col.coral;
        c.beginPath();
        c.arc(x, y - 36, 3.2, 0, 7);
        c.fill();
        cut(c, ell(x, y - r - 8, 4, 4, 12), col.metal, 'cmp-clockhook', { border: 1, shadow: 0.3 });
    }
    function bookcase(c) {
        // the bookcase's side at the right edge (nearer than the wall, cropped by the frame)
        const col = C();
        cut(c, [[1566, -60], [1680, -60], [1680, 780], [1566, 780]], col.wood, 'cmp-bcside', { border: 2.4, shadow: 0.3, inner: (cc, box) => D.woodGrain(cc, box, col.wood, { seed: 'cmp-bcside', angle: Math.PI / 2 }) });
        cut(c, [[1566, 330], [1680, 330], [1680, 352], [1566, 352]], col.woodDark, 'cmp-bcshelf', { border: 1.8, shadow: 0.3 });
        [[1580, 330, 30, 170, col.coral], [1612, 330, 26, 190, col.green], [1640, 330, 34, 160, col.navy]].forEach(([bx, by, w, h, cl], i) => {
            cut(c, R(bx, by - h, w, h), cl, 'cmp-bk' + i, {
                border: 1.8, shadow: 0.22, tex: { angle: Math.PI / 2, alpha: [0.25, 0.5] },
                inner: (cc) => {
                    cc.fillStyle = D.shade(cl, -14);
                    cc.fillRect(bx - 2, by - h + 10, w + 4, 4);
                    cc.fillRect(bx - 2, by - 18, w + 4, 4);
                    cc.fillStyle = '#f6efdf';
                    cc.fillRect(bx + w * 0.2, by - h * 0.7, w * 0.6, h * 0.24);
                },
            });
        });
    }
    function desk(c) {
        const col = C();
        cut(c, [[-60, DESK_Y], [1680, DESK_Y - 6], [1680, 842], [-60, 848]], col.woodLight, 'cmp-desktop', { border: 2.2, shadow: 0.2, inner: (cc, box) => D.woodGrain(cc, box, col.woodLight, { seed: 'cmp-desktop', angle: -0.004 }) });
        cut(c, [[-60, 840], [1680, 834], [1680, 960], [-60, 960]], col.woodDark, 'cmp-deskedge', { border: 2.2, shadow: 0.3, inner: (cc, box) => D.woodGrain(cc, box, col.woodDark, { seed: 'cmp-deskedge' }) });
        // the ink pad beside the mailbox (the left of the desk stays calm: the title sits there)
        local(c, 196, 0, 0, (cc) => {
            cut(cc, [[866, 790], [990, 786], [988, 754], [872, 758]], D.shade(col.navy, 8), 'cmp-padlid', { border: 1.8, shadow: 0.25, tex: { alpha: [0.2, 0.4] } });
            cut(cc, [[856, 816], [998, 814], [994, 790], [862, 792]], col.navy, 'cmp-padtin', { border: 2, shadow: 0.3, tex: { alpha: [0.2, 0.4] } });
            cut(cc, [[866, 796], [988, 794], [984, 786], [872, 788]], col.coral, 'cmp-pad', { border: 1, shadow: 0.1, tex: { alpha: [0.3, 0.5] } });
            cc.fillStyle = 'rgba(255,255,255,0.35)';
            cc.fillRect(868, 804, 110, 2);
        });
    }
    // a floating shelf above the stamping zone: box files, a trailing plant, flat books
    function shelf(c) {
        const col = C();
        for (const bx of [972, 1296]) cut(c, [[bx - 6, 110], [bx + 6, 110], [bx + 4, 150], [bx - 26 * Math.sign(bx - 1100), 112]], col.metal, 'cmp-brk' + bx, { border: 1.4, shadow: 0.3 });
        const files = [[986, 34, col.navy], [1026, 30, col.coral], [1062, 36, col.green], [1104, 32, col.kraft]];
        files.forEach(([x, w, cl], i) => cut(c, R(x, 96 - 100 + i * 3, w, 100 - i * 3), cl, 'cmp-file' + i, {
            border: 1.8, shadow: 0.22, tex: { angle: Math.PI / 2, alpha: [0.25, 0.5] },
            inner: (cc) => {
                cc.fillStyle = '#f6efdf';
                cc.fillRect(x + 6, 10 + i * 3, w - 12, 30);
                cc.fillStyle = 'rgba(42,37,48,0.5)';
                cc.fillRect(x + 10, 18 + i * 3, w - 20, 3);
                cc.fillRect(x + 10, 26 + i * 3, w - 24, 2);
                // the finger hole
                cc.fillStyle = D.shade(cl, -30);
                cc.beginPath();
                cc.ellipse(x + w / 2, 70, 5, 9, 0, 0, 7);
                cc.fill();
            },
        }));
        // two books lying flat and a small wooden box on them
        cut(c, R(1150, 80, 104, 16), col.mustard, 'cmp-fb1', { border: 1.6, shadow: 0.22, tex: { alpha: [0.25, 0.5] } });
        cut(c, R(1156, 66, 94, 14), col.navy, 'cmp-fb2', { border: 1.6, shadow: 0.22, tex: { alpha: [0.25, 0.5] } });
        cut(c, R(1172, 40, 56, 26), col.woodLight, 'cmp-box', { border: 1.6, shadow: 0.22, inner: (cc, box) => D.woodGrain(cc, box, col.woodLight, { seed: 'cmp-box' }) });
        // a pot with a trailing plant spilling over the edge
        cut(c, D.cspline([[1268, 96], [1262, 50], [1318, 50], [1312, 96]], 4), col.terracotta, 'cmp-pot', { border: 1.8, shadow: 0.25, tex: { alpha: [0.25, 0.45] } });
        cut(c, R(1258, 46, 64, 10), D.shade(col.terracotta, 8), 'cmp-potrim', { border: 1.4, shadow: 0.2 });
        const r = P.rng('cmp-ivy');
        for (let v = 0; v < 3; v++) {
            const vine = D.spline([[1280 + v * 14, 50], [1300 + v * 20 - 30, 110], [1310 + v * 8, 170 + v * 30], [1300 + v * 18, 220 + v * 40]], 10, false);
            P.markerStroke(c, vine, col.leafDark, 2.2, 'cmp-vine' + v, 0.9);
            for (let k = 2; k < vine.length; k += 3) {
                const [lx, ly] = vine[k], a = r() * 6.28;
                cut(c, xf(D.spline([[0, 0], [7, -5], [12, 0], [7, 5]], 5), lx, ly, a, 1.1 + r() * 0.3), k % 2 ? col.leaf : col.leafLight, 'cmp-ivyl' + v + k, { border: 1.1, shadow: 0.25 });
            }
        }
        for (let k = 0; k < 7; k++) {
            const a = -Math.PI / 2 + (k - 3) * 0.35;
            cut(c, xf(D.spline([[0, 0], [7, -5], [14, 0], [7, 5]], 5), 1290 + Math.cos(a) * 16, 48 + Math.sin(a) * 12, a, 1.4), k % 2 ? col.leaf : col.leafLight, 'cmp-potl' + k, { border: 1.1, shadow: 0.25 });
        }
        // the board itself, in front of everything it holds
        cut(c, R(950, 96, 370, 16), col.woodLight, 'cmp-shelf', { border: 2, shadow: 0.3, inner: (cc, box) => D.woodGrain(cc, box, col.woodLight, { seed: 'cmp-shelf' }) });
        // a framed print under the clock
        const fx = 1450, fy = 440;
        cut(c, R(fx - 66, fy - 76, 132, 152), col.woodDark, 'cmp-frame', { border: 2, shadow: 0.3, inner: (cc, box) => D.woodGrain(cc, box, col.woodDark, { seed: 'cmp-frame' }) });
        cut(c, R(fx - 54, fy - 64, 108, 128), '#f6f0e2', 'cmp-mat', { border: 0, shadow: 0.2, tex: { alpha: [0.1, 0.2] } });
        flat(c, R(fx - 40, fy - 50, 80, 100), '#cfe3c8', 'cmp-pic', { tex: { alpha: [0.2, 0.35] } });
        flat(c, [[fx - 40, fy + 50], [fx - 40, fy + 6], [fx - 10, fy - 18], [fx + 14, fy + 4], [fx + 40, fy - 12], [fx + 40, fy + 50]], '#5f9a5a', 'cmp-pichill', { tex: { alpha: [0.2, 0.4] } });
        flat(c, [[fx - 40, fy + 50], [fx - 40, fy + 28], [fx + 40, fy + 20], [fx + 40, fy + 50]], '#3f7a4f', 'cmp-pichill2', { tex: { alpha: [0.2, 0.4] } });
        flat(c, ell(fx + 18, fy - 30, 9, 9, 20), col.coral, 'cmp-picsun', { tex: false });
    }
    function twine(c) {
        const pts = TWINE;
        P.markerStroke(c, pts.map(([x, y]) => [x + 2, y + 3]), 'rgba(40,20,30,0.2)', 4, 'cmp-twS', 0.8);
        P.markerStroke(c, pts, '#c9b089', 3.4, 'cmp-tw', 0.95);
        // the twist of the strands: short darker dashes along it
        for (let i = 2; i < pts.length - 1; i += 2) {
            const [x, y] = pts[i], [nx, ny] = pts[i + 1], a = Math.atan2(ny - y, nx - x) + 0.9;
            P.markerStroke(c, [[x - Math.cos(a) * 1.6, y - Math.sin(a) * 1.6], [x + Math.cos(a) * 1.6, y + Math.sin(a) * 1.6]], '#8f7753', 1.1, 'cmp-twd' + i, 0.7);
        }
        // the knot round the nail and a loose end
        const [ax, ay] = TW_A;
        P.markerStroke(c, Array.from({ length: 14 }, (_, j) => { const a = (j / 12) * Math.PI * 2; return [ax + Math.cos(a) * 8, ay + Math.sin(a) * 6]; }), '#c9b089', 3, 'cmp-knot', 0.95);
        P.markerStroke(c, [[ax + 2, ay + 6], [ax - 4, ay + 26], [ax + 2, ay + 40]], '#c9b089', 3, 'cmp-twend', 0.95);
    }
    function set(g) {
        sprite('cmp-set', { x: -60, y: -60, w: 1720, h: 1020 }, (c) => {
            wall(c);
            board(c);
            bookcase(c);
            shelf(c);
            clockFace(c);
            desk(c);
            twine(c);
        }, 1.1).draw(g);
    }

    // ------------------------------------------------------------------ deadline pages
    // A tear-off calendar page: sheets underneath, a binding strip, a coral band with who
    // (BRAND.copy.deadlines[i][1]) and the date (…[i][0]) printed big.
    const PAGE = { w: 250, h: 300 };
    function pageSprite(i) {
        const [date, who] = BRAND.copy.deadlines[i], col = C(), bc = BRAND.col, { w, h } = PAGE;
        return sprite('cmp-page' + i + date + who, { x: -w / 2 - 16, y: -30, w: w + 40, h: h + 50 }, (c) => {
            for (const k of [2, 1]) cut(c, [[-w / 2 + k * 2, k * 3], [w / 2 + k * 2, 2 + k * 3], [w / 2 - 3 + k * 2, h + k * 3], [-w / 2 + k * 2 - 1, h - 3 + k * 3]], D.shade(col.paper, -5 * k), 'cmp-pgu' + i + k, { border: 1.4, shadow: 0.22, tex: { alpha: [0.1, 0.2] } });
            cut(c, [[-w / 2, 0], [w / 2, 2], [w / 2 - 3, h], [-w / 2 - 1, h - 3]], col.paper, 'cmp-pg' + i, {
                border: 2, shadow: 0.2, tex: { alpha: [0.1, 0.22] },
                inner: (cc) => {
                    // binding strip, then the band with who
                    cc.fillStyle = D.shade(bc.navy, -4);
                    cc.fillRect(-w / 2 - 4, -2, w + 8, 26);
                    cc.fillStyle = bc.brand;
                    cc.fillRect(-w / 2 - 4, 24, w + 8, 52);
                    cc.fillStyle = 'rgba(255,255,255,0.18)';
                    cc.fillRect(-w / 2 - 4, 24, w + 8, 3);
                    cc.font = `700 30px "${BRAND.font}"`;
                    const ww = cc.measureText(who).width, ks = Math.min(1, (w - 34) / ww);
                    Props.print(cc, who, 0, 60, 30 * ks, '#ffffff', { weight: 700, align: 'center', alpha: 1 });
                    // perforation under the band (where the pages tear off)
                    cc.fillStyle = 'rgba(40,30,40,0.3)';
                    for (let x = -w / 2 + 6; x < w / 2; x += 9) cc.fillRect(x, 84, 5, 1.6);
                    // the date: a huge day number if it starts with one, the rest below
                    const m = /^(\d{1,2})\s+(.+)$/.exec(date);
                    const fit = (text, size, maxW, weight) => {
                        cc.font = `${weight} ${size}px "${BRAND.font}"`;
                        return size * Math.min(1, maxW / cc.measureText(text).width);
                    };
                    if (m) {
                        Props.print(cc, m[1], 0, 196, fit(m[1], 118, w - 40, 700), col.ink, { weight: 700, align: 'center', alpha: 0.95 });
                        Props.print(cc, m[2], 0, 246, fit(m[2], 34, w - 36, 500), col.ink, { weight: 500, align: 'center' });
                    } else Props.print(cc, date, 0, 200, fit(date, 48, w - 36, 700), col.ink, { weight: 700, align: 'center' });
                    // a row of small day dots at the foot, like a week strip
                    for (let k = 0; k < 7; k++) {
                        cc.fillStyle = k === 6 ? bc.brand : 'rgba(40,30,40,0.35)';
                        cc.beginPath();
                        cc.arc(-w / 2 + 36 + k * ((w - 72) / 6), h - 24, 3.2, 0, 7);
                        cc.fill();
                    }
                },
            });
            // punched holes in the binding
            for (const hx of [-w / 2 + 40, w / 2 - 40]) {
                cut(c, ell(hx, 11, 7, 7, 20), '#efe6d4', 'cmp-pgh' + i + hx, { border: 0, shadow: 0, jag: 0.5, tex: false });
                flat(c, ell(hx, 11, 5.2, 5.2, 20), '#6b4a33', 'cmp-pghi' + i + hx, { jag: 0.4, tex: { alpha: [0.2, 0.4] } });
            }
        }, 1.4);
    }
    const PAGES = [{ x: 262, y: 104, a: -0.035, pin: 'coral' }, { x: 530, y: 118, a: 0.03, pin: 'navy' }];
    const TICK = [[-58, 0], [-22, 32], [58, -44]];
    function pages(g, lt) {
        const d = drawing(lt), col = C();
        PAGES.forEach((p, i) => {
            const sway = 0.012 * Math.sin(d * 0.35 + i * 2.1) + 0.006 * Math.sin(d * 0.9 + i);
            g.save();
            g.translate(p.x, p.y);
            g.rotate(p.a + sway);
            pageSprite(i).draw(g);
            // the green tick lands on the beat (0.5, 1.0) and stays
            const t0 = 0.5 + i * 0.5, u = E.seg(q2(lt), t0, t0 + 0.25);
            if (u > 0) {
                g.save();
                g.translate(74, 150);
                g.scale(0.62, 0.62);
                D.markerPath(g, TICK, { w: 20, color: col.green, edge: '#5aa57b', seed: 'cmp-tick' + i, upto: 220 * E.out(u), seg: [30, 50] });
                g.restore();
            }
            // pin on top (does not sway: it holds the page)
            g.restore();
            sprite('cmp-pin' + i, { x: -14, y: -14, w: 30, h: 30 }, (c) => pin(c, 0, 0, col[p.pin], 'pg' + i, 9), 2).draw((g.save(), g.translate(p.x, p.y + 12), g));
            g.restore();
        });
    }

    // ------------------------------------------------------------------ the clock hands
    function clockHands(g, lt) {
        const col = C(), { x, y } = CLOCK;
        const hand = (key, len, w, cl, back = 14) => sprite('cmp-clock-' + key, { x: -w - 8, y: -len - 8, w: 2 * w + 16, h: len + back + 16 }, (c) => {
            cut(c, D.taper([[0, back], [0, -len * 0.4], [0, -len]], [w * 0.9, w, w * 0.35]), cl, 'cmp-ch' + key, { border: 1.4, shadow: 0.25, tex: { alpha: [0.2, 0.4] } });
        }, 2);
        const at = (sp, a) => (g.save(), g.translate(x, y), g.rotate(a), sp.draw(g), g.restore());
        at(hand('h', 44, 10, col.ink), (10 + 8 / 60) / 12 * Math.PI * 2);
        at(hand('m', 68, 7.5, col.ink), ((8 + lt / 10) / 60) * Math.PI * 2);
        // the second hand ticks on every beat, with a one-drawing overshoot
        const beat = Math.floor(lt * 2 + 1e-6), since = lt - beat / 2, over = since < 1 / 12 ? 0.02 : 0;
        const sec = sprite('cmp-clock-s', { x: -12, y: -86, w: 24, h: 118 }, (c) => {
            cut(c, R(-1.6, -80, 3.2, 102), col.coral, 'cmp-csec', { border: 0.9, shadow: 0.25, tex: false });
            cut(c, ell(0, 18, 6, 6, 16), col.coral, 'cmp-csecw', { border: 0.9, shadow: 0.2, tex: false });
        }, 2);
        at(sec, ((44 + beat) / 60) * Math.PI * 2 + over);
        sprite('cmp-clock-cap', { x: -12, y: -12, w: 24, h: 24 }, (c) => cut(c, ell(0, 0, 7, 7, 16), col.coral, 'cmp-ccap', { border: 1.2, shadow: 0.3 }), 2).draw((g.save(), g.translate(x, y), g));
        g.restore();
    }

    // ------------------------------------------------------------------ the chain
    // An earlier invoice, as a miniature redrawn chunkier: mark, title bar, line bars, the
    // coral total band, the QR and the green label. Three variants so no two are twins.
    const MINI = { w: 104, h: 136 };
    function miniSprite(v) {
        const { w, h } = MINI, bc = BRAND.col;
        return sprite('cmp-mini' + v, { x: -w / 2 - 10, y: -10, w: w + 20, h: h + 22 }, (c) => {
            cut(c, [[-w / 2, 0], [w / 2, 1.5], [w / 2 + 1, h], [-w / 2 + 1, h - 1]], bc.paper, 'cmp-mini' + v, {
                border: 2, paper: '#ffffff', shadow: 0.22, jag: 0.5, tex: { alpha: [0.1, 0.2] },
                inner: (cc) => {
                    Props.mark(cc, -w / 2 + 18, 18, 0.2, 'mini' + v);
                    cc.fillStyle = bc.navy;
                    cc.fillRect(w / 2 - 44, 12, 34, 6);
                    cc.fillStyle = 'rgba(40,30,40,0.35)';
                    cc.fillRect(w / 2 - 30, 22, 20, 3);
                    const r = P.rng('cmp-minil' + v);
                    for (let k = 0; k < 3; k++) {
                        cc.fillStyle = 'rgba(40,30,40,0.5)';
                        cc.fillRect(-w / 2 + 10, 44 + k * 11, 26 + r() * 22, 3.4);
                        cc.fillRect(w / 2 - 30, 44 + k * 11, 20, 3.4);
                    }
                    cc.fillStyle = bc.brand;
                    cc.globalAlpha = 0.2;
                    cc.fillRect(-w / 2 + 7, 80, w - 14, 11);
                    cc.globalAlpha = 1;
                    cc.fillStyle = bc.brand;
                    cc.fillRect(w / 2 - 36, 83, 26, 5);
                    Props.qr(cc, -w / 2 + 9, 98, 30, 'mini' + v);
                    cc.fillStyle = bc.green;
                    cc.fillRect(-w / 2 + 46, 104, 40, 5);
                    cc.fillStyle = 'rgba(40,30,40,0.35)';
                    cc.fillRect(-w / 2 + 46, 114, 30, 3);
                },
            });
        }, 1.8);
    }
    // a wooden clothes peg seen from the front: two jaws, the spring coil across them
    function pegSprite() {
        return sprite('cmp-peg', { x: -16, y: -34, w: 32, h: 76 }, (c) => {
            const col = C();
            cut(c, D.cspline([[-9, -30], [-1, -31], [0, 34], [-8, 36]], 3), '#d9b27c', 'cmp-pegL', { border: 1.4, shadow: 0.25, inner: (cc, box) => D.woodGrain(cc, box, '#d9b27c', { seed: 'pegL', angle: Math.PI / 2 }) });
            cut(c, D.cspline([[1, -31], [9, -30], [8, 36], [0, 34]], 3), D.shade('#d9b27c', -6), 'cmp-pegR', { border: 1.4, shadow: 0.25, inner: (cc, box) => D.woodGrain(cc, box, D.shade('#d9b27c', -6), { seed: 'pegR', angle: Math.PI / 2 }) });
            for (let k = 0; k < 4; k++) P.markerStroke(c, [[-11, -6 + k * 3.2], [11, -4 + k * 3.2]], col.metal, 1.8, 'cmp-spring' + k, 0.95);
        }, 2.4);
    }
    // the hash seal between two invoices: a green paper disc with a fingerprint whorl and a #
    function sealSprite() {
        return sprite('cmp-seal', { x: -26, y: -26, w: 52, h: 60 }, (c) => {
            const bc = BRAND.col;
            P.markerStroke(c, [[0, -22], [0, -10]], '#c9b089', 2.4, 'cmp-sealstring', 0.95);
            cut(c, ell(0, 8, 18, 18, 32), bc.green, 'cmp-seal', {
                border: 1.8, shadow: 0.3, tex: { alpha: [0.25, 0.45] },
                inner: (cc) => D.rings(cc, -1, 9, [[13, 14], [10, 11], [7, 8], [4, 5], [1.6, 2]], 'rgba(240,248,236,0.75)', 'cmp-print', { width: 1.3, wobble: 0.1, alpha: 0.85 }),
            });
            for (const [ax, ay, bx, by] of [[-4, -1, -6, 17], [3, -1, 1, 17], [-9, 5, 9, 5], [-10, 12, 8, 12]]) {
                /* the # engraved small over the whorl, bottom right */
                P.markerStroke(c, [[ax * 0.45 + 11, ay * 0.45 + 14], [bx * 0.45 + 11, by * 0.45 + 14]], '#fbf8f1', 1.3, 'cmp-hash' + ax + ay, 0.9);
            }
        }, 2.4);
    }
    // one hanging invoice with its peg at arc length s; sw = swing (radians)
    function hang(g, s, v, sw) {
        const p = twineAt(s);
        g.save();
        g.translate(p.x, p.y);
        g.rotate(sw);
        miniSprite(v).draw((g.save(), g.translate(0, 12), g.scale(MS, MS), g));
        g.restore();
        g.rotate(p.a * 0.5);
        pegSprite().draw(g);
        g.restore();
    }
    const NCHAIN = 5;
    const MS = 0.86; // the miniatures' scale on the twine
    function chain(g, lt) {
        const d = drawing(lt);
        // feed 3.0–4.0: everything moves one place (and a bit) towards the mailbox
        const feedU = E.inOut(E.seg(q2(lt), 3.0, 4.0)), feed = feedU * (SP + 80);
        const vel = E.seg(q2(lt), 3.0, 4.0) > 0 && lt < 4.0 ? Math.sin(Math.PI * E.seg(q2(lt), 3.0, 4.0)) : 0;
        const settle = lt >= 4.0 ? Math.sin((q2(lt) - 4.0) * 14) * Math.exp(-(q2(lt) - 4.0) * 4) : 0;
        const swing = (i) => 0.03 * Math.sin(d * 0.42 + i * 1.7) - 0.12 * vel + 0.08 * settle;
        // the invoices, oldest (left) first
        for (let i = NCHAIN; i >= 1; i--) {
            const s = S0 - i * SP + feed;
            if (s < 30) continue;
            hang(g, s, i % 3, swing(i));
        }
        if (lt >= 2.5) {
            // the new one, clicked into its peg (a small bounce on the click)
            const bump = lt < 2.75 ? E.back(E.seg(q2(lt), 2.5, 2.75)) : 1;
            hang(g, S0 + feed, 0, swing(0) + (1 - bump) * 0.2);
            if (lt < 2.84) {
                const p = twineAt(S0 + feed);
                sprite('cmp-click', { x: -80, y: -80, w: 160, h: 160 }, (c) => {
                    for (let k = 0; k < 7; k++) {
                        const a = -Math.PI * (0.05 + (k / 6) * 0.9);
                        P.markerStroke(c, [[Math.cos(a) * 44, Math.sin(a) * 44], [Math.cos(a) * 64, Math.sin(a) * 64]], BRAND.col.green, 5, 'cmp-ck' + k, 0.9);
                    }
                }, 1.6).draw((g.save(), g.translate(p.x, p.y), g));
                g.restore();
            }
        }
        // seals (in front: they tie each invoice to the one before) between neighbours (0–1 pops in at 2.5)
        for (let i = 0; i < NCHAIN; i++) {
            if (i === 0 && lt < 2.5) continue;
            const s = S0 - i * SP - SP / 2 + feed;
            if (s < 20 || s > TW_L - 30) continue;
            const pop = i === 0 ? E.back(E.seg(q2(lt), 2.5, 2.75)) : 1, p = twineAt(s);
            g.save();
            g.translate(p.x, p.y);
            g.rotate(swing(i + 0.5) * 0.6);
            g.scale(pop, pop);
            sealSprite().draw(g);
            g.restore();
        }
    }

    // ------------------------------------------------------------------ invoice, hand, stamp
    const IX = 1060, IY = 300, IS = 0.56;
    function invoice(g, lt) {
        if (lt < 1.0 || lt >= 2.5) return;
        const t = q2(lt), sheet = Props.invoiceSheet({ qr: lt >= 1.5 });
        let x, y, s, a;
        if (t < 2.0) {
            // slides in from the right (1.0–1.4), overshoots a little, settles; squashes at the stamp
            const u = E.back(E.seg(t, 1.0, 1.4));
            x = E.lerp(1760, IX, u);
            y = IY + Math.sin(drawing(lt) * 0.9) * 2;
            s = IS * (lt >= 1.5 && lt < 1.6 ? 0.97 : 1);
            a = E.lerp(0.12, -0.03, E.seg(t, 1.0, 1.5));
        } else {
            // shrinks down onto the twine: the peg's place
            const u = E.inOut(E.seg(t, 2.0, 2.42)), p = twineAt(S0);
            x = E.lerp(IX, p.x, u);
            y = E.lerp(IY, p.y + 12 + (MINI.h / 2) * MS, u) - Math.sin(Math.PI * u) * 60;
            s = E.lerp(IS, (MINI.w * MS) / Props.INV.W, u);
            a = E.lerp(-0.03, 0.08, u);
        }
        g.save();
        g.translate(x, y);
        g.rotate(a);
        g.scale(s, s);
        sheet.draw(g);
        g.restore();
    }
    // the stamp swooping in from the top left, pressing on the beat (no arm: a long arm from
    // the frame's edge read as a stretched tube)
    const STAMP = [[1.2, -380, -260], [1.34, -120, -90], [1.42, -24, -14], [1.5, 0, 0], [1.58, -6, -4], [1.7, -110, -70], [1.84, -380, -260]];
    function stampHand(g, lt) {
        if (lt < 1.2 || lt >= 1.84) return;
        const t = q2(lt), bc = BRAND.col;
        const k = STAMP.findIndex(([at]) => at > t);
        const [a0, y0, x0] = STAMP[Math.max(0, k - 1)], [a1, y1, x1] = STAMP[k < 0 ? STAMP.length - 1 : k];
        const u = k < 0 ? 1 : E.seg(t, a0, a1);
        const oy = E.lerp(y0, y1, u), ox = E.lerp(x0, x1, u);
        const sx = IX - 96 * IS + ox, sy = IY + 200 * IS + oy, ss = 0.78, rot = -0.06;
        // the stamp comes down by itself, like in «send»: the product seals it, not her arm
        Props.stamp(g, sx, sy, ss, rot);
        if (lt >= 1.5 && lt < 1.67) {
            sprite('cmp-stamp-ticks', { x: -150, y: -70, w: 300, h: 140 }, (c) => {
                for (const sd of [-1, 1]) for (let j = 0; j < 3; j++) P.markerStroke(c, [[sd * 92, -22 + j * 22], [sd * 128, -32 + j * 26]], bc.ink, 5, 'cmp-st' + sd + j, 0.9);
            }, 1.4).draw((g.save(), g.translate(IX - 96 * IS, IY + 200 * IS), g));
            g.restore();
        }
    }

    function markBR(g) {
        const kit = Props.kit;
        kit.sprite('brand-mark', { x: -70, y: -60, w: 140, h: 120 }, (c) => Props.mark(c, 0, 0, 1, 'set'), 2).draw((g.save(), g.translate(1500, 820), g.scale(0.55, 0.55), g));
        g.restore();
    }

    Shots.compliance = (g, lt, env) => {
        // a slow push, then the camera leans in on the chain as the invoice joins it (2.0–3.0)
        const push = 1 + 0.03 * E.inOut(E.seg(lt, 0, 5)), lean = 1 + 0.1 * E.inOut(E.seg(lt, 2.0, 3.2));
        g.save();
        g.translate(820, 430);
        g.scale(push, push);
        g.translate(-820, -430);
        g.translate(1150, 600);
        g.scale(lean, lean);
        g.translate(-1150, -600);
        set(g);
        pages(g, lt);
        clockHands(g, lt);
        chain(g, lt);
        // the mailbox on the desk: flag up on the beat at 4.0
        const flag = E.back(E.seg(lt, 4.0, 4.25)), sh = lt >= 4.0 && lt < 4.4 ? 1 - E.seg(lt, 4.0, 4.4) : 0;
        Props.mailbox(g, MAIL.x, MAIL.y, MAIL.s, flag, sh);
        if (lt >= 4.0 && lt < 4.4) {
            Props.kit.sprite('mail-ticks', { x: -190, y: -190, w: 380, h: 380 }, (c) => {
                for (let k = 0; k < 9; k++) {
                    const a = -Math.PI * (0.1 + (k / 8) * 0.8);
                    P.markerStroke(c, [[Math.cos(a) * 130, Math.sin(a) * 130], [Math.cos(a) * 172, Math.sin(a) * 172]], BRAND.col.brand, 6, 'mt' + k, 0.9);
                }
            }, 1.4).draw((g.save(), g.translate(MAIL.x, MAIL.y - 150), g));
            g.restore();
        }
        invoice(g, lt);
        stampHand(g, lt);
        g.restore();
        Shots.title(g, lt, 0.5, BRAND.copy.comply, 90, 826, 58, { under: BRAND.col.green });
        markBR(g);
    };
})();
