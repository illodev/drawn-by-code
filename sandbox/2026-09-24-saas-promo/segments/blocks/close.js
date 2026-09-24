// Block «close» of the edit (see ../../scene.js EDIT). Defines Shots.close(g, lt, env).
// Back to the medium shot of the office, now tidy and sunny: the paperwork is gone from the
// desk (only the laptop, the pen cup, a squared stack and an empty letter tray), sunlight
// falls through the window in tissue-paper beams with dust in them, the brand cloud floats
// small by the window, and Laura leans back with her coffee.
//   0.0–0.5  she leans back in the chair, mug in hand (a real grip round the handle)
//   1.0–2.0  a sip: the mug comes up, eyes closed; down again at 2.0, a happy smile
//   3.0      (46 s, on the beat) the end card: a cream card slides up folded and unfolds
//            (3.0–3.5); the mark lands at 3.5, BRAND.copy.closeLine at 4.0, the coral
//            BRAND.copy.startFree button at 4.5, includedAll + web at 5.0; then it only
//            breathes until the end (the last frame is the poster).
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
    const q2 = (lt) => drawing(lt) / 12;
    const C = () => Office.COL;

    // ------------------------------------------------------------------ the tidy desk
    // The desk body is Office's own (same pieces and seeds, so the laptop and pen cup, drawn
    // from Office.desk through a clip, sit on it seamlessly); the clutter is left out.
    function sticky(c, w, h, col, seed, rows = 3) {
        cut(c, R(-w / 2, -h / 2, w, h), col, seed, {
            border: 1.2, shadow: 0.22, jag: 0.5, tex: { alpha: [0.2, 0.4] },
            inner: (cc) => {
                cc.fillStyle = D.shade(col, -8);
                cc.globalAlpha = 0.35;
                cc.fillRect(-w / 2, -h / 2, w, h * 0.18);
                cc.globalAlpha = 1;
                if (rows) P.scribble(cc, -w / 2 + 6, -h / 2 + h * 0.36, w - 12, rows, h * 0.19, '#4b3f55', seed + 's', { alpha: 0.6, scale: h / 90, width: 1 });
            },
        });
    }
    function deskBody(c) {
        const COL = C();
        cut(c, [[-60, 626], [1660, 616], [1660, 692], [-60, 696]], COL.woodLight, 'desktop', { border: 2.2, shadow: 0.2, inner: (cc, box) => D.woodGrain(cc, box, COL.woodLight, { seed: 'desktop', angle: -0.006 }) });
        cut(c, [[-60, 960], [-60, 710], [1660, 704], [1660, 960]], '#b8875a', 'apron', { border: 2, shadow: 0.2, inner: (cc, box) => D.woodGrain(cc, box, '#b8875a', { seed: 'apron' }) });
        cut(c, [[1010, 738], [1392, 736], [1394, 846], [1008, 848]], D.shade('#b8875a', 4), 'drawer', { border: 1.8, shadow: 0.28, inner: (cc, box) => D.woodGrain(cc, box, D.shade('#b8875a', 4), { seed: 'drawer' }) });
        cut(c, P.noodle(D.spline([[1150, 796], [1160, 806], [1240, 806], [1250, 796]], 6, false), 9), COL.metal, 'pull', { border: 1.4, shadow: 0.3 });
        cut(c, R(1178, 754, 44, 24), '#c9a54a', 'labelholder', { border: 1.2, shadow: 0.2, inner: (cc) => { cc.fillStyle = '#fbf7ee'; cc.fillRect(1183, 758, 34, 16); P.scribble(cc, 1186, 770, 26, 1, 6, '#4b3f55', 'drawerlbl', { alpha: 0.7, scale: 0.6 }); } });
        cut(c, [[-60, 690], [1660, 684], [1660, 712], [-60, 716]], COL.woodDark, 'deskedge', { border: 2, shadow: 0.3, inner: (cc, box) => D.woodGrain(cc, box, COL.woodDark, { seed: 'deskedge' }) });
        for (const [a, b] of [[-60, 1006], [1398, 1660]]) (P.markerStroke(c, [[a, 832], [b, 830]], D.shade('#b8875a', -16), 2.2, 'seam' + a, 0.7), P.markerStroke(c, [[a, 835], [b, 833]], D.shade('#b8875a', 10), 1.2, 'seamL' + a, 0.6));
        const cable = D.spline([[792, 680], [806, 690], [814, 712], [812, 760], [826, 820], [846, 870], [850, 960]], 8, false);
        P.markerStroke(c, cable.map(([x, y]) => [x + 1.5, y + 2.5]), 'rgba(40,20,30,0.25)', 5, 'cableS', 0.8);
        P.markerStroke(c, cable, '#ece8df', 4.2, 'cable', 0.95);
        local(c, 764, 726, 0.07, (cc) => {
            sticky(cc, 52, 50, '#f2a38f', 'edgesticky', 3);
            cut(cc, [[26, 12], [26, 25], [12, 25]], D.shade('#f2a38f', -10), 'edgecurl', { border: 0.8, shadow: 0.25 });
        });
    }
    function tidyItems(c) {
        const COL = C();
        // one squared stack at the left: kraft folder, green folder, sheets, a binder clip
        const layers = [[140, 684, 150, 12, COL.kraft], [140, 672, 150, 10, COL.green], [141, 662, 148, 5, '#fbfaf5'], [141, 657, 148, 5, '#f3eee2'], [141, 652, 148, 5, '#fbfaf5']];
        for (const [i, [x, y, w, h, col]] of layers.entries()) cut(c, [[x, y], [x + w, y - 0.5], [x + w, y - h], [x, y - h + 0.3]], col, 'tidyply' + i, { border: 1.1, shadow: 0.2, tex: { alpha: [0.15, 0.3] } });
        cut(c, [[141, 647], [289, 646], [296, 638], [150, 639]], '#fbfaf5', 'tidytop', { border: 1, shadow: 0.15, tex: { alpha: [0.1, 0.2] }, inner: (cc) => { cc.fillStyle = 'rgba(60,50,70,0.3)'; for (let k = 0; k < 3; k++) cc.fillRect(168 + k * 3, 644 - k * 2.2, 96 - k * 14, 1.1); } });
        cut(c, R(200, 640, 26, 14), '#2e2a33', 'tidyclip', { border: 1.2, shadow: 0.25 });
        for (const dx of [204, 220]) P.markerStroke(c, [[dx, 642], [dx + 2, 624], [dx - 2 + (dx - 212) * 0.3, 622]], '#b9bcc4', 1.6, 'tidyclipw' + dx, 0.95);
        // the letter tray, empty (inbox zero)
        for (let x = 1106; x < 1224; x += 12) P.markerStroke(c, [[x, 650], [x + 0.5, 680]], COL.metal, 2.6, 'ttrayw' + x, 0.95);
        cut(c, R(1098, 644, 130, 8), COL.metal, 'ttraytop', { border: 1.4, shadow: 0.25 });
        cut(c, R(1098, 678, 130, 9), COL.metal, 'ttraybottom', { border: 1.4, shadow: 0.3 });
        // a small succulent in a terracotta pot
        cut(c, D.cspline([[1296, 684], [1290, 646], [1346, 646], [1340, 684]], 4), COL.terracotta, 'tpot', { border: 1.8, shadow: 0.28, tex: { alpha: [0.25, 0.45] } });
        cut(c, R(1286, 640, 64, 10), D.shade(COL.terracotta, 8), 'tpotrim', { border: 1.4, shadow: 0.2 });
        for (let k = 0; k < 7; k++) {
            const a = -Math.PI / 2 + (k - 3) * 0.38, l = 24 + (k % 2) * 8;
            cut(c, D.taper([[1318, 644], [1318 + Math.cos(a) * l * 0.5, 644 + Math.sin(a) * l * 0.5], [1318 + Math.cos(a) * l, 644 + Math.sin(a) * l]], [7, 12, 3], 6), k % 2 ? COL.sage : D.shade(COL.sage, -12), 'tsuc' + k, { border: 1.2, shadow: 0.2 });
        }
        // two books lying flat at the right, squared
        for (const [i, [y, h, col]] of [[686, 16, COL.navy], [670, 14, COL.coral]].entries()) {
            cut(c, R(1450, y - h, 124 - i * 8, h), col, 'tfb' + i, {
                border: 1.6, shadow: 0.2, tex: { alpha: [0.25, 0.5] },
                inner: (cc) => {
                    cc.fillStyle = D.shade(col, -14);
                    cc.fillRect(1456, y - h, 3, h);
                    cc.fillStyle = D.shade(col, 16);
                    cc.fillRect(1490, y - h * 0.62, 40, h * 0.24);
                },
            });
        }
    }
    function desk(g, t) {
        sprite('close-desk', { x: -60, y: 440, w: 1720, h: 520 }, (c) => {
            deskBody(c);
            tidyItems(c);
        }, 1.2).draw(g);
        // the laptop and the pen cup, straight from the office set
        g.save();
        g.beginPath();
        g.rect(598, 490, 214, 197);
        g.rect(828, 520, 75, 167);
        g.clip();
        Office.desk(g, t);
        g.restore();
    }

    // ------------------------------------------------------------------ sunlight
    // Beams of translucent tissue from the window pane down across the room (flat, no
    // gradient), with dust specks drifting in them.
    const DIR = [0.74, 0.67];
    const BEAMS = [[[92, 110], [206, 110], 1020, 0.16], [[214, 110], [300, 118], 1060, 0.12], [[96, 300], [206, 290], 760, 0.1]];
    function sun(g, t, alpha = 1) {
        sprite('close-beams', { x: 0, y: 60, w: 1600, h: 900 }, (c) => {
            BEAMS.forEach(([a, b, L, al], i) => {
                c.globalAlpha = al;
                flat(c, [a, b, [b[0] + DIR[0] * L, b[1] + DIR[1] * L], [a[0] + DIR[0] * L * 0.94, a[1] + DIR[1] * L * 0.94]], '#fff1bd', 'beam' + i, { jag: 1.2, tex: { alpha: [0.1, 0.2] } });
            });
            c.globalAlpha = 1;
        }, 0.6).draw((g.save(), (g.globalAlpha = alpha), g));
        g.restore();
        // dust: fixed specks drifting slowly along the beam, on twos
        const tq = q2(t), r = P.rng('dust');
        for (let i = 0; i < 14; i++) {
            const u0 = r(), side = r(), sp = 0.03 + r() * 0.03, u = (u0 + tq * sp) % 1;
            const x = 110 + side * 150 + DIR[0] * u * 700 + Math.sin(tq * 1.3 + i) * 6, y = 130 + DIR[1] * u * 700 + Math.cos(tq + i * 2) * 5;
            g.save();
            g.globalAlpha = alpha * 0.8 * Math.sin(Math.PI * u);
            sprite('close-dust' + (i % 3), { x: -5, y: -5, w: 10, h: 10 }, (c) => flat(c, ell(0, 0, 2 + (i % 3) * 0.6, 2 + (i % 3) * 0.6, 12), '#fffbe6', 'dust' + (i % 3), { tex: false }), 3).draw((g.translate(x, y), g));
            g.restore();
        }
    }

    // ------------------------------------------------------------------ Laura and her mug
    const LX = 470, LY = 660, LS = 0.92;
    // the mug in its own frame: the handle's grip bar on the y axis at x = 0, the body to +x
    const MUG = { w: 72, h: 86 };
    function mugSprite() {
        const COL = C(), { w, h } = MUG;
        return sprite('close-mug', { x: -30, y: -h / 2 - 16, w: w + 60, h: h + 36 }, (c) => {
            const x0 = 16, top = -h / 2;
            cut(c, P.noodle(D.spline([[x0 + 4, top + 14], [-6, top + 14], [-10, 0], [-6, -top - 18], [x0 + 4, -top - 20]], 8, false), 12), '#f6efe2', 'close-mughandle', { border: 2.2, shadow: 0.25 });
            cut(c, D.cspline([[x0, top], [x0 + 2, h / 2 - 10], [x0 + 10, h / 2], [x0 + w - 10, h / 2], [x0 + w - 2, h / 2 - 10], [x0 + w, top]], 5), '#f6efe2', 'close-mugbody', {
                border: 2.4, shadow: 0.28, tex: { alpha: [0.15, 0.3] },
                inner: (cc) => {
                    cc.fillStyle = COL.coral;
                    cc.fillRect(x0 - 4, top + 24, w + 8, 10);
                    cc.fillStyle = COL.navy;
                    cc.fillRect(x0 - 4, top + 38, w + 8, 3.5);
                    P.markerStroke(cc, [[x0 + 22, top + 60], [x0 + 30, top + 55], [x0 + 38, top + 61], [x0 + 46, top + 55]], COL.green, 2.4, 'close-mugdoodle', 0.8);
                    cc.fillStyle = 'rgba(255,255,255,0.45)';
                    cc.fillRect(x0 + w - 16, top + 8, 5, h - 22);
                },
            });
            cut(c, ell(x0 + w / 2, top, w / 2, 6.5, 36), D.shade('#f6efe2', -6), 'close-mugrim', { border: 1.4, shadow: 0.1 });
            flat(c, ell(x0 + w / 2, top + 1.5, w / 2 - 6, 4, 32), '#5a3a2a', 'close-coffee', { tex: { alpha: [0.2, 0.4] } });
        }, 1.8);
    }
    // arm keyframes (Laura units): [time, elbow, wrist, hand rotation extra]
    const HOLD = [[0, [-214, -120], [-120, -150], 0], [1.0, [-214, -120], [-120, -150], 0], [1.33, [-232, -262], [-104, -372], 0.62], [1.92, [-232, -262], [-104, -372], 0.62], [2.25, [-214, -120], [-120, -150], 0]];
    function holdAt(t) {
        const k = HOLD.findIndex(([at]) => at > t);
        if (k < 0) return HOLD[HOLD.length - 1];
        if (k === 0) return HOLD[0];
        const [a0, e0, w0, r0] = HOLD[k - 1], [a1, e1, w1, r1] = HOLD[k], u = E.inOut(E.seg(t, a0, a1));
        return [t, [E.lerp(e0[0], e1[0], u), E.lerp(e0[1], e1[1], u)], [E.lerp(w0[0], w1[0], u), E.lerp(w0[1], w1[1], u)], E.lerp(r0, r1, u)];
    }
    function laura(g, t, layer) {
        const tq = q2(t), lean = E.inOut(E.seg(tq, 0, 0.5));
        const sip = tq >= 1.17 && tq < 2.0;
        const eyes = sip ? 'closed' : tq >= 2.1 && tq < 2.9 ? 'happy' : (tq >= 4.2 && tq < 4.3) || (tq >= 0.6 && tq < 0.7) ? 'closed' : 'open';
        const [, el, wr, rx] = holdAt(tq);
        const arms = [[[-118, -250], el, wr], Laura.ARMS.desk[1]];
        g.save();
        // leaning back: a touch smaller and lower, pivoting on the seat
        g.translate(LX, LY);
        g.scale(1 - 0.03 * lean, 1 - 0.045 * lean);
        g.translate(-LX, -LY);
        if (layer === 'body') Laura.draw(g, LX, LY, LS, { t, eyes, look: [0.2, 0.1], mouth: tq >= 2.1 ? 'grin' : 'smile', tilt: -0.02 - 0.05 * lean + (sip ? 0.03 : 0), layer: 'body' });
        else {
            Laura.draw(g, LX, LY, LS, { t, arms, hands: [null, 'rest'], layer: 'arms' });
            // her hand round the mug handle: palm, the mug, then the curled fingers and thumb
            g.save();
            g.translate(LX, LY + Math.sin((drawing(t) / 12) * 2.4) * 1.5);
            g.scale(LS, LS);
            const rot = Math.atan2(wr[1] - el[1], wr[0] - el[0]) + Math.PI / 2 + 0.26 + rx, HS = 60;
            const [ax, ay] = D.handAnchor('grip'), k = HS / 60;
            const mx = wr[0] + ax * k * Math.cos(rot) - ay * k * Math.sin(rot), my = wr[1] + ax * k * Math.sin(rot) + ay * k * Math.cos(rot);
            D.hand(g, wr[0], wr[1], HS, rot, 'grip', { skin: Laura.COL.skin, cuff: Laura.COL.shirt, part: 'back' });
            g.save();
            g.translate(mx, my);
            g.rotate(rot - Math.PI / 2);
            mugSprite().draw(g);
            g.restore();
            D.hand(g, wr[0], wr[1], HS, rot, 'grip', { skin: Laura.COL.skin, part: 'front' });
            // steam from the mug (not while she sips)
            if (!sip) {
                const kit = Props.kit, top = -MUG.h / 2;
                g.save();
                g.translate(mx, my);
                g.rotate(rot - Math.PI / 2);
                for (let i = 0; i < 2; i++) {
                    const life = 2.4, age = tq + 0.9 * i + 5, cyc = Math.floor(age / life), f = (age % life) / life;
                    const wsp = kit.wisp(`close${i}-${cyc % 3}`, { len: 110, width: 9, drift: 1, color: '#fffdf6' });
                    g.save();
                    g.globalAlpha = E.seg(f, 0, 0.15) * (1 - E.seg(f, 0.5, 1)) * 0.9;
                    g.translate(16 + MUG.w * (0.4 + i * 0.2) + f * 20, top - 4 - E.out(f) * 70);
                    g.rotate(0.05 + f * 0.1);
                    g.scale(1 + f * 0.4, 1 + f * 0.2);
                    wsp.draw(g);
                    g.restore();
                }
                g.restore();
            }
            g.restore();
        }
        g.restore();
    }

    // ------------------------------------------------------------------ the brand cloud
    function cloud(g, t) {
        const d = drawing(t), bob = Math.sin(d * 0.22) * 6, sway = Math.sin(d * 0.15 + 1) * 0.04;
        sprite('close-cloud', { x: -70, y: -60, w: 140, h: 120 }, (c) => Props.mark(c, 0, 0, 1, 'closecloud'), 1.4)
            .draw((g.save(), g.translate(262, 196 + bob), g.rotate(sway), g.scale(0.5, 0.5), g));
        g.restore();
    }

    // ------------------------------------------------------------------ the end card
    const CARD = { x: 800, y: 440, w: 1040, h: 640 };
    function cardSprite() {
        const { w, h } = CARD, bc = BRAND.col;
        return sprite('close-card', { x: -w / 2 - 16, y: -h / 2 - 16, w: w + 32, h: h + 32 }, (c) => {
            cut(c, [[-w / 2, -h / 2], [w / 2, -h / 2 + 3], [w / 2 + 2, h / 2], [-w / 2 + 2, h / 2 - 2]], bc.cream, 'close-card', {
                border: 3, shadow: 0.3, jag: 0.6, tex: { alpha: [0.12, 0.26] },
                inner: (cc) => {
                    // a printed hairline frame, inset, with little corner flourishes
                    cc.strokeStyle = D.shade(bc.cream, -22);
                    cc.lineWidth = 2;
                    cc.globalAlpha = 0.8;
                    cc.strokeRect(-w / 2 + 26, -h / 2 + 26, w - 52, h - 52);
                    cc.globalAlpha = 1;
                    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
                        cc.fillStyle = bc.brand;
                        cc.beginPath();
                        cc.arc(sx * (w / 2 - 26), sy * (h / 2 - 26), 5, 0, 7);
                        cc.fill();
                    }
                },
            });
        }, 1.4);
    }
    function cardBack() {
        const { w, h } = CARD;
        return sprite('close-cardback', { x: -w / 2 - 16, y: -h / 4 - 16, w: w + 32, h: h / 2 + 32 }, (c) => {
            cut(c, R(-w / 2, -h / 4, w, h / 2), '#e9dcc0', 'close-cardback', { border: 3, shadow: 0.3, jag: 0.6, tex: { alpha: [0.18, 0.34] } });
        }, 1.2);
    }
    function button(g, lt) {
        const bc = BRAND.col, text = BRAND.copy.startFree;
        const sp = sprite('close-btn' + text, { x: -200, y: -58, w: 400, h: 116 }, (c) => {
            cut(c, P.roundRect(-176, -44, 352, 88, 22), D.shade(bc.brand, -16), 'close-btnshadow', { border: 0, shadow: 0, tex: false });
            cut(c, P.roundRect(-180, -52, 360, 88, 22), bc.brand, 'close-btn', { border: 2.8, shadow: 0.25, tex: { alpha: [0.25, 0.5] } });
            c.font = `700 42px "${BRAND.font}"`;
            const size = 42 * Math.min(1, 300 / c.measureText(text).width);
            Props.print(c, text, 0, -8 + size * 0.36, size, '#ffffff', { weight: 700, align: 'center', alpha: 1 });
        }, 1.6);
        // drops in on the beat, presses once, then breathes
        const u = E.seg(q2(lt), 4.5, 4.75), s = u < 1 ? E.lerp(1.25, 1, E.back(u)) : 1 + 0.012 * Math.sin(drawing(lt) * 0.3);
        g.save();
        g.translate(0, 168 + (u < 1 ? (1 - u) * -16 : 0));
        g.scale(s, s);
        sp.draw(g);
        g.restore();
    }
    function card(g, lt) {
        const { x, y, w, h } = CARD, bc = BRAND.col, tq = q2(lt), d = drawing(lt);
        // the room dims behind the card (flat dark tissue, in steps)
        g.fillStyle = `rgba(40,30,45,${0.34 * E.seg(tq, 3.0, 3.25)})`;
        g.fillRect(-60, -60, 1720, 1020);
        const breath = lt >= 5.0 ? 1 + 0.004 * Math.sin((d - 60) * 0.26) : 1;
        g.save();
        g.translate(x, y + E.lerp(640, 0, E.out(E.seg(tq, 3.0, 3.25))) + (lt >= 5 ? Math.sin((d - 60) * 0.2) * 1.5 : 0));
        g.scale(breath, breath);
        const cs = cardSprite(), cw = cs.canvas.width, ch = cs.canvas.height, pad = 16;
        // the unfold: the bottom half is flat; the top flap swings up round the crease
        const k = tq < 3.25 ? 0 : Math.min(3, Math.floor((tq - 3.25) * 12) + 1);
        const bottom = { x: 0, y: ch / 2, w: cw, h: ch / 2 }, top = { x: 0, y: 0, w: cw, h: ch / 2 };
        const hw = w / 2 + pad, hh = h / 2 + pad;
        Motion.quad(g, cs.canvas, [[-hw, 0], [hw, 0], [hw, hh], [-hw, hh]], 2, bottom);
        const FLAP = [-1, -0.45, 0.4, 1][k], spread = [0, 0.05, 0.05, 0][k];
        if (FLAP < 0) {
            // still folded down: the flap's back (plain kraft cream) over the bottom half
            const fy = -FLAP * hh;
            const bk = cardBack();
            Motion.quad(g, bk.canvas, [[-hw * (1 + spread), fy], [hw * (1 + spread), fy], [hw, 0], [-hw, 0]], 2);
        } else {
            const fy = -FLAP * hh;
            Motion.quad(g, cs.canvas, [[-hw * (1 + spread), fy], [hw * (1 + spread), fy], [hw, 0], [-hw, 0]], 4, top);
        }
        if (k === 3) {
            // the crease across the middle, and the content on the beats
            D.crease(g, [-w / 2 + 6, 0], [w / 2 - 6, 1]);
            const mu = E.seg(tq, 3.5, 3.75);
            if (mu > 0) {
                const ms = E.back(mu) * 2.1, bob = lt >= 5 ? Math.sin((d - 60) * 0.18) * 2 : 0;
                sprite('close-bigmark', { x: -70, y: -60, w: 140, h: 120 }, (c) => Props.mark(c, 0, 0, 1, 'closebig'), 3.2).draw((g.save(), g.translate(0, -156 + bob), g.scale(ms, ms), g));
                g.restore();
            }
            // two strips of tape slapped on the top corners with the mark
            if (lt >= 3.5) for (const sd of [-1, 1]) {
                sprite('close-tape' + sd, { x: -70, y: -26, w: 140, h: 52 }, (c) => {
                    c.globalAlpha = 0.78;
                    flat(c, [[-58, -15], [58, -17], [60, 15], [-57, 16]], '#e9dcaa', 'close-tape' + sd, { jag: 1.1, tex: { alpha: [0.12, 0.28] } });
                }, 1.4).draw((g.save(), g.translate(sd * (w / 2 - 22), -h / 2 + 8), g.rotate(sd * 0.62), g));
                g.restore();
            }
            // the line, fitted to the card (the real copy is longer)
            const line = BRAND.copy.closeLine;
            g.font = `700 70px "${BRAND.font}"`;
            const size = 70 * Math.min(1, (w - 150) / g.measureText(line).width);
            Shots.title(g, lt, 4.0, line, 0, 66, size, { align: 'center' });
            if (lt >= 4.5) button(g, lt);
            if (lt >= 5.0) {
                const u = E.seg(tq, 5.0, 5.25);
                g.save();
                g.globalAlpha = u;
                const small = BRAND.copy.includedAll;
                g.font = `500 26px "${BRAND.font}"`;
                const ssz = 26 * Math.min(1, (w - 200) / g.measureText(small).width), sw = (g.font = `500 ${ssz}px "${BRAND.font}"`, g.measureText(small).width);
                Props.print(g, small, 18, 250, ssz, bc.ink, { align: 'center' });
                P.markerStroke(g, [[-sw / 2 - 14, 242], [-sw / 2 - 6, 250], [-sw / 2 + 8, 232]], bc.green, 4, 'close-incl', 0.9);
                Props.print(g, BRAND.copy.web, 0, 288, 26, bc.navy, { align: 'center', weight: 700, mono: true });
                g.restore();
            }
        }
        g.restore();
    }

    Shots.close = (g, lt, env) => {
        const push = 1 + 0.03 * E.inOut(E.seg(lt, 0, 3.5));
        g.save();
        g.translate(560, 420);
        g.scale(push, push);
        g.translate(-560, -420);
        Office.back(g, lt, { page: 3 });
        cloud(g, lt);
        laura(g, lt, 'body');
        desk(g, lt);
        laura(g, lt, 'arms');
        sun(g, lt);
        // the floor plant at the left edge (the office's front layer, without the clutter)
        g.save();
        g.beginPath();
        g.rect(-80, 300, 330, 700);
        g.clip();
        Office.front(g, lt);
        g.restore();
        g.restore();
        if (lt >= 3.0) card(g, lt);
    };
})();
