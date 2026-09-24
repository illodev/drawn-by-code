// Block «collections» of the edit (see ../../scene.js EDIT). Defines Shots.collections(g, lt, env).
// 21–27 s · medium shot, Laura in her office. An overdue invoice sticks out of the letter
// tray; the alarm clock on the desk rings (0.5–1.5) and she looks at it. The brand sticker
// on the laptop pops (1.5) and a coral reminder slides out of the laptop and WAITS in the
// air, its «send» button pulsing, the hourglass turning (2.5, 3.0). Her hand reaches out and
// presses it on the beat (3.5): only then the reminder folds into a paper plane (3.75) and
// flies out of the window (4.1–5.0). The invoice's red tag turns into a green check (5.5).
(() => {
    const P = Paper, D = PaperDetail, E = Ease;
    const kit = () => Props.kit;
    const sprite = (...a) => Props.sprite(...a);
    const cut = (c, pts, col, seed, o = {}) => P.cutout(c, pts, col, seed, { border: 2.4, shadow: 0.2, ...o });
    const flat = (c, pts, col, seed, o = {}) => P.cutout(c, pts, col, seed, { border: 0, shadow: 0, ...o });
    const R = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    const xf = (pts, x, y, a = 0, s = 1) => pts.map(([px, py]) => [x + (px * Math.cos(a) - py * Math.sin(a)) * s, y + (px * Math.sin(a) + py * Math.cos(a)) * s]);
    const ell = (cx, cy, rx, ry, n = 40, a = 0) => xf(P.ellipse(0, 0, rx, ry, n), cx, cy, a);
    const C = { brass: '#d9ae52', body: '#e2b04a', steel: '#c4c7cf', ink: '#2a2530', cream: '#fbf8f1', red: '#c9432f' };
    // fit a line of brand text into a width: returns the font size to use
    function fit(g, text, size, maxW, weight = 700, mono = false) {
        g.save();
        g.font = `${weight} ${size}px "${mono ? BRAND.mono : BRAND.font}"`;
        const w = g.measureText(text).width;
        g.restore();
        return w > maxW ? size * maxW / w : size;
    }

    // ------------------------------------------------------ the overdue invoice in the tray
    // A sheet standing in the letter tray (Office.desk draws the tray at x 1098–1228, top bar
    // at y 644), clipped at the tray's top bar so it reads as inside it. Local frame: the
    // bottom centre of the sheet, up is -y.
    const IW = 150, IH = 200;
    function overdueSheet(g) {
        const cp = BRAND.copy, cl = BRAND.col;
        return sprite('col-overdue' + cp.debtor + cp.debtAmount, { x: -IW / 2 - 12, y: -IH - 12, w: IW + 24, h: IH + 24 }, (c) => {
            cut(c, [[-IW / 2, -IH], [IW / 2, -IH + 2], [IW / 2 + 1, 0], [-IW / 2 + 1, -1]], '#fbfaf5', 'colinv', {
                border: 2, paper: '#ffffff', shadow: 0.24, jag: 0.6, tex: { alpha: [0.08, 0.18] },
                inner: (cc) => {
                    Props.mark(cc, -IW / 2 + 20, -IH + 22, 0.2, 'colinv');
                    cc.fillStyle = 'rgba(31,58,138,0.7)';
                    cc.fillRect(IW / 2 - 56, -IH + 16, 42, 7);
                    const ds = fit(cc, cp.debtor, 17, IW - 28);
                    Props.print(cc, cp.debtor, -IW / 2 + 14, -IH + 62, ds, cl.ink, { weight: 700 });
                    cc.fillStyle = 'rgba(40,30,40,0.12)';
                    cc.fillRect(-IW / 2 + 14, -IH + 72, IW - 28, 1.6);
                    D.wordBars(cc, { x: -IW / 2 + 14, y: -IH + 82, w: IW - 28, h: 40 }, { cols: IW - 28, rowH: 11, barH: 3.6, ink: '#8b8780', seed: 'colinvbars' });
                    cc.fillStyle = cl.brand;
                    cc.globalAlpha = 0.14;
                    cc.fillRect(-IW / 2 + 10, -IH + 128, IW - 20, 30);
                    cc.globalAlpha = 1;
                    const as = fit(cc, cp.debtAmount, 20, IW - 40, 700, true);
                    Props.print(cc, cp.debtAmount, IW / 2 - 16, -IH + 150, as, cl.brand, { weight: 700, mono: true, align: 'right' });
                },
            });
        }, 1.8);
    }
    // the label glued across the invoice: red «overdue», later a green check
    function stripSprite(g, paid) {
        const cp = BRAND.copy, cl = BRAND.col, sw = IW + 18, size = fit(g, cp.overdue, 16, IW - 16);
        return sprite('col-strip' + (paid ? 'paid' : cp.overdue), { x: -sw / 2 - 10, y: -26, w: sw + 20, h: 52 }, (c) => {
            cut(c, [[-sw / 2, -15], [sw / 2, -17], [sw / 2 + 1, 14], [-sw / 2 + 1, 16]], paid ? cl.green : C.red, 'colstrip' + (paid ? 'p' : 'o'), { border: 2, shadow: 0.28, jag: 0.9, tex: { alpha: [0.25, 0.45] } });
            if (paid) P.markerStroke(c, [[-12, 1], [-3, 10], [14, -9]], '#ffffff', 5, 'colpaidtick', 1);
            else Props.print(c, cp.overdue, 0, size * 0.36, size, '#ffffff', { weight: 700, align: 'center', alpha: 1 });
        }, 1.8);
    }

    // ------------------------------------------------------------------ the alarm clock
    // Twin-bell alarm clock on the desk at AX (feet on the desk top). Two ringing drawings:
    // tilted left with the hammer on the left bell, and the mirror.
    const AX = { x: 1316, y: 684, r: 46 };
    function clockSprite(k) {
        return sprite('col-alarm' + k, { x: -110, y: -170, w: 220, h: 190 }, (c) => {
            const r = AX.r, cy = -r - 14, sd = k === 0 ? -1 : 1;
            // feet
            for (const s of [-1, 1]) cut(c, D.taper([[s * 20, cy + r * 0.7], [s * 30, -8], [s * 34, 0]], [10, 8, 9]), C.ink, 'colfoot' + s, { border: 1.4, shadow: 0.25 });
            // the handle arching over the top
            cut(c, P.noodle(D.spline([[-24, cy - r + 6], [-18, cy - r - 22], [18, cy - r - 22], [24, cy - r + 6]], 8, false), 7), C.steel, 'colhandle', { border: 1.4, shadow: 0.2 });
            // bells: domes tilted outwards, a rim band and a stud
            for (const s of [-1, 1]) {
                const bx = s * 34, by = cy - r + 4, a = s * 0.55;
                cut(c, xf(D.cspline([[-26, 6], [-24, -12], [-10, -26], [10, -26], [24, -12], [26, 6]], 5), bx, by, a), C.brass, 'colbell' + s, { border: 1.8, shadow: 0.22, tex: { alpha: [0.25, 0.45] }, inner: (cc) => { cc.fillStyle = 'rgba(255,255,255,0.35)'; cc.beginPath(); cc.ellipse(bx - s * 6, by - 12, 4, 8, a, 0, 7); cc.fill(); } });
                cut(c, xf(R(-27, 2, 54, 6), bx, by, a), D.shade(C.brass, -14), 'colbellrim' + s, { border: 1.2, shadow: 0.15 });
                cut(c, ell(bx + Math.sin(a) * 30, by - Math.cos(a) * 30, 5, 5, 16), C.steel, 'colstud' + s, { border: 1, shadow: 0.2 });
            }
            // the hammer: a rod from the top with a ball striking one bell
            const hx = sd * 22, hy = cy - r - 8;
            cut(c, P.noodle([[0, cy - r + 8], [hx, hy]], 4), C.steel, 'colhammer' + k, { border: 1, shadow: 0.2 });
            cut(c, ell(hx, hy, 6, 6, 18), C.ink, 'colhball' + k, { border: 1, shadow: 0.2 });
            // body, face, numerals as ticks, hands (10:10), the red alarm hand
            cut(c, ell(0, cy, r, r, 60), C.body, 'colbody', { border: 2.4, shadow: 0.28, tex: { alpha: [0.25, 0.45] } });
            cut(c, ell(0, cy, r - 9, r - 9, 56), C.cream, 'colface', { border: 1.2, shadow: 0.12, tex: { alpha: [0.08, 0.16] } });
            c.fillStyle = C.ink;
            for (let i = 0; i < 12; i++) {
                const a = (i / 12) * Math.PI * 2, rr = r - 15, big = i % 3 === 0;
                c.save();
                c.translate(Math.sin(a) * rr, cy - Math.cos(a) * rr);
                c.rotate(a);
                c.fillRect(-1, -3, 2, big ? 7 : 4);
                c.restore();
            }
            const hand = (a, l, w, col, seed) => P.markerStroke(c, [[0, cy], [Math.sin(a) * l, cy - Math.cos(a) * l]], col, w, seed, 1);
            hand(-1.05, 18, 4, C.ink, 'colhh');
            hand(1.05, 26, 3, C.ink, 'colmh');
            hand(2.4, 22, 2, C.red, 'colah');
            cut(c, ell(0, cy, 4, 4, 14), C.red, 'colpin', { border: 0.8, shadow: 0.15 });
            c.fillStyle = 'rgba(255,255,255,0.45)';
            c.beginPath();
            c.ellipse(-r * 0.45, cy - r * 0.45, 6, 12, 0.7, 0, 7);
            c.fill();
        }, 1.6);
    }
    // motion lines either side: two drawings (short / long), marker arcs born at the bells
    function ringLines(k) {
        return sprite('col-ring' + k, { x: -150, y: -210, w: 300, h: 200 }, (c) => {
            for (const s of [-1, 1]) for (let j = 0; j < 3; j++) {
                const rr = 74 + j * 16 + k * 8, a0 = -Math.PI / 2 + s * (0.55 + j * 0.02), span = 0.34 + k * 0.1;
                const pts = Array.from({ length: 6 }, (_, i) => { const a = a0 + s * span * (i / 5); return [Math.cos(a) * rr, -AX.r - 14 + Math.sin(a) * rr]; });
                P.markerStroke(c, pts, C.ink, 4 - j * 0.6, 'colring' + k + s + j, 0.85);
            }
        }, 1.6);
    }

    // ------------------------------------------------------------------ the reminder note
    const NW = 320, NH = 270, NC = { x: 862, y: 322 };
    const BTN = { x: 58, y: 92, w: 156, h: 48 };
    function noteContent(c) {
        const cp = BRAND.copy, cl = BRAND.col;
        // header on the coral: the mark on a cream disc, «payment reminder»
        cut(c, ell(-NW / 2 + 34, -NH / 2 + 30, 19, 19, 32), C.cream, 'colnmd', { border: 0, shadow: 0.15 });
        Props.mark(c, -NW / 2 + 34, -NH / 2 + 31, 0.26, 'colnote');
        const hs = fit(c, cp.reminder, 22, NW - 80);
        Props.print(c, cp.reminder, -NW / 2 + 62, -NH / 2 + 38, hs, C.cream, { weight: 700, alpha: 1 });
        // the cream card: who, how much, how late, the message, the send button's slot
        cut(c, R(-NW / 2 + 12, -NH / 2 + 58, NW - 24, NH - 70), C.cream, 'colncard', {
            border: 0, shadow: 0.18, jag: 0.5, tex: { alpha: [0.06, 0.14] },
            inner: (cc) => {
                const x0 = -NW / 2 + 26, x1 = NW / 2 - 26;
                const ds = fit(cc, cp.debtor, 20, 160);
                Props.print(cc, cp.debtor, x0, -NH / 2 + 92, ds, cl.ink, { weight: 700 });
                const as = fit(cc, cp.debtAmount, 22, 100, 700, true);
                Props.print(cc, cp.debtAmount, x1, -NH / 2 + 92, as, cl.brand, { weight: 700, mono: true, align: 'right' });
                cc.fillStyle = C.red;
                cc.beginPath();
                cc.arc(x0 + 4, -NH / 2 + 111, 4, 0, 7);
                cc.fill();
                const os = fit(cc, cp.overdue, 14, 200, 500);
                Props.print(cc, cp.overdue, x0 + 14, -NH / 2 + 116, os, cl.grey);
                cc.fillStyle = 'rgba(40,30,40,0.12)';
                cc.fillRect(x0, -NH / 2 + 128, x1 - x0, 1.6);
                D.cursive(cc, { x: x0, y: -NH / 2 + 134, w: x1 - x0 - 30, h: 54 }, '#4a4258', { lineH: 20, xh: 5.5, hw: 5, width: 1.6, alpha: 0.75, gap: 8, seed: 'colmsg' });
            },
        });
    }
    function noteSprite() {
        return sprite('col-note' + BRAND.copy.reminder, { x: -NW / 2 - 14, y: -NH / 2 - 14, w: NW + 28, h: NH + 30 }, (c) => {
            cut(c, [[-NW / 2, -NH / 2], [NW / 2, -NH / 2 + 2], [NW / 2 + 1, NH / 2], [-NW / 2 + 1, NH / 2 - 1]], BRAND.col.brand, 'colnote', {
                border: 2.6, shadow: 0.26, jag: 0.6, tex: { alpha: [0.25, 0.45] },
            });
            noteContent(c);
        }, 1.8);
    }
    function sendButton(press) {
        const cp = BRAND.copy, { w, h } = BTN;
        return sprite('col-send' + cp.send + press, { x: -w / 2 - 12, y: -h / 2 - 12, w: w + 24, h: h + 26 }, (c) => {
            cut(c, P.roundRect(-w / 2, -h / 2, w, h, 14), press ? D.shade(BRAND.col.brand, -8) : BRAND.col.brand, 'colsend', { border: 2.4, shadow: press ? 0.1 : 0.3, tex: { alpha: [0.25, 0.5] } });
            const s = fit(c, cp.send, 24, w - 56);
            Props.print(c, cp.send, -10, s * 0.36, s, '#ffffff', { weight: 700, align: 'center', alpha: 1 });
            // a little paper plane icon
            c.fillStyle = '#ffffff';
            c.beginPath();
            c.moveTo(w / 2 - 34, -8);
            c.lineTo(w / 2 - 14, 0);
            c.lineTo(w / 2 - 34, 8);
            c.lineTo(w / 2 - 29, 0);
            c.fill();
        }, 1.8);
    }
    // the hourglass left of the button: two drawings (upright / turning)
    function hourglass(k) {
        return sprite('col-hg' + k, { x: -22, y: -30, w: 44, h: 60 }, (c) => {
            for (const s of [-1, 1]) cut(c, R(-14, s * 22 - 3, 28, 6), C.body, 'colhgcap' + s, { border: 1.2, shadow: 0.2 });
            cut(c, [[-10, -19], [10, -19], [2, 0], [10, 19], [-10, 19], [-2, 0]], '#e6eef2', 'colhgglass', { border: 1.2, shadow: 0.15, tex: { alpha: [0.08, 0.16] } });
            c.fillStyle = C.brass;
            if (k === 0) {
                c.beginPath(); c.moveTo(-5, -12); c.lineTo(5, -12); c.lineTo(1, -3); c.lineTo(-1, -3); c.fill();
                c.beginPath(); c.moveTo(-8, 18); c.lineTo(8, 18); c.lineTo(0, 10); c.fill();
                c.fillRect(-0.7, -3, 1.4, 14);
            } else {
                c.beginPath(); c.moveTo(-8, 18); c.lineTo(8, 18); c.lineTo(2, 6); c.lineTo(-2, 6); c.fill();
            }
        }, 2);
    }
    // the fold: four drawings from the note to a dart (the paper's back shows, coral)
    const FOLDS = [
        [[-1, -1], [1, -1], [1, 1], [-1, 1]],
        [[0, -1], [1, -0.45], [1, 1], [-1, 1], [-1, -0.45]],
        [[0, -1.05], [0.55, 0], [0.5, 1], [-0.5, 1], [-0.55, 0]],
        [[0, -1.1], [0.22, 0.3], [0.2, 1], [-0.2, 1], [-0.22, 0.3]],
    ];
    function foldSprite(k) {
        const hw = NW / 2, hh = NH / 2, pts = FOLDS[k].map(([u, v]) => [u * hw, v * hh]);
        return sprite('col-fold' + k, { x: -hw - 20, y: -hh * 1.2, w: hw * 2 + 40, h: hh * 2.4 }, (c) => {
            cut(c, pts, D.shade(BRAND.col.brand, -6), 'colfold' + k, {
                border: 2.2, shadow: 0.22, jag: 0.5, tex: { alpha: [0.25, 0.45] },
                inner: (cc) => {
                    // the cream card shows through the paper's back, mirrored and faint
                    cc.save();
                    cc.scale(-1, 1);
                    cc.globalAlpha = 0.16;
                    cc.fillStyle = C.cream;
                    cc.fillRect(-NW / 2 + 12, -NH / 2 + 58, NW - 24, NH - 70);
                    cc.restore();
                },
            });
            D.crease(c, [0, -hh], [0, hh], { dark: 'rgba(90,30,20,0.45)', light: 'rgba(255,220,200,0.6)' });
            for (const [a, b] of [[pts[0], pts[1]], [pts[0], pts[pts.length - 1]]]) D.crease(c, a, b, { dark: 'rgba(90,30,20,0.4)', light: 'rgba(255,220,200,0.5)' });
        }, 1.6);
    }
    // the coral plane: body, far wing, near wing (the cream card shows on it), a fold line
    function planeSprite() {
        const cl = BRAND.col;
        return sprite('col-plane', { x: -110, y: -60, w: 220, h: 120 }, (c) => {
            cut(c, [[100, 0], [-96, -46], [-70, -4]], D.shade(cl.brand, -14), 'colpfar', { border: 1.8, shadow: 0.3 });
            cut(c, [[100, 0], [-70, -4], [-96, 12], [-60, 10]], D.shade(cl.brand, -24), 'colpbody', { border: 1.4, shadow: 0.3 });
            cut(c, [[100, 0], [-60, 10], [-100, 50]], cl.brand, 'colpnear', {
                border: 2, shadow: 0.35, tex: { alpha: [0.25, 0.45] },
                inner: (cc) => {
                    cc.fillStyle = C.cream;
                    cc.globalAlpha = 0.85;
                    cc.beginPath();
                    cc.moveTo(40, 8);
                    cc.lineTo(-50, 14);
                    cc.lineTo(-80, 40);
                    cc.fill();
                    cc.globalAlpha = 1;
                },
            });
            D.crease(c, [98, 0], [-66, 6]);
        }, 2);
    }

    // ---------------------------------------------------------------------- Laura's reach
    // Laura (as in Shots.send) at LX, LY, LS. The right arm is posed per drawing; the pointing
    // hand's fingertip lands on the send button. Solves wrist and elbow for a fingertip.
    const LX = 470, LY = 660, LS = 0.92;
    const DESK_ARMS = Laura.ARMS.desk;
    function reachArm(tip) {
        const [ax0, ay] = D.handAnchor('pointBack'), ax = -ax0, sh = DESK_ARMS[1][0]; // her left hand: mirrored
        let rot = 1.3, wrist = tip, elbow = sh;
        for (let k = 0; k < 4; k++) {
            wrist = [tip[0] - (ax * Math.cos(rot) - ay * Math.sin(rot)), tip[1] - (ax * Math.sin(rot) + ay * Math.cos(rot))];
            const mx = (sh[0] + wrist[0]) / 2, my = (sh[1] + wrist[1]) / 2, l = Math.hypot(wrist[0] - sh[0], wrist[1] - sh[1]);
            // the elbow drops below the line shoulder–wrist, more when the arm is bent
            const sag = Math.sqrt(Math.max(0, 168 * 168 - (l / 2) * (l / 2)));
            elbow = [mx - 10, my + Math.max(24, sag)];
            rot = Math.atan2(wrist[1] - elbow[1], wrist[0] - elbow[0]) + Math.PI / 2;
        }
        return [sh, elbow.map(Math.round), wrist.map(Math.round)];
    }
    const toLaura = ([x, y]) => [(x - LX) / LS, (y - LY) / LS];
    // key times in a table snap to the drawing grid (1/12 s), so 1.67 means drawing 20
    const onTwos = (table) => table.map(([a, ...r]) => [Math.round(a * 12) / 12 - 1e-6, ...r]);

    Shots.collections = (g, lt, env) => {
        const d = Math.floor(lt * 12 + 1e-6), tq = d / 12, cl = BRAND.col, cp = BRAND.copy;
        const push = 1 + 0.04 * E.inOut(E.seg(lt, 0, 6));
        g.save();
        g.translate(800, 450);
        g.scale(push, push);
        g.translate(-800, -450);
        Office.back(g, lt);

        // the plane's last stretch is outside, seen through the upper-right pane
        const FLY = [4.08, 5.0], PANE = { x0: 199, y0: 98, x1: 302, y1: 260 };
        const path = P.bezier([NC.x - 40, NC.y - 10], [700, 110], [430, 30], [250, 176], 40);
        const planeAt = (u) => {
            const i = Math.min(path.length - 2, Math.floor(u * (path.length - 1)));
            const [px, py] = path[i], [qx, qy] = path[i + 1];
            return { x: px, y: py, a: Math.atan2(qy - py, qx - px) };
        };
        const drawPlane = (p, s) => {
            g.save();
            g.translate(p.x, p.y);
            g.rotate(p.a);
            g.scale(s, Math.cos(p.a) < 0 ? -s : s);
            planeSprite().draw(g);
            g.restore();
        };
        const fu = E.inOut(E.seg(tq, FLY[0], FLY[1]));
        if (tq >= FLY[0] && fu >= 0.82 && tq < FLY[1] + 0.34) {
            const u = Math.min(1, fu), after = E.seg(tq, FLY[1], FLY[1] + 0.34);
            const p = planeAt(u), s = E.lerp(0.34, 0.2, E.seg(u, 0.82, 1)) * (1 - 0.5 * after);
            g.save();
            g.beginPath();
            g.rect(PANE.x0, PANE.y0, PANE.x1 - PANE.x0, PANE.y1 - PANE.y0);
            g.clip();
            drawPlane({ x: p.x - after * 40, y: p.y - after * 30, a: p.a }, s);
            g.restore();
        }

        // Laura: looks at the clock, at the note, presses, follows the plane out
        const look = lt < 0.5 ? [0.2, 0.5] : lt < 1.5 ? [1, 0.6] : lt < 4.1 ? [1, -0.1] : lt < 5.0 ? [-1, -0.7] : [0.2, 0];
        const eyes = lt >= 3.5 && lt < 3.62 ? 'closed' : lt >= 5.2 && lt < 5.45 ? 'wink' : lt >= 5.0 ? 'happy' : 'open';
        const mouth = lt >= 0.5 && lt < 1.5 ? 'o' : lt >= 1.5 && lt < 3.4 ? 'smile' : lt >= 3.4 && lt < 4.1 ? 'grin' : lt >= 4.1 && lt < 5.0 ? 'o' : 'grin';
        const tilt = lt >= 0.5 && lt < 1.5 ? 0.06 : lt >= 4.1 && lt < 5.0 ? -0.06 : 0.02;
        Laura.draw(g, LX, LY, LS, { t: lt, eyes, look, mouth, tilt, layer: 'body' });
        Office.desk(g, lt);

        // the overdue invoice: jumps in the tray when the alarm rings (0.5)
        const jump = tq >= 0.5 && tq < 1.5 ? [0, -14, -30, -34, -30, -26, -24, -22, -20, -20, -20, -20][Math.min(11, d - 6)] : tq >= 1.5 ? -20 : 0;
        g.save();
        g.beginPath();
        g.rect(1040, 300, 260, 346);
        g.clip();
        g.save();
        g.translate(1164, 690 + jump);
        g.rotate(-0.05 + (tq >= 0.5 && tq < 1.5 ? (d % 2 ? 0.02 : -0.02) : 0));
        overdueSheet(g).draw(g);
        g.restore();
        g.restore();
        // the label across it: flips over to a green check at 5.5
        {
            const flip = tq < 5.33 ? 1 : tq < 5.5 ? 1 - E.seg(tq, 5.33, 5.5) : E.seg(tq, 5.5, 5.67);
            const paid = tq >= 5.5, [sx, sy] = xf([[0, -IH + 110]], 1164, 690 + jump, -0.05)[0];
            g.save();
            g.translate(sx, sy);
            g.rotate(-0.2 + (tq >= 0.5 && tq < 1.5 ? (d % 2 ? 0.03 : -0.03) : 0));
            g.scale(1, Math.max(0.06, flip));
            stripSprite(g, paid).draw(g);
            g.restore();
            if (tq >= 5.5 && tq < 5.75) kit().sprite('col-paidticks', { x: -130, y: -80, w: 260, h: 160 }, (c) => {
                for (let k = 0; k < 9; k++) {
                    const a = (k / 9) * Math.PI * 2 + 0.2;
                    P.markerStroke(c, [[Math.cos(a) * 96, Math.sin(a) * 40], [Math.cos(a) * 118, Math.sin(a) * 54]], cl.green, 4.4, 'colpt' + k, 0.9);
                }
            }, 1.6).draw((g.save(), g.translate(sx, sy), g));
            if (tq >= 5.5 && tq < 5.75) g.restore();
        }

        // the alarm clock: rings 0.5–1.5 (two drawings on twos, a hop), then settles
        {
            const ringing = tq >= 0.5 && tq < 1.5, k = ringing ? d % 2 : 0;
            const tiltA = ringing ? (k ? 0.1 : -0.1) : tq >= 1.5 && tq < 1.67 ? 0.04 : 0;
            g.save();
            g.translate(AX.x, AX.y - (ringing && d % 4 < 2 ? 4 : 0));
            g.rotate(tiltA);
            clockSprite(ringing ? k : 0).draw(g);
            g.restore();
            if (ringing) ringLines(d % 2).draw((g.save(), g.translate(AX.x, AX.y), g));
            if (ringing) g.restore();
        }

        // 1.5: the brand sticker on the laptop lid pops; the reminder slides out of the laptop
        if (tq >= 1.5 && tq < 2.0) {
            const pop = E.pop(tq, 1.5, 0.3) * (1 - E.seg(tq, 1.83, 2.0) * 0.3);
            g.save();
            g.translate(728, 574);
            g.rotate(-0.12);
            g.scale(pop * 1.4, pop * 1.4);
            kit().sprite('col-sticker', { x: -30, y: -30, w: 60, h: 60 }, (c) => { cut(c, ell(0, 0, 22, 22, 32), '#fbf7ee', 'colstk', { border: 1.4, shadow: 0.25 }); Props.mark(c, 0, 0, 0.3, 'colstk'); }, 2).draw(g);
            g.restore();
            if (tq < 1.75) kit().sprite('col-stickerticks', { x: -80, y: -80, w: 160, h: 160 }, (c) => {
                for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2 + 0.2; P.markerStroke(c, [[Math.cos(a) * 40, Math.sin(a) * 40], [Math.cos(a) * 60, Math.sin(a) * 60]], cl.brand, 4, 'colst' + k, 0.9); }
            }, 1.6).draw((g.save(), g.translate(728, 574), g));
            if (tq >= 1.5 && tq < 1.75) g.restore();
        }
        // the note: out of the laptop (1.58–2.42), waiting (2.42–3.5), pressed (3.5), folds
        const OUT = onTwos([[1.58, 726, 522, 0.24, 0], [1.67, 730, 494, 0.3, -0.04], [1.75, 744, 446, 0.44, -0.08], [1.92, 790, 380, 0.7, -0.06], [2.08, 840, 330, 0.94, 0.02], [2.25, 866, 318, 1.03, 0.01], [2.42, NC.x, NC.y, 1, 0]]);
        let noteT = null;
        if (tq >= 1.58 && tq < 3.75) {
            if (tq < 2.42) {
                const i = OUT.findIndex(([a]) => a > tq), k = i < 0 ? OUT.length - 1 : Math.max(0, i - 1), [, x, y, s, a] = OUT[k];
                noteT = { x, y, s, a };
            } else {
                // hovering: a slow bob on twos, a nudge on each waiting beat
                const nudge = (tq >= 2.5 && tq < 2.67) || (tq >= 3.0 && tq < 3.17) ? -5 : 0;
                noteT = { x: NC.x, y: NC.y + Math.sin(d * 0.5) * 3 + nudge, s: 1, a: Math.sin(d * 0.35) * 0.012 };
            }
            const inLaptop = d < 23;
            g.save();
            if (inLaptop) {
                // behind the lid: clip the lid out
                g.beginPath();
                g.rect(-100, -100, 1800, 1100);
                g.moveTo(614, 670); g.lineTo(794, 664); g.lineTo(808, 512); g.lineTo(644, 502); g.closePath();
                g.clip('evenodd');
            }
            g.translate(noteT.x, noteT.y);
            g.rotate(noteT.a);
            g.scale(noteT.s, noteT.s);
            noteSprite().draw(g);
            const pressed = tq >= 3.5 && tq < 3.67;
            g.save();
            g.translate(BTN.x, BTN.y + (pressed ? 3 : 0));
            const pulse = !pressed && ((tq >= 2.5 && tq < 2.67) || (tq >= 3.0 && tq < 3.17)) ? 1.08 : 1;
            g.scale(pulse * (pressed ? 0.95 : 1), pulse * (pressed ? 0.9 : 1));
            sendButton(pressed ? 1 : 0).draw(g);
            g.restore();
            // waiting: a dashed marker ring around the button, and the hourglass turning
            if (tq >= 2.42 && tq < 3.5) {
                const k = Math.floor((tq - 2.42) * 6) % 2;
                kit().sprite('col-wait' + k, { x: -BTN.w / 2 - 30, y: -BTN.h / 2 - 30, w: BTN.w + 60, h: BTN.h + 60 }, (c) => {
                    const n = 22;
                    for (let i = k; i < n; i += 2) {
                        const a0 = (i / n) * Math.PI * 2, a1 = ((i + 0.8) / n) * Math.PI * 2;
                        P.markerStroke(c, [0, 0.5, 1].map((u) => { const a = a0 + (a1 - a0) * u; return [Math.cos(a) * (BTN.w / 2 + 14), Math.sin(a) * (BTN.h / 2 + 12)]; }), D.shade(BRAND.col.brand, -12), 3.6, 'colw' + k + i, 0.9);
                    }
                }, 1.6).draw((g.save(), g.translate(BTN.x, BTN.y), g));
                g.restore();
            }
            const turn = (tq >= 2.5 && tq < 2.67) || (tq >= 3.0 && tq < 3.17);
            g.save();
            g.translate(-NW / 2 + 46, BTN.y);
            g.rotate(turn ? (tq - Math.floor(tq * 2) / 2 < 0.09 ? Math.PI / 2 : Math.PI) : 0);
            hourglass(turn ? 1 : 0).draw(g);
            g.restore();
            if (pressed) kit().sprite('col-pressticks', { x: -150, y: -80, w: 300, h: 160 }, (c) => {
                for (let k = 0; k < 10; k++) {
                    const a = (k / 10) * Math.PI * 2 + 0.3;
                    P.markerStroke(c, [[Math.cos(a) * 100, Math.sin(a) * 40], [Math.cos(a) * 128, Math.sin(a) * 54]], '#ffffff', 5, 'colpt' + k, 0.95);
                }
            }, 1.6).draw((g.save(), g.translate(BTN.x, BTN.y), g));
            if (pressed) g.restore();
            g.restore();
        } else if (tq >= 3.75 && tq < FLY[0]) {
            const k = Math.min(3, Math.floor((tq - 3.75) * 12));
            g.save();
            g.translate(NC.x, NC.y);
            foldSprite(k).draw(g);
            g.restore();
        }

        // her arms: the right hand reaches out and presses on the beat (3.5), comes back
        const tipGlobal = xf([[BTN.x, BTN.y + 4]], NC.x, NC.y, 0)[0];
        const tip = toLaura(tipGlobal);
        const REACH = onTwos([[3.0, 0.62], [3.17, 0.36], [3.33, 0.12], [3.5, 0], [3.67, 0], [3.83, 0.3], [4.0, 1]]);
        let arms = null, hands = null;
        if (tq >= 3.0 && tq < 4.0) {
            const k = Math.max(0, REACH.findIndex(([a]) => a > tq) - 1), away = REACH[k][1];
            const t2 = [tip[0] - away * 260, tip[1] + away * 170];
            arms = [DESK_ARMS[0], reachArm(t2)];
            hands = ['rest', 'pointBack'];
        }
        Laura.draw(g, LX, LY, LS, { t: lt, arms: arms ?? undefined, hands: hands ?? undefined, layer: 'arms' });

        // the plane in the room (in front of Laura), until it is small enough to be outside
        if (tq >= FLY[0] && fu < 0.82) {
            const p = planeAt(fu);
            drawPlane(p, E.lerp(1.1, 0.34, fu / 0.82));
        }
        Office.front(g, lt);
        g.restore();

        // titles, bottom left, on the beats
        if (lt < 3.5) Shots.title(g, lt, 1.0, cp.collectMore, 90, 826, 58);
        else Shots.title(g, lt, 3.5, cp.youApprove, 90, 826, 58, { under: cl.green });
        kit().sprite('brand-mark', { x: -70, y: -60, w: 140, h: 120 }, (c) => Props.mark(c, 0, 0, 1, 'set'), 2).draw((g.save(), g.translate(1500, 820), g.scale(0.55, 0.55), g));
        g.restore();
    };
})();
