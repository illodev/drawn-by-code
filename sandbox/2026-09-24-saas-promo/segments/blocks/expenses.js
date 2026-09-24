// Block «expenses» of the edit (see ../../scene.js EDIT). Defines Shots.expenses(g, lt, env).
// 16–21 s · close-up from above on the desk: Laura's hands hold her phone over a crumpled
// petrol-station receipt. The viewfinder's brackets lock on (1.0, the finger taps the
// shutter, flash); the form appears; base, VAT, total and the vendor peel off the receipt
// as paper tags and land in the form's fields on the beats (2.0, 2.5, 3.0, 3.5); a green
// check (4.0); the receipt is swept off the desk (4.5–5.0).
(() => {
    const P = Paper, D = PaperDetail, E = Ease;
    const kit = () => Props.kit;
    const sprite = (...a) => Props.sprite(...a);
    const cut = (c, pts, col, seed, o = {}) => P.cutout(c, pts, col, seed, { border: 2.4, shadow: 0.2, ...o });
    const flat = (c, pts, col, seed, o = {}) => P.cutout(c, pts, col, seed, { border: 0, shadow: 0, ...o });
    const R = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    const xf = (pts, x, y, a = 0, s = 1) => pts.map(([px, py]) => [x + (px * Math.cos(a) - py * Math.sin(a)) * s, y + (px * Math.sin(a) + py * Math.cos(a)) * s]);
    const ell = (cx, cy, rx, ry, n = 40, a = 0) => xf(P.ellipse(0, 0, rx, ry, n), cx, cy, a);
    const local = (c, x, y, a, fn) => (c.save(), c.translate(x, y), c.rotate(a), fn(c), c.restore());
    const W = {
        wood: '#d6a874', woodB: '#cf9f69', woodC: '#dcae7b', thermal: '#f6f5f0', thermalInk: '#3d414e',
        silver: '#c4c7cf', keys: '#3a3742', coral: '#d2563f', navy: '#1f3a8a', mustard: '#e2b04a',
        sticky: '#f3d677', pink: '#f2a38f', mint: '#9ad0b8', phone: '#2b2d3a', ink: '#2a2530',
    };

    // ------------------------------------------------------------------ the desk, from above
    function planks(c) {
        // the gaps between the boards: dark wood under everything
        c.fillStyle = D.shade(W.wood, -34);
        c.fillRect(-60, -60, 1720, 1020);
        const rows = [[-60, 300, W.wood, 'ep0', -0.01], [300, 610, W.woodB, 'ep1', 0.006], [610, 980, W.woodC, 'ep2', -0.004]];
        for (const [y0, y1, col, seed, a] of rows) flat(c, [[-60, y0], [1660, y0 + 3], [1660, y1], [-60, y1 + 2]], col, seed, { tex: { alpha: [0.2, 0.35] }, inner: (cc, box) => D.woodGrain(cc, box, col, { seed, angle: a }) });
        for (const [y, s] of [[300, 'es0'], [610, 'es1']]) {
            P.markerStroke(c, [[-60, y + 1], [1660, y + 4]], D.shade(W.wood, -30), 3.4, s, 0.75);
            P.markerStroke(c, [[-60, y + 5], [1660, y + 8]], D.shade(W.wood, 14), 1.6, s + 'l', 0.55);
        }
    }
    function laptopCorner(c) {
        // the laptop's palm rest and keyboard poking in at the top-left
        local(c, 40, 100, 0.1, (cc) => {
            cut(cc, P.roundRect(-420, -300, 700, 440, 30), W.silver, 'elap', { border: 2.6, shadow: 0.3, tex: { alpha: [0.2, 0.35] } });
            flat(cc, P.roundRect(-400, -290, 660, 290, 14), D.shade(W.silver, -14), 'elapwell', { tex: { alpha: [0.15, 0.3] } });
            const rows = [[-280, 13], [-222, 12], [-164, 12], [-106, 11], [-48, 10]];
            rows.forEach(([y, n], j) => {
                for (let i = 0; i < n; i++) {
                    const w = j === 4 && i === 4 ? 150 : 46, x = -392 + i * 53 + j * 8 + (j === 4 && i > 4 ? 104 : 0);
                    if (x + w > 254) continue;
                    cut(cc, P.roundRect(x, y, w, 46, 7), W.keys, 'ek' + j + '-' + i, { border: 1, shadow: 0.25, jag: 0.4, tex: { alpha: [0.2, 0.4] } });
                }
            });
            // the trackpad
            cut(cc, P.roundRect(-140, 24, 260, 100, 12), D.shade(W.silver, -6), 'epad', { border: 1.2, shadow: 0.15 });
        });
    }
    function mugTop(c) {
        const x = 1500, y = 150;
        cut(c, P.noodle(D.spline([[x + 60, y - 30], [x + 108, y - 26], [x + 112, y + 26], [x + 60, y + 32]], 8, false), 22), '#f6efe2', 'emhandle', { border: 2.2, shadow: 0.3 });
        cut(c, ell(x, y, 80, 80, 60), '#f6efe2', 'emrim', { border: 2.6, shadow: 0.34, tex: { alpha: [0.15, 0.3] } });
        flat(c, ell(x, y, 66, 66, 60), D.shade('#f6efe2', -10), 'eminner', { tex: { alpha: [0.1, 0.2] } });
        cut(c, ell(x + 2, y + 3, 58, 58, 60), '#5a3a2a', 'emcoffee', { border: 0, shadow: 0, tex: { alpha: [0.25, 0.45] } });
        // crema: a lighter broken ring and a glint
        P.markerStroke(c, D.spline(Array.from({ length: 9 }, (_, k) => { const a = 0.4 + (k / 8) * 2.2; return [x + 2 + Math.cos(a) * 44, y + 3 + Math.sin(a) * 44]; }), 4, false), '#8a5d42', 5, 'emcrema', 0.7);
        c.fillStyle = 'rgba(255,255,255,0.55)';
        c.beginPath();
        c.ellipse(x - 22, y - 20, 12, 6, -0.7, 0, Math.PI * 2);
        c.fill();
        // a coral band printed on the rim
        P.markerStroke(c, D.spline(Array.from({ length: 12 }, (_, k) => { const a = 2.6 + (k / 11) * 2.4; return [x + Math.cos(a) * 73, y + Math.sin(a) * 73]; }), 4, false), W.coral, 6, 'emband', 0.85);
    }
    function notebook(c) {
        local(c, 1560, 560, 0.1, (cc) => {
            cut(cc, P.roundRect(-150, -250, 330, 520, 14), W.navy, 'enbcover', { border: 2.4, shadow: 0.3, tex: { alpha: [0.25, 0.45] } });
            cut(cc, R(-130, -238, 300, 496), '#fbfaf5', 'enbpage', {
                border: 1.2, shadow: 0.15, tex: { alpha: [0.1, 0.2] },
                inner: (c2, box) => {
                    c2.fillStyle = 'rgba(120,150,200,0.5)';
                    for (let y = -200; y < 250; y += 26) c2.fillRect(box.x, y, box.w, 1.4);
                    c2.fillStyle = 'rgba(210,86,63,0.5)';
                    c2.fillRect(-90, box.y, 2, box.h);
                    D.cursive(c2, { x: -80, y: -214, w: 220, h: 330 }, '#3f3a55', { lineH: 26, xh: 7, hw: 6, width: 1.6, alpha: 0.7, seed: 'enb' });
                },
            });
            for (let k = 0; k < 13; k++) {
                const y = -222 + k * 38;
                cut(cc, ell(-126, y, 9, 9, 18), '#2e2833', 'enbhole' + k, { border: 0, shadow: 0, tex: false });
                P.markerStroke(cc, [[-150, y + 4], [-156, y - 4], [-138, y - 10], [-124, y - 2]], '#9aa0ad', 4, 'enbring' + k, 0.95);
            }
        });
    }
    function calculator(c) {
        local(c, 90, 690, -0.18, (cc) => {
            cut(cc, P.roundRect(-120, -170, 240, 350, 26), '#3c4a6b', 'ecalc', { border: 2.6, shadow: 0.32, tex: { alpha: [0.25, 0.45] } });
            cut(cc, P.roundRect(-96, -146, 192, 62, 8), '#a9b89c', 'ecalcdisp', {
                border: 1.2, shadow: 0.1,
                inner: (c2) => {
                    // digits as seven-segment bars
                    c2.fillStyle = 'rgba(40,50,40,0.7)';
                    for (let k = 0; k < 4; k++) {
                        const x = 12 + k * 20;
                        c2.fillRect(x, -134, 12, 3);
                        c2.fillRect(x + 10, -132, 3, 14);
                        c2.fillRect(x, -118, 12, 3);
                        if (k % 2) c2.fillRect(x - 1, -116, 3, 14);
                        c2.fillRect(x, -103, 12, 3);
                    }
                },
            });
            for (let j = 0; j < 5; j++) for (let i = 0; i < 4; i++) {
                const col = i === 3 ? (j === 4 ? W.coral : W.mustard) : j === 0 ? '#c8cdd8' : '#eef0f3';
                cut(cc, P.roundRect(-94 + i * 49, -66 + j * 46, 40, 36, 8), col, 'ecb' + j + i, { border: 1.2, shadow: 0.3, jag: 0.4, tex: { alpha: [0.15, 0.3] } });
            }
        });
    }
    function smalls(c) {
        // coins
        for (const [x, y, r, k] of [[760, 110, 30, 0], [812, 146, 26, 1], [724, 168, 24, 2]]) {
            cut(c, ell(x, y, r, r, 36), k === 1 ? '#c9ccd4' : '#d9ae52', 'ecoin' + k, { border: 1.6, shadow: 0.35, tex: { alpha: [0.25, 0.45] } });
            P.markerStroke(c, D.spline(Array.from({ length: 10 }, (_, j) => { const a = (j / 9) * Math.PI * 1.7; return [x + Math.cos(a) * r * 0.74, y + Math.sin(a) * r * 0.74]; }), 3, false), D.shade(k === 1 ? '#c9ccd4' : '#d9ae52', -18), 1.6, 'ecoinr' + k, 0.6);
        }
        // a paper clip and a crumpled paper ball
        P.markerStroke(c, [[900, 70], [990, 88], [986, 104], [906, 88], [910, 78], [976, 92]], '#9aa0ad', 4, 'eclip', 0.95);
        cut(c, D.spline([[1110, 60], [1150, 40], [1196, 56], [1206, 96], [1180, 128], [1136, 132], [1104, 104]], 6), '#f4f1e8', 'eball', {
            border: 2, shadow: 0.32, jag: 1.6,
            inner: () => { for (const [a, b] of [[[1120, 70], [1170, 100]], [[1150, 50], [1140, 120]], [[1180, 70], [1128, 118]], [[1196, 96], [1150, 84]]]) D.crease(c, a, b, { width: 1.8 }); },
        });
        // the pen, lying diagonal at the bottom
        local(c, 700, 850, -0.2, (cc) => {
            cut(cc, P.roundRect(-180, -13, 300, 26, 12), W.coral, 'epen', { border: 2, shadow: 0.35, tex: { alpha: [0.2, 0.4] } });
            cut(cc, [[120, -11], [160, -3], [160, 3], [120, 11]], '#e9e4da', 'epentip', { border: 1.4, shadow: 0.2 });
            cut(cc, P.roundRect(-196, -15, 90, 30, 12), D.shade(W.coral, -14), 'epencap', { border: 1.8, shadow: 0.3 });
            cut(cc, R(-180, -22, 76, 8), '#c9ccd4', 'epenclip', { border: 1.2, shadow: 0.25 });
        });
        // sticky notes, one on top of the other, at the bottom-left
        local(c, 560, 64, -0.1, (cc) => {
            for (const [dx, dy, a, col, s] of [[0, 0, 0, W.sticky, 'est0'], [16, -10, -0.14, W.pink, 'est1']]) local(cc, dx, dy, a, (c2) => cut(c2, R(-70, -64, 140, 128), col, s, {
                border: 1.4, shadow: 0.25, jag: 0.5,
                inner: (c3) => { c3.fillStyle = D.shade(col, -8); c3.globalAlpha = 0.35; c3.fillRect(-70, -64, 140, 22); c3.globalAlpha = 1; P.scribble(c3, -58, -24, 116, 3, 22, '#4b3f55', s + 's', { alpha: 0.6, scale: 1, width: 1.4 }); },
            }));
        });
    }
    function desk(g) {
        sprite('exp-desk', { x: -60, y: -60, w: 1720, h: 1020 }, (c) => {
            planks(c);
            laptopCorner(c);
            mugTop(c);
            notebook(c);
            calculator(c);
            smalls(c);
        }, 1.1).draw(g);
    }

    // ---------------------------------------------------------------- the receipt (thermal)
    const RW = 270, RH = 600;
    const RC = { x: 470, y: 460, rot: -0.09 };
    const fontOf = (size, bold, mono) => `${bold ? 700 : 500} ${size}px "${mono ? BRAND.mono : BRAND.font}"`;
    // the four values that fly: [copy key, x (right edge or centre), baseline, size, bold, align]
    const ROWS = () => {
        const cp = BRAND.copy;
        return [
            { key: 'vendor', text: cp.ticketShop, x: RW / 2, y: 70, size: 24, bold: true, align: 'center', max: 232 },
            { key: 'base', text: cp.ticketBase, x: 246, y: 372, size: 21, bold: false, align: 'right' },
            { key: 'tax', text: cp.ticketTax, x: 246, y: 404, size: 21, bold: false, align: 'right' },
            { key: 'total', text: cp.ticketTotal, x: 246, y: 450, size: 28, bold: true, align: 'right' },
        ];
    };
    // measured rectangle of a row in receipt coordinates, fitted to its max width
    function rowBox(g, row) {
        g.save();
        g.font = fontOf(row.size, row.bold, true);
        const w0 = g.measureText(row.text).width;
        g.restore();
        const size = row.max && w0 > row.max ? row.size * row.max / w0 : row.size, w = w0 * size / row.size;
        const x0 = row.align === 'center' ? row.x - w / 2 : row.x - w;
        return { size, x: x0 - 9, y: row.y - size * 0.95, w: w + 18, h: size * 1.35 };
    }
    const thermalText = (c, text, x, y, size, bold, align) => Props.print(c, text, x, y, size, W.thermalInk, { mono: true, weight: bold ? 700 : 500, align, alpha: 0.88 });
    function dashes(c, y) {
        c.fillStyle = 'rgba(61,65,78,0.55)';
        for (let x = 18; x < RW - 18; x += 12) c.fillRect(x, y, 7, 2);
    }
    function receiptContent(c, g) {
        const cp = BRAND.copy;
        for (const row of ROWS()) {
            const b = rowBox(g, row);
            thermalText(c, row.text, row.x, row.y, b.size, row.bold, row.align);
        }
        // address and ticket number as printed bars, the pump pictogram
        D.wordBars(c, { x: 40, y: 88, w: 190, h: 36 }, { cols: 190, rowH: 12, barH: 4.4, ink: '#6a6e7a', seed: 'eaddr' });
        dashes(c, 136);
        D.wordBars(c, { x: 20, y: 150, w: 120, h: 26 }, { cols: 120, rowH: 12, barH: 4.4, ink: '#6a6e7a', seed: 'edate' });
        D.wordBars(c, { x: 176, y: 150, w: 74, h: 14 }, { cols: 74, rowH: 12, barH: 4.4, ink: '#6a6e7a', seed: 'etime' });
        dashes(c, 186);
        // the fuel line: litres × price, amount
        for (let k = 0; k < 3; k++) {
            const y = 212 + k * 34;
            D.wordBars(c, { x: 20, y, w: k === 0 ? 150 : 110, h: 12 }, { cols: 150, rowH: 12, barH: 6, ink: W.thermalInk, seed: 'eit' + k });
            D.wordBars(c, { x: 196, y, w: 54, h: 12 }, { cols: 54, rowH: 12, barH: 6, ink: W.thermalInk, seed: 'eia' + k, gap: 2 });
        }
        dashes(c, 320);
        thermalText(c, cp.base, 22, 372, 17, false, 'left');
        thermalText(c, cp.tax, 22, 404, 17, false, 'left');
        c.fillStyle = 'rgba(61,65,78,0.7)';
        c.fillRect(20, 418, RW - 40, 2.4);
        thermalText(c, cp.total, 22, 450, 24, true, 'left');
        dashes(c, 470);
        // the barcode and the thank-you line
        const r = Motion.rng('ebar');
        c.fillStyle = W.thermalInk;
        for (let x = 44; x < RW - 44;) {
            const w = 1.5 + Math.floor(r() * 3) * 1.4;
            if (r() < 0.62) c.fillRect(x, 494, w, 50);
            x += w + 1.4;
        }
        D.wordBars(c, { x: 70, y: 556, w: 130, h: 12 }, { cols: 130, rowH: 12, barH: 4.4, ink: '#6a6e7a', seed: 'ethx' });
        // the thermal fade: a faint grey band where the print went pale
        c.fillStyle = 'rgba(160,165,180,0.08)';
        c.fillRect(0, 230, RW, 60);
    }
    // the paper outline: serrated tear-off top, slightly wavy long edges (crumpled)
    function receiptOutline() {
        const pts = [];
        for (let i = 0; i <= 18; i++) pts.push([i * RW / 18, i % 2 ? 7 : 0]);
        const r = Motion.rng('eoutline');
        for (let y = 40; y < RH; y += 40) pts.push([RW + (r() - 0.5) * 6, y]);
        pts.push([RW - 2, RH], [2, RH + 3]);
        for (let y = RH - 40; y > 20; y -= 40) pts.push([(r() - 0.5) * 6, y]);
        return pts;
    }
    function receiptSprite(g) {
        return sprite('exp-receipt', { x: -24, y: -24, w: RW + 48, h: RH + 70 }, (c) => {
            cut(c, receiptOutline(), W.thermal, 'ereceipt', {
                border: 2.2, paper: '#ffffff', shadow: 0.26, jag: 1.1, tex: { alpha: [0.08, 0.16] },
                inner: (cc) => {
                    receiptContent(cc, g);
                    // crumple facets: flat translucent planes between the creases
                    const facets = [[[0, 150], [RW, 110], [RW, 260], [0, 300]], [[0, 470], [RW, 520], [RW, 600], [0, 600]], [[120, 0], [RW, 0], [RW, 110]]];
                    facets.forEach((f, i) => (cc.fillStyle = i === 1 ? 'rgba(90,90,120,0.07)' : 'rgba(90,90,120,0.05)', P.tracePath(cc, f), cc.fill()));
                },
            });
            for (const [a, b] of [[[0, 150], [RW, 110]], [[0, 300], [RW, 260]], [[0, 470], [RW, 520]], [[120, 0], [RW, 110]], [[40, 300], [110, 600]]]) D.crease(c, a, b, { width: 1.4, dark: 'rgba(80,80,100,0.3)' });
            // the bottom end curls up: its underside, a darker band, and the lip
            cut(c, [[4, RH - 4], [RW - 4, RH - 6], [RW - 10, RH + 20], [10, RH + 22]], '#dcdcd6', 'ecurl', { border: 1.4, shadow: 0.3, jag: 0.8, tex: { alpha: [0.1, 0.2] } });
            flat(c, [[10, RH + 12], [RW - 10, RH + 10], [RW - 12, RH + 20], [12, RH + 22]], '#c4c4be', 'ecurl2', { jag: 0.6 });
            // the top-right corner folded over
            cut(c, [[RW - 2, 42], [RW - 44, 2], [RW - 30, 40]], '#e4e3de', 'edog', { border: 1.2, shadow: 0.3 });
        }, 1.5);
    }
    // the receipt at T = { x, y, rot, s } with the spots its tags left (lifted by time tq)
    function drawReceipt(g, T, tq) {
        const sp = receiptSprite(g);
        g.save();
        g.translate(T.x, T.y);
        g.rotate(T.rot);
        g.scale(T.s, T.s);
        g.translate(-RW / 2, -RH / 2);
        sp.draw(g);
        for (let i = 0; i < 4; i++) if (tq >= LIFT(i)) ghost(g, i);
        g.restore();
        return sp;
    }
    // receipt coordinates → global (on the desk)
    const onReceipt = (x, y) => xf([[x - RW / 2, y - RH / 2]], RC.x, RC.y, RC.rot)[0];

    // ------------------------------------------------------------------------- the phone
    const PH = { x: 1080, y: 420, w: 250, h: 500, rot: 0.07 };
    const SW = PH.w - 24, SH = PH.h - 26;
    // the form's fields in phone coordinates (centre): [key, label, x, y, w, h]
    const FIELDS = () => {
        const cp = BRAND.copy;
        return {
            vendor: { label: cp.vendor, x: -100, y: -104, w: 200, h: 40 },
            base: { label: cp.base, x: -100, y: -18, w: 96, h: 40 },
            tax: { label: cp.tax, x: 4, y: -18, w: 96, h: 40 },
            total: { label: cp.total, x: -100, y: 68, w: 200, h: 48 },
        };
    };
    function phoneBody(g) {
        sprite('exp-phone', { x: -PH.w / 2 - 20, y: -PH.h / 2 - 20, w: PH.w + 40, h: PH.h + 40 }, (c) => {
            // side buttons, then the body, the glass edge and the speaker
            for (const [x, y, h] of [[-PH.w / 2 - 5, -120, 50], [-PH.w / 2 - 5, -56, 50], [PH.w / 2 - 1, -90, 80]]) cut(c, P.roundRect(x, y, 7, h, 3), D.shade(W.phone, 10), 'epb' + y, { border: 1.2, shadow: 0.2 });
            cut(c, P.roundRect(-PH.w / 2, -PH.h / 2, PH.w, PH.h, 36), W.phone, 'ephone', { border: 2.6, shadow: 0.3, tex: { alpha: [0.25, 0.45] } });
            flat(c, P.roundRect(-PH.w / 2 + 5, -PH.h / 2 + 5, PH.w - 10, PH.h - 10, 32), D.shade(W.phone, 8), 'ephonerim', { tex: { alpha: [0.15, 0.3] } });
            flat(c, P.roundRect(-SW / 2, -SH / 2, SW, SH, 24), '#1b1c24', 'ephoneglass', {});
        }, 1.4).draw(g);
    }
    // screen contents: 'finder' (the camera) or 'form'
    function screenClip(g) {
        g.beginPath();
        g.roundRect(-SW / 2 + 3, -SH / 2 + 3, SW - 6, SH - 6, 22);
        g.clip();
    }
    function finder(g, lt, rsp) {
        sprite('exp-finder', { x: -SW / 2, y: -SH / 2, w: SW, h: SH }, (c) => {
            flat(c, R(-SW / 2, -SH / 2, SW, SH), '#6f5a44', 'efinderbg', { tex: { alpha: [0.3, 0.5] }, inner: (cc, box) => D.woodGrain(cc, box, '#6f5a44', { seed: 'efg', angle: 0.2 }) });
        }, 1.4).draw(g);
        // the receipt seen through the camera, slightly dimmed
        g.save();
        g.translate(0, -12);
        g.rotate(-0.04);
        g.scale(0.62, 0.62);
        g.translate(-RW / 2, -RH / 2);
        rsp.draw(g);
        g.restore();
        g.fillStyle = 'rgba(30,20,40,0.12)';
        g.fillRect(-SW / 2, -SH / 2, SW, SH);
        // the corner brackets: searching (wide, drifting), then locked on the beat (1.0)
        const d = Math.floor(lt * 12), lock = E.seg(d / 12, 0.42, 1.0), locked = lt >= 1.0;
        const hw = E.lerp(104, 90, E.out(lock)) + (locked ? 0 : Math.sin(d * 1.3) * 3), hh = E.lerp(214, 196, E.out(lock)) + (locked ? 0 : Math.cos(d * 1.1) * 3);
        const cx = locked ? 0 : Math.sin(d * 0.9) * 8 * (1 - lock), cy = -10 + (locked ? 0 : Math.cos(d * 0.7) * 6 * (1 - lock));
        const col = locked ? '#f3d677' : '#fbf8f1', L = 30;
        for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
            const x = cx + sx * hw, y = cy + sy * hh;
            P.markerStroke(g, [[x, y - sy * L], [x, y], [x - sx * L, y]], col, 5, 'ebr' + sx + sy, 0.95);
        }
        // the shutter
        const press = lt >= 1.0 && lt < 1.17 ? 0.9 : 1;
        sprite('exp-shutter', { x: -34, y: -34, w: 68, h: 68 }, (c) => {
            c.strokeStyle = '#fbf8f1';
            c.lineWidth = 4;
            c.beginPath();
            c.arc(0, 0, 28, 0, Math.PI * 2);
            c.stroke();
            cut(c, ell(0, 0, 21, 21, 36), '#fbf8f1', 'eshutter', { border: 0, shadow: 0.2, tex: { alpha: [0.1, 0.2] } });
        }, 1.6).draw((g.save(), g.translate(0, SH / 2 - 46), g.scale(press, press), g));
        g.restore();
    }
    const SHUTTER = [0, SH / 2 - 46];
    function formBase(g) {
        const cl = BRAND.col, cp = BRAND.copy;
        sprite('exp-form', { x: -SW / 2, y: -SH / 2, w: SW, h: SH }, (c) => {
            flat(c, R(-SW / 2, -SH / 2, SW, SH), '#fbf8f1', 'eformbg', { tex: { alpha: [0.06, 0.14] } });
            // header: the brand, a thin rule
            c.fillStyle = cl.cream;
            c.fillRect(-SW / 2, -SH / 2, SW, 62);
            Props.mark(c, -84, -SH / 2 + 34, 0.26, 'eform');
            Props.print(c, BRAND.name, -62, -SH / 2 + 42, 19, cl.ink, { weight: 700 });
            for (const [k, f] of Object.entries(FIELDS())) {
                Props.print(c, f.label, f.x, f.y - 7, 12, cl.grey);
                c.fillStyle = '#ffffff';
                c.fillRect(f.x, f.y, f.w, f.h);
                c.save();
                c.strokeStyle = 'rgba(40,30,40,0.3)';
                c.setLineDash([5, 4]);
                c.lineWidth = 1.6;
                c.strokeRect(f.x, f.y, f.w, f.h);
                c.restore();
                if (k === 'total') (c.fillStyle = cl.brand, (c.globalAlpha = 0.12), c.fillRect(f.x - 4, f.y - 4, f.w + 8, f.h + 8), (c.globalAlpha = 1));
            }
            // category chips and the save bar, printed faint (the form is not done yet)
            for (const [x, w, col] of [[-100, 64, cl.navy], [-30, 76, cl.green], [52, 48, cl.brand]]) {
                c.fillStyle = col;
                c.globalAlpha = 0.14;
                c.beginPath();
                c.roundRect(x, 138, w, 22, 11);
                c.fill();
                c.globalAlpha = 0.6;
                c.fillRect(x + 12, 147, w - 24, 4);
                c.globalAlpha = 1;
            }
        }, 1.6).draw(g);
    }
    // the receipt photo thumbnail in the header, pinned at the top-right
    const THUMB = { x: 78, y: -SH / 2 + 34, rot: 0.08, s: 0.11 };
    function thumb(g, rsp, pop = 1) {
        g.save();
        g.translate(THUMB.x, THUMB.y);
        g.rotate(THUMB.rot);
        g.scale(pop, pop);
        g.fillStyle = '#ffffff';
        g.fillRect(-18, -26, 36, 54);
        g.scale(0.11, 0.11);
        g.translate(-RW / 2, -RH / 2);
        rsp.draw(g);
        g.restore();
    }

    // -------------------------------------------------------------------------- the tags
    const TAGS = ['vendor', 'base', 'tax', 'total'];
    const LIFT = (i) => 1.5 + 0.5 * i;
    function tagSprite(g, i) {
        const row = ROWS()[i], b = rowBox(g, row);
        return sprite('exp-tag' + i + row.text, { x: -b.w / 2 - 10, y: -b.h / 2 - 10, w: b.w + 20, h: b.h + 22 }, (c) => {
            cut(c, [[-b.w / 2, -b.h / 2], [b.w / 2, -b.h / 2 + 1], [b.w / 2 + 1, b.h / 2], [-b.w / 2 + 1, b.h / 2 - 1]], W.thermal, 'etag' + i, {
                border: 2, paper: '#ffffff', shadow: 0.28, jag: 1.2, tex: { alpha: [0.08, 0.16] },
                inner: (cc) => thermalText(cc, row.text, row.align === 'center' ? 0 : b.w / 2 - 9, row.y - (b.y + b.h / 2), b.size, row.bold, row.align === 'center' ? 'center' : 'right'),
            });
            // a coral tab of tape at the left end: it reads as a label
            c.globalAlpha = 0.8;
            flat(c, R(-b.w / 2 - 6, -b.h / 2 + 3, 12, b.h - 6), BRAND.col.brandLight, 'etagtape' + i, { jag: 0.8 });
            c.globalAlpha = 1;
        }, 1.8);
    }
    function tagShadow(g, i) {
        const b = rowBox(g, ROWS()[i]);
        return sprite('exp-tagsh' + i + b.w.toFixed(1), { x: -b.w / 2 - 10, y: -b.h / 2 - 10, w: b.w + 20, h: b.h + 20 }, (c) => {
            flat(c, [[-b.w / 2 - 2, -b.h / 2 - 2], [b.w / 2 + 2, -b.h / 2 - 1], [b.w / 2 + 3, b.h / 2 + 2], [-b.w / 2 - 1, b.h / 2 + 1]], '#2a1426', 'etagsh' + i, { jag: 1.2, tex: false });
        }, 1.2);
    }
    // what the tag leaves on the receipt: the paper under it, paler, with a torn rim
    function ghost(g, i) {
        const b = rowBox(g, ROWS()[i]);
        sprite('exp-ghost' + i + b.w.toFixed(1), { x: b.x - 6, y: b.y - 6, w: b.w + 12, h: b.h + 12 }, (c) => {
            flat(c, R(b.x, b.y, b.w, b.h), '#e9e9e6', 'eghost' + i, { jag: 1.2, tex: { alpha: [0.1, 0.2] } });
            c.save();
            c.strokeStyle = 'rgba(61,65,78,0.35)';
            c.setLineDash([4, 4]);
            c.lineWidth = 1.2;
            c.strokeRect(b.x + 3, b.y + 3, b.w - 6, b.h - 6);
            c.restore();
        }, 1.8).draw(g);
    }
    // where tag i sits in a field, phone coordinates
    function slot(i) {
        const f = FIELDS()[TAGS[i]];
        return [f.x + f.w / 2, f.y + f.h / 2, [0.03, -0.04, 0.05, -0.02][i]];
    }

    // --------------------------------------------------------------------------- hands
    const SKIN = () => Laura.COL.skin;
    function sleeve(g, x, y, rot, size, seed) {
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        g.scale(size / 60, size / 60);
        sprite('exp-sleeve' + seed, { x: -60, y: 0, w: 120, h: 330 }, (c) => {
            cut(c, P.noodle([[0, 36], [0, 300]], 78, 90), Laura.COL.cardigan, 'esl' + seed, { border: 2.4, tex: { alpha: [0.2, 0.4] }, inner: (cc, box) => D.knit(cc, box, Laura.COL.cardigan, { seed: 'esl' + seed, size: 9, alpha: 0.18 }) });
        }, 3.2).draw(g);
        g.restore();
    }

    Shots.expenses = (g, lt, env) => {
        const d = Math.floor(lt * 12 + 1e-6), tq = d / 12, cl = BRAND.col;
        const push = 1 + 0.04 * E.inOut(E.seg(lt, 0, 5));
        g.save();
        g.translate(800, 450);
        g.scale(push, push);
        g.translate(-800, -450);
        desk(g);

        // the receipt on the desk; at 4.5 it is filed: it flies into the phone's thumbnail
        const FILE = [4.5, 4.92], desk0 = { x: RC.x, y: RC.y, rot: RC.rot, s: 1 };
        const rsp = tq < FILE[0] ? drawReceipt(g, desk0, tq) : receiptSprite(g);

        // the phone: rises into the close-up, bobs gently (on twos), dips at the tap
        const rise = E.out(E.seg(tq, 0, 0.42)), tap = lt >= 1.0 && lt < 1.17 ? 5 : 0;
        const px = PH.x + (1 - rise) * 30, py = PH.y + (1 - rise) * 90 + Math.sin(d * 0.55) * 2.2 + tap, prot = PH.rot + (1 - rise) * 0.05 + Math.sin(d * 0.4) * 0.004;
        const toGlobal = (x, y) => xf([[x, y]], px, py, prot)[0];
        // its shadow on the desk (it is held above it)
        g.save();
        g.translate(px + 34, py + 44);
        g.rotate(prot);
        g.fillStyle = 'rgba(40,20,30,0.2)';
        g.beginPath();
        g.roundRect(-PH.w / 2, -PH.h / 2, PH.w, PH.h, 36);
        g.fill();
        g.restore();

        // the left hand holds the phone's left edge: fingers behind, thumb on the front
        // (the right hand: the phone lies in its palm, the fingertips curl round the left edge)
        const LH = { x: PH.w / 2 + 40, y: 150, rot: -(Math.PI / 2 - 0.42), size: 170 };
        g.save();
        g.translate(px, py);
        g.rotate(prot);
        const lw = xf([[0, 0]], LH.x, LH.y, 0)[0];
        sleeve(g, lw[0], lw[1], LH.rot, LH.size, 'L');
        D.hand(g, LH.x, LH.y, LH.size, LH.rot, 'open', { skin: SKIN(), cuff: Laura.COL.shirt });
        phoneBody(g);
        g.save();
        screenClip(g);
        const flash = lt >= 1.0 && lt < 1.17;
        if (lt < 1.0) finder(g, lt, rsp);
        else if (flash) (g.fillStyle = '#ffffff', g.fillRect(-SW / 2, -SH / 2, SW, SH));
        else {
            formBase(g);
            thumb(g, rsp, tq >= FILE[1] && tq < FILE[1] + 0.17 ? 1.35 : 1);
            // the tags that have landed sit in their fields
            for (let i = 0; i < 4; i++) {
                const land = LIFT(i) + 0.5;
                if (tq < land) continue;
                const [sx, sy, sr] = slot(i), f = FIELDS()[TAGS[i]], sp = tagSprite(g, i);
                const fit = Math.min(1, (f.w - 10) / (sp.box.w - 20), (f.h - 4) / (sp.box.h - 22));
                const sq = tq < land + 0.09 ? 1.1 : 1;
                g.save();
                g.translate(sx, sy);
                g.rotate(sr);
                g.scale(fit * sq, fit / sq);
                sp.draw(g);
                g.restore();
                // the field ticks as it lands
                if (tq >= land && tq < land + 0.25) kit().sprite('exp-fieldticks' + i, { x: -f.w / 2 - 50, y: -f.h / 2 - 40, w: f.w + 100, h: f.h + 80 }, (c) => {
                    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) P.markerStroke(c, [[s * (f.w / 2 + 10), -12 + k * 12], [s * (f.w / 2 + 30), -20 + k * 20]], cl.brand, 3.6, 'eft' + i + s + k, 0.9);
                }, 1.6).draw((g.save(), g.translate(sx, sy), g));
                if (tq >= land && tq < land + 0.25) g.restore();
            }
            // 4.0: the green check and «read and booked»
            if (tq >= 4.0) {
                const pop = E.pop(tq, 4.0, 0.3);
                g.save();
                g.translate(0, 176);
                g.scale(pop, pop);
                sprite('exp-read' + BRAND.copy.read, { x: -SW / 2, y: -40, w: SW, h: 80 }, (c) => {
                    cut(c, P.roundRect(-SW / 2 + 12, -30, SW - 24, 60, 14), cl.green, 'eread', { border: 2.2, shadow: 0.25, tex: { alpha: [0.25, 0.45] } });
                    cut(c, ell(-SW / 2 + 42, 0, 19, 19, 32), '#ffffff', 'ereadc', { border: 0, shadow: 0.15 });
                    P.markerStroke(c, [[-SW / 2 + 32, 1], [-SW / 2 + 40, 9], [-SW / 2 + 53, -8]], cl.green, 5, 'ereadtick', 1);
                    c.save();
                    c.font = `700 18px "${BRAND.font}"`;
                    const w = c.measureText(BRAND.copy.read).width, s = Math.min(1, (SW - 100) / w);
                    c.translate(-SW / 2 + 70, 7);
                    c.scale(s, 1);
                    Props.print(c, BRAND.copy.read, 0, 0, 18, '#ffffff', { weight: 700, alpha: 1 });
                    c.restore();
                }, 1.8).draw(g);
                g.restore();
            }
        }
        g.restore();
        // the glass: a glint across the screen
        g.save();
        g.globalAlpha = 0.1;
        g.fillStyle = '#ffffff';
        g.beginPath();
        g.moveTo(SW / 2 - 70, -SH / 2 + 4);
        g.lineTo(SW / 2 - 30, -SH / 2 + 4);
        g.lineTo(-SW / 2 + 60, SH / 2 - 4);
        g.lineTo(-SW / 2 + 20, SH / 2 - 4);
        g.fill();
        g.restore();
        g.restore();

        // the left hand: in from the bottom left (on twos), taps the shutter on the beat
        const TAPK = [[0.2, 1], [0.5, 0.55], [0.75, 0.2], [11 / 12, 0.04], [1.0, 0], [14 / 12, 0], [16 / 12, 0.14], [1.6, 0.7], [1.9, 1.2]];
        if (lt >= 0.2 && lt < 1.9) {
            let k = TAPK.findIndex(([a]) => a > tq);
            k = k < 0 ? TAPK.length - 1 : k;
            const [a0, v0] = TAPK[Math.max(0, k - 1)], [a1, v1] = TAPK[k];
            const away = E.lerp(v0, v1, E.inOut(E.seg(tq, a0, a1)));
            const rot = 0.5, size = 150, [ax0, ay] = D.handAnchor('point'), ax = -ax0;
            const tip = toGlobal(SHUTTER[0], SHUTTER[1] + 4);
            const ox = (ax * Math.cos(rot) - ay * Math.sin(rot)) * size / 60, oy = (ax * Math.sin(rot) + ay * Math.cos(rot)) * size / 60;
            const wx = tip[0] - ox - away * 200, wy = tip[1] - oy + away * 320;
            sleeve(g, wx, wy, rot, size, 'R');
            D.hand(g, wx, wy, size, rot, 'point', { skin: SKIN(), cuff: Laura.COL.shirt, mirror: true });
        }

        // the tags in flight: peel up in place, arc over to the phone, land on the beat
        for (let i = 0; i < 4; i++) {
            const t0 = LIFT(i), u = E.seg(tq, t0, t0 + 0.5);
            if (tq < t0 || u >= 1) continue;
            const row = ROWS()[i], b = rowBox(g, row), sp = tagSprite(g, i);
            const from = onReceipt(b.x + b.w / 2, b.y + b.h / 2);
            const [sx, sy, sr] = slot(i), to = toGlobal(sx, sy);
            const peel = E.seg(u, 0, 0.34), fly = E.inOut(E.seg(u, 0.34, 1));
            const mid = [(from[0] + to[0]) / 2, Math.min(from[1], to[1]) - 180];
            const p = fly > 0 ? P.bezier(from, [from[0] + 60, mid[1]], [to[0] - 80, mid[1]], to, 30)[Math.round(fly * 30)] : from;
            const f = FIELDS()[TAGS[i]], fit = Math.min(1, (f.w - 10) / (sp.box.w - 20), (f.h - 4) / (sp.box.h - 22));
            const lift = Math.sin(Math.PI * Math.min(1, peel * 0.5 + fly * 0.5));
            const s = E.lerp(1, fit, fly) * (1 + 0.28 * lift), rot = E.lerp(RC.rot, prot + sr, fly) + Math.sin(fly * Math.PI) * 0.25 * (i % 2 ? -1 : 1);
            const py2 = p[1] - peel * 10 * (1 - fly);
            // the shadow falls down-right, longer the higher it flies
            g.save();
            g.translate(p[0] + lift * 26, py2 + lift * 34);
            g.rotate(rot);
            g.scale(s, s);
            g.globalAlpha = 0.2;
            tagShadow(g, i).draw(g);
            g.restore();
            g.save();
            g.translate(p[0], py2);
            g.rotate(rot);
            g.scale(s, s);
            sp.draw(g);
            g.restore();
        }

        // the receipt flies into the thumbnail: lifts, arcs over, shrinks (on twos)
        if (tq >= FILE[0] && tq < FILE[1]) {
            const u = E.inOut(E.seg(tq, FILE[0], FILE[1])), up = E.seg(tq, FILE[0], FILE[0] + 0.17);
            const [tx, ty] = toGlobal(THUMB.x, THUMB.y), s = Math.exp(E.lerp(0, Math.log(THUMB.s), u)) * (1 + 0.05 * up * (1 - u));
            drawReceipt(g, { x: E.lerp(RC.x, tx, u), y: E.lerp(RC.y, ty, u) - Math.sin(Math.PI * u) * 120 - up * 12, rot: E.lerp(RC.rot, prot + THUMB.rot, u) - Math.sin(Math.PI * u) * 0.3, s }, tq);
        }
        g.restore();

        // the flash: one drawing of white over everything, then a thin afterglow
        if (lt >= 1.0 && lt < 1.09) (g.fillStyle = 'rgba(255,252,240,0.55)', g.fillRect(-50, -50, 1700, 1000));
        else if (lt >= 1.09 && lt < 1.17) (g.fillStyle = 'rgba(255,252,240,0.2)', g.fillRect(-50, -50, 1700, 1000));

        // the title, bottom left, and the brand mark
        Shots.title(g, lt, 0.5, BRAND.copy.photoTicket, 90, 826, 58);
        kit().sprite('brand-mark', { x: -70, y: -60, w: 140, h: 120 }, (c) => Props.mark(c, 0, 0, 1, 'set'), 2).draw((g.save(), g.translate(1500, 820), g.scale(0.55, 0.55), g));
        g.restore();
    };
})();
