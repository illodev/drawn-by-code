// Shots of the promo. Each takes the local time lt (seconds since the shot's block began)
// so the same block can be placed anywhere in the edit. Global: Shots.
const Shots = {};
(() => {
    const P = Paper, D = PaperDetail, E = Ease;
    const col = () => BRAND.col;
    const drawing = (lt, t0 = 0) => Math.max(0, Math.floor((lt - t0) * 12 + 1e-6));
    const kitOf = () => Props.kit;

    // brand title: the brand font written as a wipe, with a coral marker underline
    function title(g, lt, t0, text, x, y, size, o = {}) {
        const p = E.clamp((lt - t0) / (o.dur ?? 0.35));
        if (p <= 0) return;
        g.save();
        g.font = `700 ${size}px "${BRAND.font}"`;
        const w = g.measureText(text).width, x0 = o.align === 'center' ? x - w / 2 : x;
        g.beginPath();
        g.rect(x0 - 10, y - size * 1.2, (w + 20) * p, size * 1.8);
        g.clip();
        g.fillStyle = o.color ?? col().ink;
        g.fillText(text, x0, y);
        g.restore();
        const u = E.seg(lt, t0 + (o.dur ?? 0.35) * 0.8, t0 + (o.dur ?? 0.35) * 1.6);
        if (u > 0) P.markerStroke(g, [[x0 - 4, y + size * 0.28], [x0 - 4 + (w + 8) * u, y + size * 0.32]], o.under ?? col().brand, size * 0.12, 'tl' + text, 0.9);
    }
    Shots.title = title;

    // the office set lives in office.js (Office.back / desk / front / calendar)
    function mark(g, x, y, s) {
        kitOf().sprite('brand-mark', { x: -70, y: -60, w: 140, h: 120 }, (c) => Props.mark(c, 0, 0, 1, 'set'), 2).draw((g.save(), g.translate(x, y), g.scale(s, s), g));
        g.restore();
    }

    // --------------------------------------------------------------- 10–12: issue (screen)
    // POV on the laptop: the pointing hand comes in, presses «Issue» on the beat (1.0), the
    // printed invoice peels off the screen towards the camera.
    Shots.issue = (g, lt, env) => {
        const d = drawing(lt);
        // the room behind the laptop, big and a touch dimmed (we are leaning in)
        g.save();
        g.translate(800, 300);
        g.scale(1.7, 1.7);
        g.translate(-900, -330);
        Office.back(g, lt);
        g.restore();
        g.fillStyle = 'rgba(40,30,45,0.28)';
        g.fillRect(-50, -50, 1700, 1000);
        const push = 1 + 0.02 * E.inOut(E.seg(lt, 0, 2));
        g.save();
        g.translate(800, 470);
        g.scale(push, push);
        g.translate(-800, -470);
        g.save();
        g.translate(800, 450);
        g.scale(0.9, 0.9);
        g.translate(-800, -450);
        Props.screen(g);
        // life on the laptop: sticky notes on the bezel, a sticker, the keyboard below
        kitOf().sprite('bezel-life', { x: 60, y: 0, w: 1480, h: 1000 }, (c) => {
            const note = (x, y, w, h, col, rot, seed, lines) => {
                const pts = [[0, 0], [w, 2], [w - 2, h], [2, h - 2]].map(([px, py]) => [x + px * Math.cos(rot) - py * Math.sin(rot), y + px * Math.sin(rot) + py * Math.cos(rot)]);
                P.cutout(c, pts, col, seed, { border: 2, shadow: 0.25, inner: (cc, box) => D.cursive(cc, { x: box.x + 10, y: box.y + 6, w: box.w - 20, h: lines * 22 }, '#5a4a52', { seed, lineH: 22, xh: 6, hw: 4, width: 1.3, alpha: 0.7 }) });
            };
            note(92, 150, 110, 104, '#f3d56b', -0.12, 'bz1', 3);
            note(1400, 520, 104, 98, '#9ad0b8', 0.1, 'bz2', 3);
            note(1398, 110, 96, 90, '#f0a28e', 0.06, 'bz3', 2);
            P.cutout(c, P.ellipse(1450, 830, 30, 30, 32), BRAND.col.brand, 'bzsticker', { border: 2.4, shadow: 0.2 });
            Props.mark(c, 1450, 832, 0.36, 'bz');
        }, 1.2).draw(g);
        g.restore();
        const press = lt >= 1.0 && lt < 1.25 ? 1 : 0;
        Props.button(g, press);
        if (lt >= 1.0 && lt < 1.34) kitOf().sprite('press-ticks', { x: -200, y: -120, w: 400, h: 240 }, (c) => {
            for (let k = 0; k < 10; k++) {
                const a = (k / 10) * Math.PI * 2 + 0.3, r0 = 136, r1 = 172;
                if (Math.sin(a) < -0.5) continue;
                P.markerStroke(c, [[Math.cos(a) * r0, Math.sin(a) * r0 * 0.55], [Math.cos(a) * r1, Math.sin(a) * r1 * 0.55]], BRAND.col.brand, 6, 'pt' + k, 0.9);
            }
        }, 1.4).draw((g.save(), g.translate(Props.BUTTON.x, Props.BUTTON.y), g));
        if (lt >= 1.0 && lt < 1.34) g.restore();
        // the pointing hand: in from the bottom right on twos, pressing on the beat
        const HAND = [[1500, 1160], [1450, 1080], [1400, 1020], [1362, 980], [1340, 958], [1330, 946], [1326, 940], [1324, 942], [1322, 950], [1322, 950], [1326, 944], [1340, 958]];
        const [hx, hy] = HAND[Math.min(HAND.length - 1, d)];
        if (lt < 1.9) {
            const sleeve = [[hx + 40, hy + 60]];
            kitOf().sprite('issue-sleeve', { x: -60, y: -40, w: 380, h: 520 }, (c) => {
                P.cutout(c, P.noodle([[0, 0], [190, 300]], 120, 130), Laura.COL.cardigan, 'issue-sleeve', { border: 3, tex: { alpha: [0.2, 0.4] }, inner: (cc, box) => D.knit(cc, box, Laura.COL.cardigan, { seed: 'issue-sleeve', size: 14, alpha: 0.16 }) });
                P.cutout(c, P.noodle([[-10, -14], [14, 22]], 118, 118), Laura.COL.shirt, 'issue-cuff', { border: 2.4 });
            }, 1.2).draw((g.save(), g.translate(sleeve[0][0], sleeve[0][1]), g));
            g.restore();
            D.hand(g, hx, hy, 92 * (press ? 0.96 : 1), -0.62, 'point', { skin: Laura.COL.skin, res: 3 });
        }
        g.restore();
        // 1.25–2.0: the invoice peels off the screen and comes at the camera
        if (lt >= 1.25) {
            const u = E.out(E.seg(Math.floor(lt * 12) / 12, 1.25, 2.0));
            const sheet = Props.invoiceSheet();
            const cx = E.lerp(840, 800, u), cy = E.lerp(470, 450, u), s = E.lerp(1.1, 1.45, u);
            const hw = (Props.INV.W / 2 + 12) * s, hh = (Props.INV.H / 2 + 12) * s, lift = E.lerp(0.25, 0, u);
            // top edge nearer the camera while it peels (perspective)
            Motion.quad(g, sheet.canvas, [[cx - hw * (1 + lift), cy - hh], [cx + hw * (1 + lift), cy - hh], [cx + hw, cy + hh], [cx - hw, cy + hh]], 8);
        }
    };

    // --------------------------------------------------------------- 12–16: send (medium)
    // Laura at her desk. The invoice floats in front of her; the stamp lands on the beat
    // (0.5) and leaves the QR; the sheet folds into a plane in four drawings (1.0–1.33),
    // flies (1.5–2.5) into the tax office's mailbox; the flag goes up on the beat (2.5).
    const FOLDS = [
        [[-1, -1], [1, -1], [1, 1], [-1, 1]],
        [[0, -1], [1, -0.45], [1, 1], [-1, 1], [-1, -0.45]],
        [[0, -1.05], [0.55, 0], [0.5, 1], [-0.5, 1], [-0.55, 0]],
        [[0, -1.1], [0.22, 0.3], [0.2, 1], [-0.2, 1], [-0.22, 0.3]],
    ];
    Shots.send = (g, lt, env) => {
        const d = drawing(lt), cl = col();
        const push = 1 + 0.04 * E.inOut(E.seg(lt, 0, 4));
        g.save();
        g.translate(800, 450);
        g.scale(push, push);
        g.translate(-800, -450);
        Office.back(g, lt);
        // Laura: follows the sheet, blinks at the stamp, turns to the mailbox, winks
        const look = lt < 1.5 ? [0.9, -0.3] : lt < 2.5 ? [1, 0] : [1, 0.2];
        const eyes = lt >= 0.5 && lt < 0.6 ? 'closed' : lt >= 3.2 && lt < 3.45 ? 'wink' : lt >= 2.6 ? 'happy' : 'open';
        const mouth = lt >= 2.5 ? 'grin' : lt >= 1.5 ? 'o' : 'smile';
        const pose = lt >= 2.6 && lt < 3.6 ? 'cheer' : 'desk';
        const LX = 470, LY = 660, LS = 0.92;
        Laura.draw(g, LX, LY, LS, { t: lt, eyes, look, mouth, pose, tilt: lt >= 1.5 ? 0.05 : -0.03, layer: 'body' });
        Office.desk(g, lt);
        Laura.draw(g, LX, LY, LS, { t: lt, pose, layer: 'arms' });
        // the mailbox on the right
        const flag = E.back(E.seg(lt, 2.5, 2.75)), shake = E.seg(lt, 2.5, 2.9) > 0 && lt < 2.9 ? 1 - E.seg(lt, 2.5, 2.9) : 0;
        Props.mailbox(g, 1340, 612, 0.95, flag, shake);
        if (lt >= 2.5 && lt < 2.9) kitOf().sprite('mail-ticks', { x: -190, y: -190, w: 380, h: 380 }, (c) => {
            for (let k = 0; k < 9; k++) {
                const a = -Math.PI * (0.1 + (k / 8) * 0.8);
                P.markerStroke(c, [[Math.cos(a) * 130, Math.sin(a) * 130], [Math.cos(a) * 172, Math.sin(a) * 172]], cl.brand, 6, 'mt' + k, 0.9);
            }
        }, 1.4).draw((g.save(), g.translate(1340, 440), g));
        if (lt >= 2.5 && lt < 2.9) g.restore();
        // the invoice: floating (0–1), folding (1.0–1.33), flying (1.5–2.5)
        const IX = 980, IY = 330, IS = 0.72;
        if (lt < 1.0) {
            const settle = E.back(E.seg(lt, 0, 0.3)), squash = lt >= 0.5 && lt < 0.6 ? 0.96 : 1;
            g.save();
            g.translate(IX, E.lerp(-200, IY, settle) + Math.sin(Math.floor(lt * 12) * 0.9) * 3);
            g.rotate(-0.04);
            g.scale(IS, IS * squash);
            Props.invoiceSheet({ qr: lt >= 0.5 }).draw(g);
            g.restore();
        } else if (lt < 1.5) {
            const k = Math.min(3, Math.floor((lt - 1.0) * 12)), hw = Props.INV.W / 2 * IS, hh = Props.INV.H / 2 * IS;
            const pts = FOLDS[k].map(([u, v]) => [IX + u * hw, IY + v * hh]);
            kitOf().sprite('fold' + k, { x: IX - hw - 20, y: IY - hh * 1.2, w: hw * 2 + 40, h: hh * 2.4 }, (c) => {
                P.cutout(c, pts, '#ffffff', 'fold' + k, { border: 0, shadow: 0.2, jag: 0.4, tex: { alpha: [0.1, 0.2] } });
                D.crease(c, [IX, IY - hh], [IX, IY + hh]);
                if (k === 0) (c.save(), c.translate(IX - hw, IY - hh), c.scale(IS, IS), Props.invoiceContent(c, { qr: true }), c.restore());
                else {
                    // the back of the sheet: the print shows through, faint and mirrored
                    c.save();
                    P.tracePath(c, pts);
                    c.clip();
                    c.translate(IX + hw, IY - hh);
                    c.scale(-IS, IS);
                    c.globalAlpha = 0.18;
                    Props.invoiceContent(c, { qr: true });
                    c.restore();
                    for (const [a, b] of [[pts[0], pts[1]], [pts[0], pts[pts.length - 1]]]) D.crease(c, a, b);
                }
            }, 1.6).draw(g);
        } else if (lt < 2.5) {
            const u = E.inOut(E.seg(Math.floor(lt * 12) / 12, 1.5, 2.5));
            const path = P.bezier([IX, IY + 60], [1120, 180], [1300, 200], [1340, 440], 40);
            const i = Math.min(path.length - 2, Math.floor(u * (path.length - 1)));
            const [px, py] = path[i], [qx, qy] = path[i + 1];
            g.save();
            g.strokeStyle = 'rgba(42,37,48,0.45)';
            g.setLineDash([10, 12]);
            g.lineWidth = 3;
            g.beginPath();
            path.slice(0, i + 1).forEach(([x, y], j) => (j ? g.lineTo(x, y) : g.moveTo(x, y)));
            g.stroke();
            g.restore();
            Props.plane(g, px, py, 1.15 - u * 0.35, Math.atan2(qy - py, qx - px));
        }
        // the stamp: comes down on the beat, lifts off
        const STAMP = [[-1, -300], [0.42, -60], [0.5, 0], [0.58, -8], [0.75, -120], [0.9, -420]];
        if (lt >= 0.3 && lt < 0.9) {
            const k = STAMP.findIndex(([at]) => at > Math.floor(lt * 12) / 12);
            const [a0, y0] = STAMP[Math.max(0, k - 1)], [a1, y1] = STAMP[k < 0 ? STAMP.length - 1 : k];
            const off = k < 0 ? -420 : E.lerp(y0, y1, E.seg(lt, a0, a1));
            Props.stamp(g, IX - 110 * IS, IY + 180 * IS + off, 0.8, -0.05);
            if (lt >= 0.5 && lt < 0.67) kitOf().sprite('stamp-ticks', { x: -140, y: -60, w: 280, h: 120 }, (c) => {
                for (const sd of [-1, 1]) for (let k2 = 0; k2 < 3; k2++) P.markerStroke(c, [[sd * 90, -20 + k2 * 22], [sd * 124, -30 + k2 * 26]], cl.ink, 5, 'st' + sd + k2, 0.9);
            }, 1.4).draw((g.save(), g.translate(IX - 110 * IS, IY + 180 * IS), g));
            if (lt >= 0.5 && lt < 0.67) g.restore();
        }
        Office.front(g, lt);
        g.restore();
        // titles, bottom left, on the beats
        if (lt < 2.5) title(g, lt, 0.5, BRAND.copy.issued, 90, 820, 58);
        else title(g, lt, 2.5, BRAND.copy.compliance, 90, 820, 58, { under: cl.green });
        mark(g, 1500, 820, 0.55);
    };
})();
