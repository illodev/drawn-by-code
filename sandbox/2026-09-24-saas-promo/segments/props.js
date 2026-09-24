// Props of the promo, all paper: the laptop screen with the product's UI printed on it,
// the invoice sheet, a QR code, the rubber stamp, the tax office's mailbox, the paper plane.
// Copy and colours come from BRAND (brand-default.js, replaced by private/brand.js).
// Global: Props.
const Props = (() => {
    const P = Paper, D = PaperDetail;
    let kit = null;
    const init = (env) => (kit = PaperKit.make(env, { font: 'Hand' }));
    const sprite = (...a) => kit.sprite(...a);
    const C = () => BRAND.col;
    const cut = (c, pts, col, seed, o = {}) => P.cutout(c, pts, col, seed, { border: 2.6, shadow: 0.16, ...o });

    // UI lettering printed on paper: the brand font, a hair of ink spread, never bold fill
    function print(c, text, x, y, size, color, o = {}) {
        c.save();
        c.font = `${o.weight ?? 500} ${size}px "${o.mono ? BRAND.mono : BRAND.font}"`;
        c.textAlign = o.align ?? 'left';
        c.textBaseline = 'alphabetic';
        c.fillStyle = color;
        c.globalAlpha = o.alpha ?? 0.92;
        c.fillText(text, x, y);
        c.globalAlpha = (o.alpha ?? 1) * 0.18;
        c.fillText(text, x + size * 0.02, y + size * 0.015);
        c.restore();
    }

    // A QR code that reads as complete: three finder squares, timing rows, a seeded module
    // field. Drawn in a size × size square at (x, y).
    function qr(c, x, y, size, seed, ink = '#231f24') {
        const n = 25, m = size / n, r = Motion.rng('qr' + seed);
        const finder = (i, j) => (i < 8 && j < 8) || (i < 8 && j >= n - 8) || (i >= n - 8 && j < 8);
        c.save();
        c.fillStyle = ink;
        for (let j = 0; j < n; j++) {
            for (let i = 0; i < n; i++) {
                if (finder(i, j)) continue;
                const timing = (i === 6 || j === 6) && (i + j) % 2 === 0;
                if (timing || r() < 0.48) c.fillRect(x + i * m, y + j * m, m + 0.3, m + 0.3);
            }
        }
        for (const [fi, fj] of [[0, 0], [n - 7, 0], [0, n - 7]]) {
            c.fillRect(x + fi * m, y + fj * m, 7 * m, 7 * m);
            c.fillStyle = '#fbf8f1';
            c.fillRect(x + (fi + 1) * m, y + (fj + 1) * m, 5 * m, 5 * m);
            c.fillStyle = ink;
            c.fillRect(x + (fi + 2) * m, y + (fj + 2) * m, 3 * m, 3 * m);
        }
        c.restore();
    }

    // The brand mark as paper at (x, y), scale s (the mark is ~100 units wide)
    function mark(c, x, y, s, seed = '') {
        c.save();
        c.translate(x, y);
        c.scale(s, s);
        BRAND.mark(c, (cc, pts, col, key) => cut(cc, pts, col, key + seed, { border: 2.2 / s, shadow: 0.12 }));
        c.restore();
    }

    // ---------------------------------------------------------------- the invoice sheet
    // The document itself (the thing that is issued, stamped, folded and sent), in local
    // coordinates 0..W × 0..H. Content only: the paper is cut by the caller.
    const INV = { W: 420, H: 560 };
    function invoiceContent(c, o = {}) {
        const { W, H } = INV, col = C(), cp = BRAND.copy;
        mark(c, 58, 64, 0.42, 'inv');
        print(c, cp.invoice, W - 34, 66, 26, col.navy, { weight: 700, align: 'right' });
        print(c, cp.number, W - 34, 92, 17, col.grey, { mono: true, align: 'right' });
        // client block and a thin rule
        print(c, cp.client, 34, 150, 14, col.grey);
        print(c, cp.clientName, 34, 176, 21, col.ink, { weight: 700 });
        c.fillStyle = D.shade(col.cream, -8);
        c.fillRect(34, 200, W - 68, 2);
        cp.lines.forEach(([what, amount], i) => {
            const y = 238 + i * 38;
            print(c, what, 34, y, 16, col.ink);
            print(c, amount, W - 34, y, 16, col.ink, { mono: true, align: 'right' });
            c.fillStyle = 'rgba(40,30,40,0.08)';
            c.fillRect(34, y + 12, W - 68, 1.5);
        });
        print(c, cp.base, W - 200, 350, 13, col.grey);
        print(c, cp.baseValue, W - 34, 350, 13, col.ink, { mono: true, align: 'right' });
        print(c, cp.tax, W - 200, 368, 13, col.grey);
        print(c, cp.taxValue, W - 34, 368, 13, col.ink, { mono: true, align: 'right' });
        // total on a coral band
        c.fillStyle = col.brand;
        c.globalAlpha = 0.14;
        c.fillRect(30, 376, W - 60, 42);
        c.globalAlpha = 1;
        print(c, cp.total, 44, 404, 18, col.ink, { weight: 700 });
        print(c, cp.amount, W - 44, 404, 20, col.brand, { weight: 700, mono: true, align: 'right' });
        // the QR slot: dashed box until the stamp lands
        if (o.qr) qr(c, 34, 440, 96, 'invoice');
        else {
            c.save();
            c.strokeStyle = 'rgba(40,30,40,0.25)';
            c.setLineDash([5, 5]);
            c.lineWidth = 1.5;
            c.strokeRect(34, 440, 96, 96);
            c.restore();
        }
        if (o.qr) {
            print(c, 'VERI*FACTU', 146, 470, 15, col.green, { weight: 700, mono: true });
            print(c, cp.number + ' · #a41', 146, 494, 13, col.grey, { mono: true });
        }
    }
    function invoiceSheet(o = {}) {
        const key = 'invoice' + (o.qr ? '-qr' : '');
        return sprite(key, { x: -INV.W / 2 - 12, y: -INV.H / 2 - 12, w: INV.W + 24, h: INV.H + 24 }, (c) => {
            const hw = INV.W / 2, hh = INV.H / 2;
            cut(c, [[-hw, -hh], [hw, -hh + 2], [hw + 1, hh], [-hw + 1, hh - 1]], col().paper, 'invoice', {
                border: 2.4, paper: '#ffffff', shadow: 0.2, jag: 0.5, tex: { lVar: 1.2, sVar: 1.4, alpha: [0.1, 0.22] },
                inner: (cc) => (cc.save(), cc.translate(-hw, -hh), invoiceContent(cc, o), cc.restore()),
            });
        }, 1.8);
    }
    const col = C;

    // ---------------------------------------------------------------- laptop screen close-up
    // The product's «new invoice» form printed on paper, glued inside a laptop bezel.
    // Everything static; the button is drawn apart so it can be pressed.
    const SCREEN = { x: 150, y: 70, w: 1300, h: 800 };
    function screen(g) {
        const { x, y, w, h } = SCREEN, cl = col(), cp = BRAND.copy;
        sprite('laptop-screen', { x: x - 60, y: y - 60, w: w + 120, h: h + 140 }, (c) => {
            // bezel: dark paper with its own texture, a little camera dot
            cut(c, P.roundRect(x - 40, y - 40, w + 80, h + 90, 34), '#2c2a33', 'bezel', { border: 3, shadow: 0.3, tex: { alpha: [0.25, 0.5] } });
            c.fillStyle = '#4a4752';
            c.beginPath();
            c.arc(x + w / 2, y - 18, 5, 0, Math.PI * 2);
            c.fill();
            // the screen: cream paper with the UI printed
            cut(c, [[x, y], [x + w, y + 2], [x + w - 1, y + h], [x + 1, y + h - 1]], '#fbf8f1', 'screen', {
                border: 0, shadow: 0, jag: 0.4, tex: { alpha: [0.08, 0.18] },
                inner: (cc) => {
                    // sidebar
                    cc.fillStyle = cl.cream;
                    cc.fillRect(x, y, 250, h);
                    BRAND.lockup(cc, x + 34, y + 62, 40); // the logo in one colour
                    [0, 1, 2, 3, 4].forEach((it, i) => {
                        const yy = y + 150 + i * 56;
                        if (i === 1) (cc.fillStyle = cl.brand, (cc.globalAlpha = 0.16), cc.fillRect(x + 18, yy - 30, 214, 44), (cc.globalAlpha = 1));
                        cc.fillStyle = i === 1 ? cl.brand : 'rgba(40,30,40,0.35)';
                        cc.fillRect(x + 36, yy - 16, 16, 16);
                        cc.fillStyle = i === 1 ? cl.brand : cl.ink;
                        cc.fillRect(x + 66, yy - 12, 70 + ((i * 37) % 60), 9);
                    });
                    // form header
                    print(cc, cp.newInvoice, x + 310, y + 90, 44, cl.ink, { weight: 700 });
                    print(cc, cp.number, x + 314, y + 128, 20, cl.grey, { mono: true });
                    // fields
                    const field = (fx, fy, fw, label, value, o = {}) => {
                        print(cc, label, fx, fy - 12, 16, cl.grey);
                        cc.fillStyle = '#ffffff';
                        cc.fillRect(fx, fy, fw, 50);
                        cc.strokeStyle = 'rgba(40,30,40,0.22)';
                        cc.lineWidth = 2;
                        cc.strokeRect(fx, fy, fw, 50);
                        print(cc, value, fx + 16, fy + 33, 21, cl.ink, o);
                    };
                    field(x + 310, y + 190, 440, cp.client, cp.clientName, { weight: 700 });
                    field(x + 790, y + 190, 220, cp.date, cp.dateValue, { mono: true });
                    // lines table
                    cc.fillStyle = cl.cream;
                    cc.fillRect(x + 310, y + 290, 940, 44);
                    print(cc, cp.item, x + 330, y + 319, 16, cl.grey);
                    print(cc, cp.price, x + 1230, y + 319, 16, cl.grey, { align: 'right' });
                    cp.lines.forEach(([what, amount], i) => {
                        const yy = y + 380 + i * 58;
                        print(cc, what, x + 330, yy, 22, cl.ink);
                        print(cc, amount, x + 1230, yy, 22, cl.ink, { mono: true, align: 'right' });
                        cc.fillStyle = 'rgba(40,30,40,0.1)';
                        cc.fillRect(x + 310, yy + 20, 940, 2);
                    });
                    // base and tax, then the total
                    print(cc, cp.base, x + 900, y + 572, 18, cl.grey);
                    print(cc, cp.baseValue, x + 1230, y + 572, 18, cl.ink, { mono: true, align: 'right' });
                    print(cc, cp.tax, x + 900, y + 604, 18, cl.grey);
                    print(cc, cp.taxValue, x + 1230, y + 604, 18, cl.ink, { mono: true, align: 'right' });
                    cc.fillStyle = 'rgba(40,30,40,0.18)';
                    cc.fillRect(x + 900, y + 620, 330, 2);
                    print(cc, cp.total, x + 900, y + 656, 24, cl.ink, { weight: 700 });
                    print(cc, cp.amount, x + 1230, y + 656, 30, cl.brand, { weight: 700, mono: true, align: 'right' });
                    // notes field with the payment details
                    print(cc, cp.notes, x + 310, y + 548, 16, cl.grey);
                    cc.fillStyle = '#ffffff';
                    cc.fillRect(x + 310, y + 560, 520, 110);
                    cc.strokeStyle = 'rgba(40,30,40,0.22)';
                    cc.lineWidth = 2;
                    cc.strokeRect(x + 310, y + 560, 520, 110);
                    print(cc, cp.payNote, x + 326, y + 596, 17, cl.ink);
                    cc.fillStyle = 'rgba(40,30,40,0.12)';
                    for (let k = 0; k < 2; k++) cc.fillRect(x + 326, y + 616 + k * 22, 300 - k * 90, 7);
                },
            });
        }, 1.1).draw(g);
    }
    const BUTTON = { x: 1180, y: 784, w: 210, h: 74 };
    function button(g, press = 0) {
        const { x, y, w, h } = BUTTON, cl = col();
        const b = sprite('issue-button', { x: -w / 2 - 12, y: -h / 2 - 12, w: w + 24, h: h + 24 }, (c) => {
            cut(c, P.roundRect(-w / 2, -h / 2, w, h, 16), cl.brand, 'issue-btn', { border: 2.4, shadow: 0.22, tex: { alpha: [0.25, 0.5] } });
            print(c, BRAND.copy.issue, 0, 10, 30, '#ffffff', { weight: 700, align: 'center', alpha: 1 });
        }, 1.6);
        g.save();
        g.translate(x, y + press * 4);
        g.scale(1 - press * 0.06, 1 - press * 0.1);
        b.draw(g);
        g.restore();
    }

    // ---------------------------------------------------------------- stamp, mailbox, plane
    // A rubber stamp seen from the side-front: wooden knob, neck, block, coral rubber.
    function stamp(g, x, y, s, rot = 0) {
        const sp = sprite('stamp', { x: -90, y: -250, w: 180, h: 270 }, (c) => {
            cut(c, D.spline([[-34, -200], [-20, -232], [0, -238], [20, -232], [34, -200], [22, -176], [-22, -176]], 6), '#b8814f', 'stamp-knob', { inner: (cc, box) => D.woodGrain(cc, box, '#b8814f', { seed: 'knob', angle: 0.2 }) });
            cut(c, [[-16, -180], [16, -180], [20, -90], [-20, -90]], '#9c6a3f', 'stamp-neck', { inner: (cc, box) => D.woodGrain(cc, box, '#9c6a3f', { seed: 'neck', angle: 1.5 }) });
            cut(c, P.roundRect(-78, -96, 156, 70, 10), '#b8814f', 'stamp-block', { inner: (cc, box) => D.woodGrain(cc, box, '#b8814f', { seed: 'block' }) });
            cut(c, P.roundRect(-72, -30, 144, 26, 6), col().brand, 'stamp-rubber', { border: 1.8 });
        }, 1.6);
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        g.scale(s, s);
        sp.draw(g);
        g.restore();
    }
    // The tax office's mailbox on a post: navy body with a rounded top, slot, label, flag.
    function mailbox(g, x, y, s, flag = 0, shake = 0) {
        const cl = col();
        g.save();
        g.translate(x + Math.sin(shake * 40) * shake * 6, y);
        g.scale(s, s);
        sprite('mailbox', { x: -150, y: -260, w: 300, h: 560 }, (c) => {
            for (const fx of [-80, 80]) cut(c, P.roundRect(fx - 16, 14, 32, 18, 5), '#141733', 'foot' + fx, { border: 1.6 });
            cut(c, D.spline([[-110, 20], [-112, -120], [-96, -200], [-50, -236], [0, -244], [50, -236], [96, -200], [112, -120], [110, 20]], 8), cl.navy, 'box', { border: 3, inner: (cc, box) => D.rib(cc, box, cl.navy, { step: 26, width: 2.2, angle: 0 }) });
            // slot and its lip
            cut(c, P.roundRect(-70, -170, 140, 22, 8), '#141733', 'slot', { border: 1.6, shadow: 0 });
            cut(c, P.roundRect(-78, -150, 156, 12, 5), D.shade(cl.navy, 12), 'lip', { border: 1.4, shadow: 0.2 });
            // label
            cut(c, P.roundRect(-64, -96, 128, 60, 8), cl.paper, 'label', { border: 1.8, inner: (cc) => print(cc, BRAND.copy.office, 0, -56, 36, cl.navy, { weight: 700, align: 'center' }) });
        }, 1.4).draw(g);
        // flag: a red strip on a pin at the right side, up when flag = 1
        const fl = sprite('mailflag', { x: -12, y: -110, w: 70, h: 124 }, (c) => {
            cut(c, [[-6, 0], [6, 0], [6, -96], [-6, -96]], '#8f8a92', 'flagpole', { border: 1.4 });
            cut(c, [[4, -100], [52, -94], [48, -62], [4, -66]], cl.brand, 'flag', { border: 1.8 });
        }, 1.6);
        g.save();
        g.translate(112, -60);
        g.rotate(E.lerp(Math.PI / 2, 0, flag));
        fl.draw(g);
        g.restore();
        g.restore();
    }
    const E = Ease;

    // The invoice folded into a plane: fixed paper pieces (body, far wing, near wing, fold)
    // pointing to +x, about 200 long. The near wing shows the printed side.
    function plane(g, x, y, s, rot) {
        const cl = col();
        const sp = sprite('invoice-plane', { x: -110, y: -60, w: 220, h: 120 }, (c) => {
            cut(c, [[100, 0], [-96, -46], [-70, -4]], D.shade(cl.paper, -16), 'plane-far', { border: 1.6, shadow: 0.3 });
            cut(c, [[100, 0], [-70, -4], [-96, 12], [-60, 10]], D.shade(cl.paper, -26), 'plane-body', { border: 1.4, shadow: 0.3 });
            cut(c, [[100, 0], [-60, 10], [-100, 50]], cl.paper, 'plane-near', {
                border: 1.8, shadow: 0.35,
                inner: (cc) => {
                    cc.fillStyle = 'rgba(40,30,40,0.25)';
                    for (let k = 0; k < 4; k++) cc.fillRect(-60 + k * 8, 18 + k * 7, 70 - k * 12, 2);
                    cc.fillStyle = cl.brand;
                    cc.globalAlpha = 0.5;
                    cc.fillRect(-40, 30, 30, 4);
                },
            });
            D.crease(c, [98, 0], [-66, 6]);
        }, 2);
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        g.scale(s, s);
        sp.draw(g);
        g.restore();
    }

    return { init, get kit() { return kit; }, sprite, cut, print, qr, mark, INV, invoiceContent, invoiceSheet, SCREEN, screen, BUTTON, button, stamp, mailbox, plane };
})();
