// Block «chaos» of the edit (0–6 s, see ../../scene.js EDIT). Defines Shots.chaos(g, lt, env)
// and the global Chaos (the paperwork props and the pile), which the «cloud» block reuses.
//
// Laura at her desk (the approved medium-shot set, a slow push-in). Paperwork rains onto the
// desk on the beats and piles up until it buries her up to the eyes: a ream of invoices, a
// loose invoice, a thermal receipt that curls, a printed spreadsheet, a kraft envelope, the
// phone buzzing with bank notifications, an email printout, a tri-folded bank letter, the
// accountant's folder, sticky notes, another invoice, receipt, a window envelope and a second
// spreadsheet; the last sticky note lands on her forehead. Every prop is several pieces of
// paper with its own print. Sheets flutter down (foreshortened on twos), heavy things drop;
// every landing squashes the item and the pile under it. Laura goes from calm to overwhelmed;
// her hands try to hold the pile and end up clutching its top corners.
// Title BRAND.copy.chaosLine at 3.5 s.
const Chaos = (() => {
    const P = Paper, D = PaperDetail, E = Ease;
    const sprite = (...a) => Props.sprite(...a);
    const cut = (c, pts, col, seed, o = {}) => P.cutout(c, pts, col, seed, { border: 2.2, shadow: 0.18, ...o });
    const flat = (c, pts, col, seed, o = {}) => P.cutout(c, pts, col, seed, { border: 0, shadow: 0, ...o });
    const R = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    // a sheet whose corners are a hair off square (cut paper is never a perfect rectangle)
    const sheetPts = (w, h, k = 1) => [[-w / 2, -h / 2], [w / 2, -h / 2 + 1.2 * k], [w / 2 + 0.8 * k, h / 2], [-w / 2 + 0.6 * k, h / 2 - 0.8 * k]];
    const drawing = (t) => Math.floor(t * 12 + 1e-6);
    const q = (t) => drawing(t) / 12; // time quantised on twos (12 drawings per second)
    const INK = '#2a2530', GREY = '#8d8a92', THERMAL = '#58526c';
    const COL = {
        white: '#fdfbf6', cream: '#f6f0e2', kraft: '#c9a06b', manila: '#dcb56d', navy: '#1f3a8a', coral: '#d2563f',
        green: '#1c7048', mint: '#9ad0b8', sticky: '#f3d56b', pink: '#f0a28e', thermal: '#f4f2ec', phone: '#262a3d',
    };
    const print = (c, s, x, y, size, color, o = {}) => Props.print(c, s, x, y, size, color, { mono: true, ...o });
    // an amount such as 1,284.50 from a seeded generator
    const amount = (r, max = 2400) => {
        const v = 12 + Math.floor(r() * max), cents = String(Math.floor(r() * 100)).padStart(2, '0');
        return (v >= 1000 ? Math.floor(v / 1000) + ',' + String(v % 1000).padStart(3, '0') : String(v)) + '.' + cents;
    };
    const bars = (c, x, y, w, h, color, alpha = 0.85) => ((c.globalAlpha = alpha), (c.fillStyle = color), c.fillRect(x, y, w, h), (c.globalAlpha = 1));
    // a small bank glyph (pediment, three columns, base) in `fg` on a `bg` tile
    function bankIcon(c, x, y, s, bg, fg = '#ffffff') {
        c.save();
        c.translate(x, y);
        c.scale(s, s);
        c.fillStyle = bg;
        c.beginPath();
        c.roundRect(-10, -10, 20, 20, 4);
        c.fill();
        c.fillStyle = fg;
        c.beginPath();
        c.moveTo(-7, -3);
        c.lineTo(0, -7.5);
        c.lineTo(7, -3);
        c.fill();
        for (const cx of [-5, -0.9, 3.2]) c.fillRect(cx, -2, 1.8, 6.5);
        c.fillRect(-7, 5, 14, 1.8);
        c.restore();
    }
    // a coffee ring left by a mug: two broken arcs, translucent
    function coffeeRing(c, x, y, r, seed) {
        const rr = P.rng('ring' + seed);
        c.save();
        c.strokeStyle = 'rgba(128,84,44,0.22)';
        c.lineCap = 'round';
        for (let k = 0; k < 2; k++) {
            c.lineWidth = k ? 1.2 : 2.6;
            c.beginPath();
            const a0 = rr() * 6.28;
            c.arc(x + k * 1.5, y + k, r - k * 2, a0, a0 + 4.2 + rr() * 1.6);
            c.stroke();
        }
        c.restore();
    }
    // a stamp's perforated outline: a rectangle whose edges are a row of small bites
    function perforated(x, y, w, h, step = 4.2) {
        const out = [];
        const edge = (ax, ay, bx, by, nx, ny) => {
            const L = Math.hypot(bx - ax, by - ay), n = Math.max(2, Math.round(L / step));
            for (let i = 0; i < n; i++) {
                const u = i / n, u2 = (i + 0.5) / n;
                out.push([ax + (bx - ax) * u, ay + (by - ay) * u]);
                out.push([ax + (bx - ax) * u2 + nx * 1.4, ay + (by - ay) * u2 + ny * 1.4]);
            }
        };
        edge(x, y, x + w, y, 0, 1);
        edge(x + w, y, x + w, y + h, -1, 0);
        edge(x + w, y + h, x, y + h, 0, -1);
        edge(x, y + h, x, y, 1, 0);
        return out;
    }

    // ============================================================== the paperwork, one per kind
    // Each drawer paints one prop centred on (0, 0) into c. Sizes in ITEM_SIZE.
    const ITEM_SIZE = {
        ream: [360, 54], invoice: [200, 262], receipt: [92, 256], sheet: [284, 204], envKraft: [232, 150],
        envWindow: [232, 142], phone: [114, 216], email: [212, 282], letter: [204, 276], folder: [292, 236], sticky: [84, 84],
    };

    // A supplier's invoice: letterhead, meta block, a table of lines, a tinted total, a
    // signature, a fold crease and a coffee ring. accent = the supplier's colour.
    function invoice(c, seed, accent) {
        const [w, h] = ITEM_SIZE.invoice, x0 = -w / 2, y0 = -h / 2, r = P.rng('inv' + seed);
        cut(c, sheetPts(w, h), COL.white, 'inv' + seed, {
            paper: '#ffffff', jag: 0.5, tex: { alpha: [0.06, 0.16] },
            inner: (cc) => {
                // letterhead: a round logo and the supplier's name and address
                cc.fillStyle = accent;
                cc.beginPath();
                cc.arc(x0 + 26, y0 + 28, 11, 0, 7);
                cc.fill();
                cc.fillStyle = '#ffffff';
                cc.beginPath();
                cc.arc(x0 + 26, y0 + 28, 5, 0, 7);
                cc.fill();
                bars(cc, x0 + 44, y0 + 19, 62, 6, INK);
                D.wordBars(cc, { x: x0 + 44, y: y0 + 29, w: 70, h: 14 }, { cols: 70, rowH: 5.4, barH: 2, ink: GREY, seed: 'ih' + seed });
                // «INVOICE» as a heavy bar in the accent, the number and date in mono under it
                bars(cc, w / 2 - 78, y0 + 18, 60, 10, accent, 0.9);
                print(cc, 'Nº ' + (100 + Math.floor(r() * 800)), w / 2 - 18, y0 + 44, 9.5, GREY, { align: 'right' });
                print(cc, '0' + (1 + Math.floor(r() * 9)) + '/0' + (1 + Math.floor(r() * 9)) + '/26', w / 2 - 18, y0 + 56, 9.5, GREY, { align: 'right' });
                // billed-to block
                bars(cc, x0 + 16, y0 + 72, 30, 4, GREY);
                bars(cc, x0 + 16, y0 + 80, 74, 6, INK);
                bars(cc, x0 + 16, y0 + 90, 56, 4, GREY);
                // the table: header band, lines, rules
                cc.fillStyle = accent;
                cc.globalAlpha = 0.14;
                cc.fillRect(x0 + 12, y0 + 104, w - 24, 14);
                cc.globalAlpha = 1;
                bars(cc, x0 + 18, y0 + 109, 30, 4, INK, 0.6);
                bars(cc, w / 2 - 50, y0 + 109, 32, 4, INK, 0.6);
                for (let i = 0; i < 5; i++) {
                    const y = y0 + 134 + i * 16;
                    bars(cc, x0 + 18, y - 7, 36 + r() * 50, 5, INK, 0.7);
                    print(cc, amount(r, 900), w / 2 - 18, y, 10, INK, { align: 'right' });
                    cc.fillStyle = 'rgba(40,30,40,0.1)';
                    cc.fillRect(x0 + 12, y + 4, w - 24, 1);
                }
                // the total on a tinted band
                cc.fillStyle = accent;
                cc.globalAlpha = 0.2;
                cc.fillRect(w / 2 - 110, y0 + 216, 98, 18);
                cc.globalAlpha = 1;
                bars(cc, w / 2 - 104, y0 + 222, 26, 6, INK);
                print(cc, amount(r, 3000), w / 2 - 16, y0 + 230, 11, accent, { align: 'right', weight: 700 });
                // signature and footer
                D.cursive(cc, { x: x0 + 18, y: y0 + 208, w: 70, h: 20 }, '#26357a', { seed: 'isig' + seed, lineH: 20, xh: 6, hw: 4, width: 1.2, alpha: 0.8 });
                D.wordBars(cc, { x: x0 + 14, y: h / 2 - 16, w: w - 28, h: 8 }, { cols: w, rowH: 4, barH: 1.4, ink: '#b2aea8', seed: 'if' + seed });
                coffeeRing(cc, x0 + 60 + r() * 60, y0 + 150 + r() * 40, 26, seed);
            },
        });
        D.crease(c, [x0 + 2, -h / 6], [w / 2 - 2, -h / 6 + 1], { width: 1.2, dark: 'rgba(80,70,60,0.28)' });
    }

    // A thermal receipt: saw-torn top, faded purple-grey print, a barcode, and the bottom end
    // curling towards the camera (the roll is its own piece: the back of the paper, the curl).
    function receipt(c, seed) {
        const [w, h] = ITEM_SIZE.receipt, x0 = -w / 2, y0 = -h / 2, r = P.rng('rc' + seed), body = h - 34;
        const top = [];
        for (let x = x0; x <= -x0 + 0.1; x += 6) top.push([x, y0 + ((x - x0) / 6) % 2 * 3.4]);
        const pts = [...top, [-x0, y0 + body], [x0, y0 + body]];
        cut(c, pts, COL.thermal, 'rc' + seed, {
            border: 1.8, paper: '#ffffff', jag: 0.4, tex: { alpha: [0.05, 0.12] },
            inner: (cc) => {
                const cx = 0;
                // shop name (heavy bar) and address, centred
                bars(cc, cx - 28, y0 + 14, 56, 7, THERMAL);
                D.wordBars(cc, { x: cx - 32, y: y0 + 26, w: 64, h: 10 }, { cols: 64, rowH: 4.6, barH: 1.6, ink: THERMAL, seed: 'ra' + seed });
                print(cc, '0' + (1 + Math.floor(r() * 8)) + '/06 1' + Math.floor(r() * 9) + ':' + (10 + Math.floor(r() * 49)), cx, y0 + 50, 7.5, THERMAL, { align: 'center' });
                const dash = (y) => { cc.save(); cc.strokeStyle = THERMAL; cc.globalAlpha = 0.6; cc.setLineDash([2.5, 2]); cc.lineWidth = 0.9; cc.beginPath(); cc.moveTo(x0 + 6, y); cc.lineTo(-x0 - 6, y); cc.stroke(); cc.restore(); };
                dash(y0 + 56);
                for (let i = 0; i < 6; i++) {
                    const y = y0 + 70 + i * 13;
                    bars(cc, x0 + 8, y - 5, 18 + r() * 22, 3.6, THERMAL, 0.8);
                    print(cc, amount(r, 90), -x0 - 7, y, 7.5, THERMAL, { align: 'right' });
                }
                dash(y0 + 150);
                bars(cc, x0 + 8, y0 + 159, 28, 6, THERMAL);
                print(cc, amount(r, 300), -x0 - 7, y0 + 166, 10, THERMAL, { align: 'right', weight: 700 });
                dash(y0 + 174);
                // barcode
                let bx = x0 + 12;
                cc.fillStyle = THERMAL;
                while (bx < -x0 - 12) {
                    const bw = 0.8 + Math.floor(r() * 3) * 0.8;
                    cc.globalAlpha = 0.85;
                    cc.fillRect(bx, y0 + 182, bw, 22);
                    bx += bw + 0.8 + r() * 1.6;
                }
                cc.globalAlpha = 1;
                // a faded streak where the thermal head ran dry
                cc.fillStyle = COL.thermal;
                cc.globalAlpha = 0.45;
                cc.fillRect(x0, y0 + 118, w, 6);
                cc.globalAlpha = 1;
            },
        });
        // the curl: the back of the paper showing above a rolled band
        const yb = y0 + body;
        cut(c, [[x0 + 1, yb - 3], [-x0 - 1, yb - 3], [-x0 - 3, yb + 5], [x0 + 3, yb + 5]], D.shade(COL.thermal, -14), 'rcback' + seed, { border: 1.2, shadow: 0.1, tex: { alpha: [0.05, 0.1] } });
        cut(c, P.roundRect(x0 + 1, yb + 2, w - 2, 26, 12), D.shade(COL.thermal, -5), 'rcroll' + seed, {
            border: 1.6, shadow: 0.25, tex: { alpha: [0.05, 0.12] },
            inner: (cc) => {
                cc.fillStyle = 'rgba(255,255,255,0.7)';
                cc.fillRect(x0 + 6, yb + 7, w - 12, 2.2);
                cc.fillStyle = 'rgba(70,60,80,0.14)';
                cc.fillRect(x0, yb + 19, w, 9);
                // the print wraps round the roll: a few faint bars upside down
                cc.fillStyle = THERMAL;
                cc.globalAlpha = 0.25;
                cc.fillRect(x0 + 10, yb + 12, 30, 2);
                cc.fillRect(x0 + 50, yb + 12, 22, 2);
                cc.globalAlpha = 1;
            },
        });
    }

    // A printed spreadsheet: column letters and row numbers, a grid of amounts, a highlighted
    // row, a negative in red, a bold total, binder holes and a dog-eared corner.
    function spreadsheet(c, seed) {
        const [w, h] = ITEM_SIZE.sheet, x0 = -w / 2, y0 = -h / 2, r = P.rng('ss' + seed), ear = 26;
        const pts = [[x0, y0], [-x0 - ear, y0 + 1], [-x0, y0 + ear], [-x0 + 0.6, -y0], [x0 + 0.5, -y0 - 0.8]];
        cut(c, pts, COL.white, 'ss' + seed, {
            paper: '#ffffff', jag: 0.5, tex: { alpha: [0.05, 0.14] },
            inner: (cc) => {
                const gx = x0 + 30, gy = y0 + 20, cw = [22, 58, 44, 44, 44, 44], rh = 12.4, rows = 13;
                const colX = [gx];
                for (const k of cw) colX.push(colX[colX.length - 1] + k);
                // header row and row numbers
                cc.fillStyle = '#dfe9dc';
                cc.fillRect(gx, gy, colX[colX.length - 1] - gx, rh);
                cc.fillStyle = '#eceae4';
                cc.fillRect(gx, gy + rh, cw[0], rh * (rows - 1));
                'ABCDE'.split('').forEach((L, i) => print(cc, L, (colX[i + 1] + colX[i + 2]) / 2, gy + 9, 7.5, GREY, { align: 'center' }));
                for (let j = 1; j < rows; j++) print(cc, String(j), gx + 11, gy + j * rh + 9, 7, GREY, { align: 'center' });
                // a highlighted row and a highlighted cell
                cc.fillStyle = '#f6e27a';
                cc.globalAlpha = 0.55;
                cc.fillRect(colX[1], gy + rh * 5, colX[colX.length - 1] - colX[1], rh);
                cc.fillStyle = '#9ad0b8';
                cc.fillRect(colX[4], gy + rh * 9, cw[4], rh);
                cc.globalAlpha = 1;
                // cells: a label column (bars) and four columns of amounts
                for (let j = 1; j < rows - 1; j++) {
                    bars(cc, colX[1] + 4, gy + j * rh + 4, 16 + r() * 30, 4.2, INK, 0.65);
                    for (let i = 2; i < 6; i++) {
                        const neg = r() < 0.06;
                        print(cc, (neg ? '-' : '') + amount(r, i === 5 ? 3000 : 700), colX[i + 1] - 3, gy + j * rh + 9, 7, neg ? COL.coral : INK, { align: 'right' });
                    }
                }
                // bold total row with a double rule over it
                const ty = gy + (rows - 1) * rh;
                cc.fillStyle = INK;
                cc.fillRect(colX[1], ty, colX[colX.length - 1] - colX[1], 1.2);
                cc.fillRect(colX[1], ty + 2.4, colX[colX.length - 1] - colX[1], 0.8);
                bars(cc, colX[1] + 4, ty + 4, 26, 5, INK);
                for (let i = 2; i < 6; i++) print(cc, amount(r, 9000), colX[i + 1] - 3, ty + 10, 7.5, INK, { align: 'right', weight: 700 });
                // the grid
                cc.strokeStyle = 'rgba(60,60,70,0.22)';
                cc.lineWidth = 0.7;
                cc.beginPath();
                for (const x of colX) (cc.moveTo(x, gy), cc.lineTo(x, gy + rows * rh));
                for (let j = 0; j <= rows; j++) (cc.moveTo(gx, gy + j * rh), cc.lineTo(colX[colX.length - 1], gy + j * rh));
                cc.stroke();
                // page footer
                D.wordBars(cc, { x: gx, y: -y0 - 12, w: 90, h: 6 }, { cols: 90, rowH: 4, barH: 1.4, ink: '#b2aea8', seed: 'sf' + seed });
            },
        });
        // binder holes down the left margin (painted: dark inside a torn rim)
        for (const y of [-58, 0, 58]) {
            cut(c, P.ellipse(x0 + 13, y, 6.4, 6.4, 20), '#efe9dc', 'ssrim' + seed + y, { border: 0, shadow: 0, jag: 0.5, tex: false });
            flat(c, P.ellipse(x0 + 13, y, 4.6, 4.6, 20), '#3a3340', 'sshole' + seed + y, { jag: 0.4, tex: { alpha: [0.2, 0.4] } });
        }
        // the folded-down corner: its own piece (the back of the paper), with a crease
        cut(c, [[-x0 - ear, y0 + 1], [-x0, y0 + ear], [-x0 - ear + 3, y0 + ear - 2]], D.shade(COL.white, -12), 'ssear' + seed, { border: 1.2, shadow: 0.3 });
        D.crease(c, [-x0 - ear, y0 + 1], [-x0, y0 + ear], { width: 1 });
    }

    // Envelopes. Kraft: a handwritten address, a stamp with perforations and a postmark.
    // Window: a bank's envelope, the logo, the typed address behind cellophane, an urgent tab.
    function envelope(c, seed, kind) {
        const window = kind === 'envWindow', [w, h] = ITEM_SIZE[kind], x0 = -w / 2, y0 = -h / 2, r = P.rng('env' + seed);
        const base = window ? '#f3f4f7' : COL.kraft;
        cut(c, sheetPts(w, h), base, 'env' + seed, {
            border: 2.2, jag: 0.6, tex: { alpha: window ? [0.06, 0.14] : [0.25, 0.45] },
            inner: (cc) => {
                // the flap's fold seen through the paper: two faint diagonals from the top corners
                cc.strokeStyle = D.shade(base, -12);
                cc.globalAlpha = 0.35;
                cc.lineWidth = 1.2;
                cc.beginPath();
                cc.moveTo(x0, y0 + 4);
                cc.lineTo(0, y0 + h * 0.42);
                cc.lineTo(-x0, y0 + 4);
                cc.stroke();
                cc.globalAlpha = 1;
                if (window) {
                    bankIcon(cc, x0 + 24, y0 + 24, 1, COL.navy);
                    bars(cc, x0 + 40, y0 + 18, 52, 6, COL.navy);
                    bars(cc, x0 + 40, y0 + 27, 34, 3.2, GREY);
                    // the window: cellophane over the typed address
                    cc.fillStyle = '#ffffff';
                    cc.fillRect(x0 + 24, y0 + 58, 124, 50);
                    D.wordBars(cc, { x: x0 + 32, y: y0 + 66, w: 100, h: 36 }, { cols: 100, rowH: 9, barH: 3.6, ink: INK, seed: 'ew' + seed });
                    cc.fillStyle = 'rgba(190,210,230,0.28)';
                    cc.fillRect(x0 + 24, y0 + 58, 124, 50);
                    cc.strokeStyle = 'rgba(120,130,150,0.5)';
                    cc.lineWidth = 1.2;
                    cc.strokeRect(x0 + 24, y0 + 58, 124, 50);
                    cc.fillStyle = 'rgba(255,255,255,0.6)';
                    cc.fillRect(x0 + 30, y0 + 61, 40, 2);
                    // barcode strip along the bottom
                    let bx = x0 + 20;
                    cc.fillStyle = INK;
                    while (bx < x0 + 150) {
                        const bw = 0.8 + Math.floor(r() * 2) * 1.2;
                        cc.fillRect(bx, -y0 - 18, bw, 8);
                        bx += bw + 1.4;
                    }
                } else {
                    D.cursive(cc, { x: x0 + 46, y: y0 + 60, w: 118, h: 60 }, '#2c2a4a', { seed: 'ea' + seed, lineH: 17, xh: 5.5, hw: 4.2, width: 1.4, alpha: 0.85, gap: 6 });
                    // postmark rings and wavy cancel lines over the stamp's corner
                    cc.strokeStyle = 'rgba(40,40,70,0.45)';
                    cc.lineWidth = 1.3;
                    for (const rr of [17, 12]) (cc.beginPath(), cc.arc(w / 2 - 70, y0 + 34, rr, 0, 7), cc.stroke());
                    cc.beginPath();
                    for (let k = 0; k < 3; k++) {
                        for (let x = 0; x <= 70; x += 3) {
                            const px = w / 2 - 52 + x, py = y0 + 26 + k * 8 + Math.sin(x * 0.3) * 2;
                            x ? cc.lineTo(px, py) : cc.moveTo(px, py);
                        }
                    }
                    cc.stroke();
                }
            },
        });
        if (window) {
            // an URGENT tab in the corner: coral paper, white lettering as bars
            cut(c, [[w / 2 - 64, y0 + 12], [w / 2 - 12, y0 + 10], [w / 2 - 12, y0 + 30], [w / 2 - 64, y0 + 32]], COL.coral, 'eurg' + seed, {
                border: 1.4, shadow: 0.2, inner: (cc) => bars(cc, w / 2 - 56, y0 + 18, 36, 6, '#ffffff', 0.95),
            });
        } else {
            // the stamp: perforated white paper, a little printed picture inside
            const sx = w / 2 - 52, sy = y0 + 10;
            cut(c, perforated(sx, sy, 38, 44), '#fbf6ea', 'estamp' + seed, {
                border: 0.8, shadow: 0.25, jag: 0.2, tex: false,
                inner: (cc) => {
                    cc.fillStyle = '#bcdde3';
                    cc.fillRect(sx + 4, sy + 4, 30, 36);
                    cc.fillStyle = COL.coral;
                    cc.beginPath();
                    cc.arc(sx + 24, sy + 14, 5, 0, 7);
                    cc.fill();
                    cc.fillStyle = COL.green;
                    cc.beginPath();
                    cc.moveTo(sx + 4, sy + 40);
                    cc.lineTo(sx + 14, sy + 22);
                    cc.lineTo(sx + 22, sy + 32);
                    cc.lineTo(sx + 28, sy + 26);
                    cc.lineTo(sx + 34, sy + 40);
                    cc.fill();
                    print(cc, '0.' + (50 + Math.floor(r() * 49)), sx + 6, sy + 38, 6.5, '#ffffff');
                },
            });
            // the cancel lines again on top of the stamp
            c.save();
            c.strokeStyle = 'rgba(40,40,70,0.45)';
            c.lineWidth = 1.3;
            c.beginPath();
            c.arc(sx - 18, sy + 24, 17, -0.9, 0.9);
            c.stroke();
            c.restore();
        }
    }

    // A tri-folded bank letter, opened: three panels, each its own piece (the top one tilted
    // back, so a touch darker and narrower), letterhead, typed body, a table, a signature and
    // an ink seal.
    function letter(c, seed) {
        const [w, h] = ITEM_SIZE.letter, x0 = -w / 2, y0 = -h / 2, ph = h / 3, r = P.rng('lt' + seed);
        const panel = (k, pts, col, fn) => cut(c, pts, col, 'lt' + seed + k, { border: k === 1 ? 2 : 1.8, paper: '#ffffff', jag: 0.5, shadow: 0.14, tex: { alpha: [0.05, 0.14] }, inner: fn });
        panel(2, [[x0, y0 + ph * 2 - 1], [-x0, y0 + ph * 2 - 1], [-x0 + 1, -y0], [x0 + 1, -y0 - 1]], D.shade(COL.white, -3), (cc) => {
            D.wordBars(cc, { x: x0 + 18, y: y0 + ph * 2 + 8, w: w - 36, h: 30 }, { cols: w - 36, rowH: 6, barH: 2.4, ink: '#6d6874', seed: 'lb2' + seed });
            D.cursive(cc, { x: x0 + 20, y: y0 + ph * 2 + 40, w: 70, h: 22 }, '#26357a', { seed: 'ls' + seed, lineH: 22, xh: 7, hw: 4.5, width: 1.3, alpha: 0.85 });
            // the seal: a coral ring with dashes inside
            cc.strokeStyle = 'rgba(210,86,63,0.6)';
            cc.lineWidth = 2;
            cc.beginPath();
            cc.arc(-x0 - 44, -y0 - 38, 20, 0, 7);
            cc.stroke();
            cc.lineWidth = 1;
            cc.beginPath();
            cc.arc(-x0 - 44, -y0 - 38, 15, 0, 7);
            cc.stroke();
            bars(cc, -x0 - 54, -y0 - 40, 20, 3.4, COL.coral, 0.55);
        });
        panel(1, [[x0, y0 + ph], [-x0, y0 + ph + 1], [-x0, y0 + ph * 2], [x0 + 0.5, y0 + ph * 2 - 0.5]], COL.white, (cc) => {
            bars(cc, x0 + 18, y0 + ph + 10, 90, 5.6, INK);
            D.wordBars(cc, { x: x0 + 18, y: y0 + ph + 22, w: w - 36, h: 28 }, { cols: w - 36, rowH: 6, barH: 2.4, ink: '#6d6874', seed: 'lb1' + seed });
            for (let i = 0; i < 3; i++) {
                const y = y0 + ph + 60 + i * 10;
                bars(cc, x0 + 22, y - 5, 40 + r() * 30, 3.6, INK, 0.6);
                print(cc, amount(r, 1500), -x0 - 20, y, 8, i === 2 ? COL.coral : INK, { align: 'right' });
            }
        });
        panel(0, [[x0 + 5, y0 + 6], [-x0 - 5, y0 + 5], [-x0, y0 + ph + 1], [x0, y0 + ph]], D.shade(COL.white, -7), (cc) => {
            bankIcon(cc, x0 + 30, y0 + 30, 1.1, COL.navy);
            bars(cc, x0 + 48, y0 + 22, 58, 6.4, COL.navy);
            bars(cc, x0 + 48, y0 + 32, 40, 3.2, GREY);
            D.wordBars(cc, { x: -x0 - 76, y: y0 + 22, w: 56, h: 24 }, { cols: 56, rowH: 5.2, barH: 2, ink: GREY, seed: 'la' + seed });
            print(cc, (10 + Math.floor(r() * 18)) + '/05/2026', -x0 - 18, y0 + ph - 12, 8, GREY, { align: 'right' });
        });
        D.crease(c, [x0 + 1, y0 + ph], [-x0 - 1, y0 + ph + 1], { width: 1.3 });
        D.crease(c, [x0 + 1, y0 + ph * 2 - 1], [-x0 - 1, y0 + ph * 2 - 0.5], { width: 1.3 });
    }

    // An email printed from the browser: the print header, From/To/Subject rows (label bars,
    // an @ in the address), the body, a quoted reply with its bar, a highlighter stroke, a
    // staple and the page count.
    function email(c, seed) {
        const [w, h] = ITEM_SIZE.email, x0 = -w / 2, y0 = -h / 2, r = P.rng('em' + seed);
        cut(c, sheetPts(w, h), COL.white, 'em' + seed, {
            paper: '#ffffff', jag: 0.5, tex: { alpha: [0.05, 0.14] },
            inner: (cc) => {
                D.wordBars(cc, { x: x0 + 10, y: y0 + 6, w: 80, h: 5 }, { cols: 80, rowH: 5, barH: 1.4, ink: '#b2aea8', seed: 'ep' + seed });
                print(cc, (1 + Math.floor(r() * 9)) + '/06/26', -x0 - 10, y0 + 11, 6, '#9a968f', { align: 'right' });
                // the envelope glyph of the mail app and the subject as a heavy bar
                cc.fillStyle = COL.coral;
                cc.fillRect(x0 + 14, y0 + 22, 16, 12);
                cc.strokeStyle = '#ffffff';
                cc.lineWidth = 1.4;
                cc.beginPath();
                cc.moveTo(x0 + 14, y0 + 22);
                cc.lineTo(x0 + 22, y0 + 29);
                cc.lineTo(x0 + 30, y0 + 22);
                cc.stroke();
                bars(cc, x0 + 36, y0 + 23, 120, 8, INK);
                // header rows
                for (let i = 0; i < 3; i++) {
                    const y = y0 + 48 + i * 13;
                    bars(cc, x0 + 14, y - 5, 18, 4, GREY);
                    bars(cc, x0 + 38, y - 6, 34 + r() * 20, 5, INK, 0.75);
                    print(cc, '@', x0 + 78 + r() * 14, y, 8.5, INK);
                    bars(cc, x0 + 96 + r() * 10, y - 6, 34, 5, INK, 0.75);
                }
                cc.fillStyle = 'rgba(40,30,40,0.18)';
                cc.fillRect(x0 + 12, y0 + 84, w - 24, 1.2);
                // body paragraphs, a highlighted line
                D.wordBars(cc, { x: x0 + 14, y: y0 + 94, w: w - 28, h: 44 }, { cols: w - 28, rowH: 7, barH: 2.8, ink: '#55505c', seed: 'eb1' + seed });
                cc.fillStyle = '#f3e05f';
                cc.globalAlpha = 0.5;
                cc.fillRect(x0 + 12, y0 + 114, 120, 7);
                cc.globalAlpha = 1;
                D.wordBars(cc, { x: x0 + 14, y: y0 + 146, w: w - 60, h: 22 }, { cols: w - 60, rowH: 7, barH: 2.8, ink: '#55505c', seed: 'eb2' + seed });
                // the quoted reply
                cc.fillStyle = '#b9c3d9';
                cc.fillRect(x0 + 16, y0 + 178, 2.6, 70);
                D.wordBars(cc, { x: x0 + 26, y: y0 + 178, w: w - 46, h: 70 }, { cols: w - 46, rowH: 7, barH: 2.4, ink: '#9fa6b8', seed: 'eq' + seed });
                print(cc, '1/' + (2 + Math.floor(r() * 4)), 0, -y0 - 8, 6.5, '#9a968f', { align: 'center' });
            },
        });
        // a staple through the top-left corner (front leg, back leg as a shadow)
        P.markerStroke(c, [[x0 + 8, y0 + 16], [x0 + 20, y0 + 8]], 'rgba(40,30,40,0.3)', 2.6, 'stS' + seed, 0.6);
        P.markerStroke(c, [[x0 + 7, y0 + 14], [x0 + 19, y0 + 6]], '#a9adb6', 2.2, 'st' + seed, 0.95);
    }

    // The accountant's folder: the back cover with its tab and label, papers sticking out
    // (a form, a ruled sheet, a pink carbon copy), the front cover with its thumb notch, a
    // label sticker, an elastic band and a paper clip.
    function folder(c, seed) {
        const [w, h] = ITEM_SIZE.folder, x0 = -w / 2, y0 = -h / 2 + 20, fy = y0 + 34;
        // back cover with a tab
        cut(c, [[x0, y0], [x0 + 150, y0], [x0 + 158, y0 - 22], [x0 + 246, y0 - 22], [x0 + 254, y0], [-x0, y0 + 1], [-x0 + 1, -y0 + 20], [x0 + 1, -y0 + 19]], D.shade(COL.manila, -6), 'fb' + seed, {
            border: 2.4, shadow: 0.2, tex: { alpha: [0.25, 0.45] },
            inner: (cc) => {
                cc.fillStyle = '#fbf7ee';
                cc.fillRect(x0 + 166, y0 - 18, 72, 14);
                D.cursive(cc, { x: x0 + 170, y: y0 - 19, w: 64, h: 12 }, '#2c2a4a', { seed: 'ftab' + seed, lineH: 12, xh: 4, hw: 3.4, width: 1.1, alpha: 0.85, gap: 5 });
            },
        });
        // the papers inside, sticking out at different heights
        const sheetIn = (k, x, y, ww, col, fn) => cut(c, [[x, y], [x + ww, y + 1], [x + ww, fy + 40], [x, fy + 40]], col, 'fs' + seed + k, { border: 1.4, paper: '#ffffff', shadow: 0.2, jag: 0.5, tex: { alpha: [0.05, 0.12] }, inner: fn });
        sheetIn(0, x0 + 14, y0 - 10, 130, COL.white, (cc) => D.wordBars(cc, { x: x0 + 22, y: y0 - 4, w: 110, h: 30 }, { cols: 110, rowH: 6, barH: 2.4, ink: '#6d6874', seed: 'fw0' + seed }));
        sheetIn(1, x0 + 120, y0 - 2, 130, '#f7e3e0', (cc) => {
            for (let y = y0 + 4; y < fy; y += 7) (cc.fillStyle = 'rgba(200,90,80,0.35)', cc.fillRect(x0 + 124, y, 122, 0.8));
            D.cursive(cc, { x: x0 + 130, y: y0 - 2, w: 100, h: 28 }, '#6a2c3a', { seed: 'fc' + seed, lineH: 7, xh: 2.4, hw: 2.4, width: 0.8, alpha: 0.7, gap: 4 });
        });
        sheetIn(2, x0 + 60, y0 + 8, 150, COL.white, (cc) => {
            for (let y = y0 + 14; y < fy; y += 6) (cc.fillStyle = 'rgba(110,150,200,0.45)', cc.fillRect(x0 + 60, y, 150, 0.7));
            cc.fillStyle = 'rgba(210,86,63,0.5)';
            cc.fillRect(x0 + 76, y0 + 8, 1, 40);
            bars(cc, x0 + 84, y0 + 12, 60, 3.4, INK, 0.6);
            bars(cc, x0 + 84, y0 + 18, 90, 3.4, INK, 0.6);
        });
        // a paper clip on the ruled sheet
        P.markerStroke(c, [[x0 + 96, y0 + 30], [x0 + 96, y0 + 2], [x0 + 104, y0 - 2], [x0 + 110, y0 + 2], [x0 + 110, y0 + 24], [x0 + 103, y0 + 24], [x0 + 103, y0 + 6]], '#9aa0ad', 2, 'fclip' + seed, 0.95);
        // front cover: lower than the back, with a thumb notch in its top edge
        const notch = Array.from({ length: 9 }, (_, i) => { const a = Math.PI * (i / 8); return [-Math.cos(a) * 16, fy + Math.sin(a) * 12]; });
        cut(c, [[x0, fy + 2], ...notch, [-x0 - 4, fy], [-x0, -y0 + 20], [x0 + 1, -y0 + 21]], COL.manila, 'ff' + seed, {
            border: 2.6, shadow: 0.25, tex: { alpha: [0.25, 0.45] },
            inner: (cc) => {
                // the accountant's handwriting on the cover and a navy date stamp
                D.cursive(cc, { x: x0 + 24, y: fy + 90, w: 120, h: 44 }, '#2c2a4a', { seed: 'fcov' + seed, lineH: 20, xh: 7, hw: 5, width: 1.8, alpha: 0.8, gap: 8 });
                cc.strokeStyle = 'rgba(31,58,138,0.5)';
                cc.lineWidth = 1.6;
                cc.strokeRect(x0 + 30, fy + 150, 70, 22);
                bars(cc, x0 + 36, fy + 157, 40, 3.6, COL.navy, 0.45);
                print(cc, '2026', x0 + 94, fy + 169, 8, 'rgba(31,58,138,0.6)', { align: 'right' });
            },
        });
        // label sticker with a coral dot, and the elastic band round the cover
        cut(c, P.roundRect(-x0 - 120, fy + 40, 84, 44, 6), '#fbf7ee', 'flab' + seed, {
            border: 1.6, shadow: 0.2, inner: (cc) => {
                cc.fillStyle = COL.coral;
                cc.beginPath();
                cc.arc(-x0 - 108, fy + 54, 5, 0, 7);
                cc.fill();
                bars(cc, -x0 - 98, fy + 50, 50, 5.4, INK, 0.8);
                bars(cc, -x0 - 98, fy + 62, 34, 3.4, GREY);
                bars(cc, -x0 - 110, fy + 72, 60, 3.4, GREY);
            },
        });
        cut(c, [[-x0 - 26, fy - 3], [-x0 - 16, fy - 3], [-x0 - 14, -y0 + 22], [-x0 - 24, -y0 + 22]], '#c2412f', 'fband' + seed, { border: 1.2, shadow: 0.3, tex: { alpha: [0.2, 0.4] } });
    }

    // A sticky note: adhesive band, handwriting, a big marker mark, and a curling corner.
    function sticky(c, seed, col, mark = 0) {
        const [w, h] = ITEM_SIZE.sticky, x0 = -w / 2, y0 = -h / 2;
        cut(c, [[x0, y0], [-x0, y0 + 1], [-x0, -y0 - 14], [-x0 - 14, -y0], [x0 + 1, -y0]], col, 'sn' + seed, {
            border: 1.6, shadow: 0.24, jag: 0.5, tex: { alpha: [0.2, 0.4] },
            inner: (cc) => {
                cc.fillStyle = D.shade(col, -8);
                cc.globalAlpha = 0.35;
                cc.fillRect(x0, y0, w, h * 0.18);
                cc.globalAlpha = 1;
                D.cursive(cc, { x: x0 + 8, y: y0 + 20, w: w - 16, h: 38 }, '#3b2f45', { seed: 'snc' + seed, lineH: 13, xh: 4.2, hw: 3.4, width: 1.2, alpha: 0.75, gap: 5 });
            },
        });
        if (mark === 1) {
            // a big «!» in marker
            P.markerStroke(c, [[16, y0 + 18], [14, 6]], COL.coral, 6, 'snx' + seed, 0.95);
            P.markerStroke(c, [[13, 17], [13.5, 19]], COL.coral, 7, 'snd' + seed, 0.95);
        } else if (mark === 2) {
            // a number circled twice
            print(c, String(20 + (P.rng('sn' + seed)() * 9 | 0)), 0, 10, 20, '#3b2f45', { align: 'center', weight: 700 });
            P.markerStroke(c, D.spline([[-18, 2], [-4, -14], [16, -8], [20, 10], [0, 20], [-20, 10], [-16, -4]], 4, false), COL.coral, 2.4, 'snr' + seed, 0.85);
        }
        // the corner lifting off: the back of the note, a shade darker
        cut(c, [[-x0, -y0 - 14], [-x0 - 14, -y0], [-x0 - 12, -y0 - 12]], D.shade(col, -12), 'sncurl' + seed, { border: 1, shadow: 0.3 });
    }

    // The phone: side buttons, dark body, the lock screen printed on paper (wallpaper, clock,
    // date), notch; n bank notifications stacked on the screen (the newest on top).
    const BANK_ROWS = [[COL.green, 'bank'], [COL.coral, 'mail'], [COL.navy, 'bank'], [COL.coral, 'bank'], [COL.green, 'mail']];
    function phone(c, n) {
        const [w, h] = ITEM_SIZE.phone, x0 = -w / 2, y0 = -h / 2;
        cut(c, R(x0 - 3, y0 + 46, 6, 22), '#1b1e2c', 'phbtn1', { border: 1, shadow: 0.1 });
        cut(c, R(-x0 - 3, y0 + 56, 6, 34), '#1b1e2c', 'phbtn2', { border: 1, shadow: 0.1 });
        cut(c, P.roundRect(x0, y0, w, h, 18), COL.phone, 'phbody', { border: 2.4, shadow: 0.28, tex: { alpha: [0.2, 0.4] } });
        cut(c, P.roundRect(x0 + 6, y0 + 6, w - 12, h - 12, 13), '#dbe4ee', 'phscreen', {
            border: 0, shadow: 0, jag: 0.4, tex: { alpha: [0.08, 0.16] },
            inner: (cc) => {
                // wallpaper: two paper hills and a sun
                cc.fillStyle = '#b8d6c4';
                cc.beginPath();
                cc.moveTo(x0, -y0 - 40);
                cc.quadraticCurveTo(-10, -y0 - 90, -x0, -y0 - 50);
                cc.lineTo(-x0, -y0);
                cc.lineTo(x0, -y0);
                cc.fill();
                cc.fillStyle = '#8fbfa2';
                cc.beginPath();
                cc.moveTo(x0, -y0 - 20);
                cc.quadraticCurveTo(20, -y0 - 60, -x0, -y0 - 24);
                cc.lineTo(-x0, -y0);
                cc.lineTo(x0, -y0);
                cc.fill();
                cc.fillStyle = '#f2c37a';
                cc.beginPath();
                cc.arc(24, -y0 - 70, 9, 0, 7);
                cc.fill();
                print(cc, '9:41', 0, y0 + 50, 26, '#2f3550', { align: 'center', weight: 700, alpha: 0.9 });
                bars(cc, -22, y0 + 58, 44, 3.2, '#5d6480', 0.6);
            },
        });
        cut(c, P.roundRect(-16, y0 + 9, 32, 8, 4), '#11131c', 'phnotch', { border: 0, shadow: 0 });
        // notifications, newest on top: white cards, an app glyph, bars and an amount
        for (let i = 0; i < n; i++) {
            const k = n - 1 - i, by = y0 + 70 + i * 30, [col, app] = BANK_ROWS[k % BANK_ROWS.length], r = P.rng('ph' + k);
            cut(c, P.roundRect(x0 + 10, by, w - 20, 26, 7), '#fbfbfd', 'phn' + k, {
                border: 1.2, shadow: 0.25, jag: 0.4, tex: { alpha: [0.04, 0.1] },
                inner: (cc) => {
                    if (app === 'bank') bankIcon(cc, x0 + 21, by + 13, 0.62, col);
                    else {
                        cc.fillStyle = col;
                        cc.fillRect(x0 + 15, by + 7, 12, 12);
                        cc.strokeStyle = '#fff';
                        cc.lineWidth = 1;
                        cc.beginPath();
                        cc.moveTo(x0 + 15, by + 8);
                        cc.lineTo(x0 + 21, by + 13);
                        cc.lineTo(x0 + 27, by + 8);
                        cc.stroke();
                    }
                    bars(cc, x0 + 32, by + 6, 30, 3.6, INK, 0.8);
                    bars(cc, x0 + 32, by + 14, 22 + r() * 16, 2.6, GREY);
                    if (app === 'bank') print(cc, '-' + amount(r, 400), -x0 - 14, by + 21, 6.5, COL.coral, { align: 'right', weight: 700 });
                },
            });
        }
    }

    // A ream of invoices seen edge-on: sheets and card dividers in layers, index tabs, the top
    // sheet's face, a binder clip. n = sheets left (the cloud takes them one by one).
    const REAM = [['#fbfaf5', 5], ['#f3eee2', 4], [COL.coral, 7], ['#fbfaf5', 5], ['#f6f1e6', 4], [COL.mint, 6], ['#fbfaf5', 5], ['#efe9da', 5], ['#fbfaf5', 4], [COL.sticky, 6]];
    function ream(c, n = REAM.length) {
        const [w] = ITEM_SIZE.ream, x0 = -w / 2;
        let y = 27;
        for (let i = 0; i < n; i++) {
            const [col, th] = REAM[i], dx = ((i * 37) % 11) - 5;
            cut(c, [[x0 + dx, y], [-x0 + dx - 2, y - 1], [-x0 + dx - 1, y - th], [x0 + dx + 1, y - th + 0.5]], col, 'rm' + i, { border: 1.2, shadow: 0.2, tex: { alpha: [0.15, 0.3] } });
            if (i === 2 || i === 5) cut(c, R(x0 + 40 + i * 30, y - th - 2, 20, 10), i === 2 ? COL.sticky : COL.coral, 'rmtab' + i, { border: 0.9, shadow: 0.2 });
            y -= th;
        }
        // the top sheet's face in perspective, with print as bars, and a binder clip
        cut(c, [[x0 + 4, y], [-x0 - 4, y - 1], [-x0 - 20, y - 12], [x0 + 22, y - 11]], '#fbfaf5', 'rmtop' + n, {
            border: 1.2, shadow: 0.15, tex: { alpha: [0.05, 0.12] },
            inner: (cc) => D.wordBars(cc, { x: x0 + 40, y: y - 10, w: w - 90, h: 9 }, { cols: 80, rowH: 3.4, barH: 1.2, ink: '#9b968e', seed: 'rmw' }),
        });
        cut(c, R(60, y - 6, 34, 18), '#2e2a33', 'rmclip', { border: 1.2, shadow: 0.25 });
        for (const dx of [66, 88]) P.markerStroke(c, [[dx, y - 4], [dx + 1, y - 26], [dx - 2 + (dx - 77) * 0.3, y - 28]], '#b9bcc4', 1.8, 'rmw' + dx, 0.95);
    }

    // sprite for item kind at its own box, cached once per variant
    const PAD = 30;
    function itemSprite(it, variant = '') {
        const [w, h] = ITEM_SIZE[it.kind];
        const box = { x: -w / 2 - PAD, y: -h / 2 - PAD - (it.kind === 'folder' ? 20 : 0), w: w + 2 * PAD, h: h + 2 * PAD + 30 };
        return sprite('chaos-' + it.kind + it.seed + variant, box, (c) => {
            if (it.kind === 'ream') ream(c, variant === '' ? REAM.length : +variant);
            else if (it.kind === 'invoice') invoice(c, it.seed, it.accent);
            else if (it.kind === 'receipt') receipt(c, it.seed);
            else if (it.kind === 'sheet') spreadsheet(c, it.seed);
            else if (it.kind === 'envKraft' || it.kind === 'envWindow') envelope(c, it.seed, it.kind);
            else if (it.kind === 'letter') letter(c, it.seed);
            else if (it.kind === 'email') email(c, it.seed);
            else if (it.kind === 'folder') folder(c, it.seed);
            else if (it.kind === 'sticky') sticky(c, it.seed, it.col, it.mark);
            else if (it.kind === 'phone') phone(c, variant === '' ? 0 : +variant);
        }, 1.5);
    }

    // ============================================================== the pile: who lands where
    // t = landing time (on the beats, offbeats in the rush), x, y = centre at rest, rot,
    // heavy = drops straight (no flutter). The last sticky note lands on Laura's forehead.
    const ITEMS = [
        { kind: 'ream', seed: 'a', t: 0.5, x: 482, y: 650, rot: 0, heavy: true },
        { kind: 'invoice', seed: 'a', accent: COL.green, t: 1.0, x: 376, y: 628, rot: -0.16 },
        { kind: 'receipt', seed: 'a', t: 1.25, x: 612, y: 606, rot: 0.2 },
        { kind: 'sheet', seed: 'a', t: 1.5, x: 478, y: 566, rot: 0.05 },
        { kind: 'envKraft', seed: 'a', t: 2.0, x: 352, y: 524, rot: -0.22 },
        { kind: 'phone', seed: '', t: 2.5, x: 706, y: 552, rot: 0.26, heavy: true },
        { kind: 'email', seed: 'a', t: 3.0, x: 498, y: 520, rot: -0.05 },
        { kind: 'letter', seed: 'a', t: 3.5, x: 392, y: 498, rot: 0.13 },
        { kind: 'folder', seed: 'a', t: 4.0, x: 490, y: 468, rot: -0.05, heavy: true },
        { kind: 'sticky', seed: 'y', col: COL.sticky, mark: 1, t: 4.25, x: 626, y: 402, rot: 0.3 },
        { kind: 'invoice', seed: 'b', accent: COL.navy, t: 4.5, x: 402, y: 452, rot: -0.2 },
        { kind: 'receipt', seed: 'b', t: 4.75, x: 588, y: 440, rot: 0.32 },
        { kind: 'envWindow', seed: 'b', t: 5.0, x: 476, y: 402, rot: 0.07 },
        { kind: 'sticky', seed: 'p', col: COL.pink, mark: 2, t: 5.25, x: 348, y: 382, rot: -0.35 },
        { kind: 'sheet', seed: 'b', t: 5.5, x: 478, y: 392, rot: -0.035 },
        { kind: 'sticky', seed: 'm', col: COL.mint, mark: 0, t: 5.75, x: 474, y: 206, rot: -0.12, face: true },
    ];
    ITEMS.forEach((it, i) => (it.i = i));
    const PILE_BASE = [482, 684]; // the pile squashes towards the desk edge

    // Where an item is at time lt (null before it enters). Falling sheets flutter: they sway
    // and turn over their horizontal axis (foreshortened), on twos; heavy things just drop.
    function fallState(it, lt) {
        const F = it.heavy ? 0.34 : it.face ? 0.42 : 0.5, t0 = it.t - F, tq = q(lt);
        if (tq < t0) return null;
        if (tq < it.t) {
            const u = (tq - t0) / F, ph = it.i * 1.7;
            if (it.heavy) return { x: it.x, y: E.lerp(-240, it.y, E.in(u) * 0.3 + u * 0.7), rot: it.rot + (1 - u) * 0.3 * (it.i % 2 ? 1 : -1), sx: 0.96, sy: 1.06 };
            const fl = Math.cos(u * Math.PI * 3 + ph);
            return {
                x: it.x + Math.sin(u * Math.PI * 2.2 + ph) * 70 * (1 - u), y: E.lerp(-230, it.y, Math.pow(u, 1.25)),
                rot: it.rot + Math.sin(u * Math.PI * 1.6 + ph) * 0.5 * (1 - u), sx: 1, sy: 0.35 + 0.65 * Math.abs(fl), skew: 0.3 * Math.sin(u * Math.PI * 3 + ph) * (1 - u),
            };
        }
        const j = drawing(lt - it.t);
        const [sx, sy] = j === 0 ? [1.07, 0.88] : j === 1 ? [0.97, 1.04] : [1, 1];
        return { x: it.x, y: it.y, rot: it.rot, sx, sy, landed: true };
    }
    // phone notifications: a buzz on some beats after it lands; each buzz adds a card
    const BUZZ = [3.0, 3.75, 4.5, 5.25, 6.0, 6.75];
    const phoneCards = (T) => Math.min(4, 1 + BUZZ.filter((b) => T >= b).length);
    const buzzing = (T) => BUZZ.some((b) => T >= b && T < b + 0.34);

    function drawItem(g, it, st, variant) {
        const sp = itemSprite(it, variant);
        g.save();
        g.translate(st.x, st.y);
        g.rotate(st.rot);
        if (st.skew) g.transform(1, 0, st.skew, 1, 0, 0);
        const [, h] = ITEM_SIZE[it.kind];
        // squash anchored at the item's bottom
        g.translate(0, h / 2);
        g.scale(st.sx * (st.s ?? 1), st.sy * (st.s ?? 1));
        g.translate(0, -h / 2);
        sp.draw(g);
        g.restore();
    }
    // a few scraps of paper kicked out sideways by a landing (born at the impact)
    function puffs(g, it, lt) {
        const a = lt - it.t;
        if (a < 0 || a >= 0.42) return;
        const u = drawing(a) / 5, [w, h] = ITEM_SIZE[it.kind];
        for (let k = 0; k < 4; k++) {
            const sd = k % 2 ? 1 : -1, r = P.rng('puff' + it.i + k);
            const x = it.x + sd * (w * 0.45 + u * (40 + r() * 50)), y = it.y + h * 0.3 - u * (40 + r() * 30) + u * u * 60;
            const sp = sprite('scrap' + (k % 3), { x: -12, y: -10, w: 24, h: 20 }, (c) => cut(c, [[-7, -5], [8, -4], [5, 6], [-6, 4]], k % 3 === 1 ? '#f3eee2' : '#fbfaf5', 'scrap' + k, { border: 1, shadow: 0.2 }), 2);
            g.save();
            g.translate(x, y);
            g.rotate(u * 4 * sd + k);
            g.globalAlpha = 1 - E.seg(u, 0.6, 1);
            sp.draw(g);
            g.restore();
        }
    }
    // marker impact ticks for the heavy drops
    function ticks(g, x, y, w, seed) {
        Props.kit.sprite('chaos-ticks' + w, { x: -w - 60, y: -60, w: 2 * w + 120, h: 90 }, (c) => {
            for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) P.markerStroke(c, [[sd * (w + 8), -8 - k * 14], [sd * (w + 44), -20 - k * 20]], INK, 5, 'ct' + w + sd + k, 0.85);
        }, 1.4).draw((g.save(), g.translate(x, y), g));
        g.restore();
    }
    // the phone's buzz: vibration marks both sides
    function buzzMarks(g, st, T) {
        const d = drawing(T);
        Props.kit.sprite('chaos-buzz' + (d % 2), { x: -110, y: -140, w: 220, h: 280 }, (c) => {
            for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) {
                const y = -50 + k * 44 + (d % 2) * 8;
                P.markerStroke(c, [[sd * 72, y], [sd * (84 + (k === 1 ? 10 : 0)), y - 6], [sd * 72, y - 14]], COL.coral, 4, 'bz' + sd + k + (d % 2), 0.9);
            }
        }, 1.4).draw((g.save(), g.translate(st.x, st.y), g.rotate(st.rot), g));
        g.restore();
    }
    // the top of the pile at time T (for the hands)
    function pileTop(n) {
        let top = PILE_BASE[1];
        for (let i = 0; i < n; i++) {
            const it = ITEMS[i];
            if (it.face || it.kind === 'sticky' || it.kind === 'phone' || it.kind === 'receipt') continue;
            top = Math.min(top, it.y - ITEM_SIZE[it.kind][1] / 2);
        }
        return top;
    }

    // ============================================================== background: loose sheets
    // Small sheets drifting down behind Laura, slower and smaller than the pile (a second
    // rhythm). pull = { x, y, u(i) } bends them into the cloud in the next block.
    const BG = [[150, 1.0], [880, 1.4], [1250, 1.9], [270, 2.3], [1010, 2.8], [1440, 3.1], [760, 3.5], [1150, 4.0], [200, 4.4], [930, 4.9], [1340, 5.3]];
    function bgSheets(g, T, pull) {
        BG.forEach(([x, t0], i) => {
            const life = 3.2, age = q(T) - t0;
            if (age < 0 || age > life) return;
            const u = age / life, ph = i * 2.3, fl = Math.cos(u * Math.PI * 4 + ph);
            let px = x + Math.sin(u * Math.PI * 3 + ph) * 50, py = E.lerp(-80, 660, u), s = 1, rot = Math.sin(u * 5 + ph) * 0.5;
            if (pull) {
                const v = pull.u(i);
                if (v >= 1) return;
                px = E.lerp(px, pull.x, E.in(v));
                py = E.lerp(py, pull.y, E.in(v));
                s = 1 - v * 0.6;
                rot += v * 6;
            }
            const sp = sprite('chaos-bg' + (i % 4), { x: -34, y: -40, w: 68, h: 80 }, (c) => {
                const col = ['#fbfaf5', '#f3ecdc', '#f6e3dc', '#e9efe6'][i % 4];
                cut(c, sheetPts(46, 58), col, 'bgs' + (i % 4), { border: 1.4, shadow: 0.2, inner: (cc) => D.wordBars(cc, { x: -17, y: -22, w: 34, h: 40 }, { cols: 34, rowH: 5, barH: 2, ink: '#9b968e', seed: 'bgw' + i }) });
            }, 1.5);
            g.save();
            g.translate(px, py);
            g.rotate(rot);
            g.scale(s, s * (0.4 + 0.6 * Math.abs(fl)));
            sp.draw(g);
            g.restore();
        });
    }

    // ============================================================== Laura's arms and hands
    // Laura is drawn at (LX, LY) scale LS (the approved medium shot). She is behind the pile:
    // her arms always go behind it. Raised hands (palms out, fending the paper off) are drawn
    // with the arms, so whatever lands in front covers them; when she clutches the pile, only
    // her fingers come over its top edge, in front ('edge'). Nothing of hers crosses the pile.
    const LX = 470, LY = 660, LS = 0.92;
    const toL = ([x, y]) => [Math.round((x - LX) / LS), Math.round((y - LY) / LS)];
    // pose → world hand positions (wrists), where the arm ends (behind the pile), elbows
    // (local), hand pose, rotation and layer
    function armPose(name, top) {
        const palms = (hands, elbows, rot) => ({ hands, arm: hands, elbows, pose: ['palm', 'palm'], rot, layer: 'back' });
        if (name === 'brace') return palms([[300, 470], [648, 458]], [[-222, -118], [222, -118]], [-0.32, 0.32]);
        if (name === 'raise') return palms([[312, 392], [632, 382]], [[-232, -170], [232, -170]], [-0.26, 0.26]);
        if (name === 'raise2') return palms([[306, 378], [640, 394]], [[-236, -180], [230, -166]], [-0.36, 0.2]);
        if (name === 'whoa') return palms([[236, 420], [726, 404]], [[-236, -120], [238, -110]], [-0.45, 0.45]);
        if (name === 'clutch') {
            // fingers hooked over the pile's top edge at y = top; the wrists just behind it
            const e = [[356, top + 6], [598, top + 2]], rot = [Math.PI - 0.12, Math.PI + 0.12];
            const hands = e.map(([x, y], i) => [x + Math.sin(rot[i]) * 50 * LS, y - 50 * LS * -Math.cos(rot[i])]);
            return { hands, arm: e.map(([x, y]) => [x, y + 40]), elbows: [[-246, -250], [246, -250]], pose: ['edge', 'edge'], rot, layer: 'front' };
        }
        return null; // 'desk'
    }
    function arms(g, T, pose) {
        if (!pose) return Laura.draw(g, LX, LY, LS, { t: T, pose: 'desk', layer: 'arms' });
        const shoulders = [[-118, -250], [118, -250]];
        const a = [0, 1].map((i) => [shoulders[i], pose.elbows[i], toL(pose.arm[i])]);
        Laura.draw(g, LX, LY, LS, { t: T, arms: a, hands: [null, null], layer: 'arms' });
        hands(g, T, pose, 'back');
    }
    function hands(g, T, pose, layer = 'front') {
        if (!pose || pose.layer !== layer) return;
        const breath = Math.sin((drawing(T) / 12) * 2.4) * 1.5;
        for (let i = 0; i < 2; i++) {
            const [hx, hy] = pose.hands[i];
            D.hand(g, hx, hy + breath, 60 * LS, pose.rot[i], pose.pose[i], { skin: Laura.COL.skin, side: i === 0 ? 'right' : 'left', cuff: pose.layer === 'back' ? Laura.COL.shirt : undefined });
        }
    }
    // a bead of sweat sliding down her temple
    function sweat(g, T, t0) {
        const a = q(T) - t0;
        if (a < 0 || a > 1.1) return;
        const sp = sprite('chaos-sweat', { x: -12, y: -20, w: 24, h: 34 }, (c) => {
            cut(c, D.spline([[0, -14], [5, -2], [7, 6], [0, 11], [-7, 6], [-5, -2]], 6), '#bfe3f0', 'sweat', { border: 1.6, shadow: 0.2 });
            c.fillStyle = 'rgba(255,255,255,0.85)';
            c.beginPath();
            c.ellipse(-2.4, 3, 1.6, 2.6, 0.3, 0, 7);
            c.fill();
        }, 2);
        g.save();
        g.translate(546, 222 + E.out(E.seg(a, 0, 1)) * 40);
        g.globalAlpha = 1 - E.seg(a, 0.8, 1.1);
        sp.draw(g);
        g.restore();
    }

    // ============================================================== the block
    function camera(g, lt) {
        const s = 1 + 0.1 * E.inOut(E.seg(lt, 0, 6)), [fx, fy] = [480, 400];
        g.translate(fx, fy);
        g.scale(s, s);
        g.translate(-fx, -fy);
    }
    // Laura's face through the block (calm → annoyed → overwhelmed), flinching on impacts
    function face(lt) {
        const impact = ITEMS.some((it) => it.t <= 5.5 && lt >= it.t && lt < it.t + 1 / 12 && (it.heavy || it.t >= 3));
        let o;
        if (lt < 0.5) o = { eyes: 'open', look: [0.9, 0.5], mouth: 'smile', tilt: -0.03 };
        else if (lt < 1.0) o = { eyes: 'open', look: [0, 0.9], mouth: 'o', tilt: 0 };
        else if (lt < 2.5) o = { eyes: 'open', look: [lt < 1.75 ? -0.6 : 0.3, 0.6], mouth: 'flat', tilt: 0.02 };
        else if (lt < 3.25) o = { eyes: 'open', look: [1, 0.4], mouth: 'o', tilt: 0.04 };
        else o = { eyes: 'open', look: [drawing(lt) % 12 < 6 ? -0.4 : 0.4, -1], mouth: 'o', tilt: 0.05 * Math.sin(drawing(lt) * 0.7) };
        if (impact) o.eyes = 'closed';
        return o;
    }
    function armsAt(lt) {
        if (lt < 1.5) return null;
        if (lt < 3.0) return armPose('brace');
        if (lt < 4.5) return armPose(drawing(lt) % 6 < 3 ? 'raise' : 'raise2');
        return armPose('clutch', lt < 5.0 ? 330 : lt < 5.5 ? 318 : 290);
    }

    // everything but the camera and titles; `take(it)` returns the item's state override
    // (the cloud block flies them away), `lauraFace`, `armPose` override the choreography.
    function set(g, T, o) {
        Office.back(g, T);
        bgSheets(g, T, o.pull);
        const f = o.face;
        Laura.draw(g, LX, LY, LS, { t: T, ...f, pose: 'desk', layer: 'body' });
        if (o.hair) o.hair(g, f.tilt ?? 0);
        sweat(g, T, 3.1);
        sweat(g, T, 4.6);
        Office.desk(g, T);
        arms(g, T, o.arms);
    }
    function pile(g, lt, T, take) {
        // the pile, clipped at the desk's front edge; every landing squashes what is under it
        g.save();
        g.beginPath();
        g.rect(-200, -400, 2000, 1087);
        g.clip();
        const lastLand = ITEMS.filter((it) => !it.face && lt >= it.t).pop();
        const j = lastLand ? drawing(lt - lastLand.t) : 9;
        for (const it of ITEMS) {
            if (it.face) continue;
            let st = take ? take(it) : fallState(it, lt);
            if (!st) continue;
            const under = st.landed && lastLand && it.i < lastLand.i && j < 2;
            g.save();
            if (under) {
                const k = j === 0 ? 0.975 : 1.008;
                g.translate(PILE_BASE[0], PILE_BASE[1]);
                g.scale(2 - k, k);
                g.translate(-PILE_BASE[0], -PILE_BASE[1]);
            }
            let variant = '';
            if (it.kind === 'phone') {
                variant = String(phoneCards(T));
                if (buzzing(T) && st.landed) st = { ...st, x: st.x + (drawing(T) % 2 ? 2.5 : -2.5), rot: st.rot + (drawing(T) % 2 ? 0.03 : -0.03) };
            }
            if (it.kind === 'ream' && st.n != null) variant = String(st.n);
            drawItem(g, it, st, variant);
            if (it.kind === 'phone' && st.landed && buzzing(T)) buzzMarks(g, st, T);
            g.restore();
        }
        g.restore();
    }

    Shots.chaos = (g, lt, env) => {
        g.save();
        camera(g, lt);
        set(g, lt, { face: face(lt), arms: armsAt(lt) });
        pile(g, lt, lt);
        for (const it of ITEMS) if (!it.face) puffs(g, it, lt);
        if (lt >= 0.5 && lt < 0.84) ticks(g, 482, 640, 190, 'ream');
        if (lt >= 4.0 && lt < 4.34) ticks(g, 490, 420, 150, 'folder');
        hands(g, lt, armsAt(lt));
        // the last sticky note, on her forehead
        const st = fallState(ITEMS[15], lt);
        if (st) drawItem(g, ITEMS[15], st, '');
        Office.front(g, lt);
        g.restore();
        title(g, lt, 3.5, BRAND.copy.chaosLine);
    };

    // brand title bottom left, sized to fit the width (the real copy may be ~30 % longer)
    function title(g, lt, t0, text, o = {}) {
        g.save();
        g.font = `700 58px "${BRAND.font}"`;
        const w = g.measureText(text).width;
        g.restore();
        const size = Math.min(58, Math.floor((58 * (o.maxW ?? 1240)) / w));
        Shots.title(g, lt, t0, text, 90, 826, size, o);
    }

    return { ITEMS, ITEM_SIZE, REAM, LX, LY, LS, drawing, q, fallState, drawItem, itemSprite, pile, set, hands, armPose, camera, face, bgSheets, phoneCards, buzzing, title, sprite, cut };
})();
