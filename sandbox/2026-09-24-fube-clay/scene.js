// 2026-09-24-fube-clay · style test of the clay style (styles/clay) on the saas-promo invoice
// block (10–16 s of that edit, same beats): POV press on the laptop, then the invoice is
// stamped, folds into a plane and flies into the tax office's mailbox. The client's brand
// (copy, fonts, logo) loads from saas-promo's private/ folder; without it, the placeholder.
const DIR = 'sandbox/2026-09-24-fube-clay/', SP = 'sandbox/2026-09-24-saas-promo/';
Motion.scene({
    fps: 24,
    duration: 6,
    logical: [1600, 900],
    uses: [
        'styles/paper-cutout/paper.js', // only for the placeholder brand's mark
        'styles/clay/clay.js',
        SP + 'segments/brand-default.js', { src: SP + 'private/brand.js', optional: true },
        DIR + 'cast.js',
    ],
    fonts: [
        { family: 'Stack', src: 'fonts/ShortStack-latin.woff2' },
        { family: 'Geist', src: SP + 'private/fonts/geist-latin-500-normal.woff2', descriptors: { weight: '500' }, optional: true },
        { family: 'Geist', src: SP + 'private/fonts/geist-latin-700-normal.woff2', descriptors: { weight: '700' }, optional: true },
        { family: 'Geist Mono', src: SP + 'private/fonts/geist-mono-latin-500-normal.woff2', optional: true },
    ],
    bpm: 120,
    audio: { mix: 'private/audio/mix.wav' }, // saas-promo's mix, 10–16 s (private)
    shots: [[0, 2, 'Issue · POV'], [2, 6, 'Send']],

    draw(g, t, env) {
        const E = Ease, C = Clay, tq = Math.floor(t * 12 + 1e-6) / 12, v = C.boil(t);
        if (t < 2) pov(g, t, tq, v);
        else send(g, t - 2, tq - 2, v);
    },
    post(ctx, t, env) {
        // a warm vignette: the lamp on the table-top set
        const [w, h] = env.px, gr = ctx.createRadialGradient(w * 0.45, h * 0.4, h * 0.3, w * 0.5, h * 0.5, h * 1.0);
        gr.addColorStop(0, 'rgba(0,0,0,0)');
        gr.addColorStop(1, 'rgba(40,20,10,0.28)');
        ctx.fillStyle = gr;
        ctx.fillRect(0, 0, w, h);
    },
});

const E_ = Ease, clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const drawingAt = (t, t0 = 0) => Math.floor((t - t0) * 12 + 1e-6);

// ------------------------------------------------------------------------ 0–2: POV press
const SCR = { x: 222, y: 92, w: 1156, h: 690 };
const BTN = { x: 1150, y: 700, w: 190, h: 56 };
function uiSprite(pressed) {
    return Motion.sprite('pov-ui' + (pressed ? 'p' : ''), { x: SCR.x, y: SCR.y, w: SCR.w, h: SCR.h }, 2, (c) => {
        const cp = BRAND.copy, cl = BRAND.col, P = FC.print, x0 = SCR.x, y0 = SCR.y;
        c.fillStyle = '#fbf8f1';
        c.fillRect(x0, y0, SCR.w, SCR.h);
        c.fillStyle = '#f1ebdf';
        c.fillRect(x0, y0, 230, SCR.h);
        [0, 1, 2, 3, 4].forEach((i) => {
            c.fillStyle = i === 1 ? 'rgba(210,86,63,0.15)' : 'rgba(0,0,0,0)';
            c.fillRect(x0 + 14, y0 + 104 + i * 46, 202, 36);
            c.fillStyle = i === 1 ? cl.brand : '#2a2530';
            c.fillRect(x0 + 34, y0 + 120 + i * 46, [90, 120, 80, 104, 70][i], 5);
        });
        P(c, BRAND.name, x0 + 86, y0 + 56, 26, '#2a2530', { weight: 700 });
        const fx = x0 + 280, fr = x0 + SCR.w - 50;
        P(c, cp.newInvoice, fx, y0 + 72, 40, '#2a2530', { weight: 700 });
        P(c, cp.number, fx, y0 + 100, 17, '#8d8a92', { mono: true });
        const field = (lbl, val, x, y, w) => {
            P(c, lbl, x, y, 15, '#8d8a92');
            c.strokeStyle = 'rgba(42,37,48,0.25)';
            c.lineWidth = 2;
            c.strokeRect(x, y + 10, w, 44);
            P(c, val, x + 14, y + 40, 19, '#2a2530', { weight: 500 });
        };
        field(cp.client, cp.clientName, fx, y0 + 146, 420);
        field(cp.date, cp.dateValue, fx + 450, y0 + 146, 200);
        P(c, cp.item, fx, y0 + 250, 15, '#8d8a92');
        P(c, cp.price, fr, y0 + 250, 15, '#8d8a92', { align: 'right' });
        cp.lines.forEach(([l, a], i) => {
            const y = y0 + 294 + i * 46;
            P(c, l, fx, y, 20, '#2a2530');
            P(c, a, fr, y, 20, '#2a2530', { mono: true, align: 'right' });
            c.fillStyle = 'rgba(42,37,48,0.1)';
            c.fillRect(fx, y + 16, fr - fx, 2);
        });
        P(c, cp.base, fr - 330, y0 + 460, 16, '#8d8a92');
        P(c, cp.baseValue, fr, y0 + 460, 16, '#2a2530', { mono: true, align: 'right' });
        P(c, cp.tax, fr - 330, y0 + 488, 16, '#8d8a92');
        P(c, cp.taxValue, fr, y0 + 488, 16, '#2a2530', { mono: true, align: 'right' });
        P(c, cp.total, fr - 330, y0 + 540, 26, '#2a2530', { weight: 700 });
        P(c, cp.amount, fr, y0 + 540, 34, cl.brand, { weight: 700, mono: true, align: 'right' });
        P(c, cp.notes, fx, y0 + 450, 15, '#8d8a92');
        c.strokeStyle = 'rgba(42,37,48,0.25)';
        c.strokeRect(fx, y0 + 462, 420, 84);
        P(c, cp.payNote, fx + 12, y0 + 490, 14, '#2a2530');
        // the button
        const b = BTN, dy = pressed ? 3 : 0;
        c.fillStyle = pressed ? '#a8412f' : cl.brand;
        c.beginPath();
        c.roundRect(b.x, b.y + dy, b.w, b.h, 14);
        c.fill();
        P(c, cp.issue, b.x + b.w / 2, b.y + 37 + dy, 24, '#fff', { weight: 700, align: 'center' });
    });
}
// the fingertip path, on twos: in from the bottom right, pressing on the beat (1.0)
const TIP = [[1640, 1180], [1560, 1080], [1480, 990], [1410, 920], [1350, 860], [1300, 820], [1268, 794], [1250, 780], [1244, 772], [1242, 768], [1244, 758], [1246, 740], [1246, 734], [1246, 736], [1246, 738], [1248, 740], [1250, 744], [1262, 762], [1290, 800], [1340, 860], [1410, 940], [1500, 1040], [1600, 1150]];
function pov(g, t, tq, v) {
    const C = Clay, F = FC, COL = F.COL;
    g.save();
    const push = 1 + 0.03 * E_.inOut(E_.seg(tq, 0, 2));
    g.translate(800, 450);
    g.scale(push, push);
    g.translate(-800, -450);
    F.wall(g);
    F.shelf(g);
    F.desk(g);
    // the laptop: bezel, screen (the only flat, lit thing), glare, the base with keys
    F.P(g, 'pov-bezel', C.lumpy(C.roundRect(180, 50, 1240, 780, 42), 'bezel', 1.5, 4), COL.dark, { bevel: 16, shine: 0.6, prints: 4, marks: 6, shadowBlur: 18, shadowOffset: [10, 16] });
    const d = drawingAt(t), pressed = tq >= 1.0 && tq < 1.25;
    uiSprite(pressed).draw(g);
    const gl = g.createLinearGradient(SCR.x, SCR.y, SCR.x + SCR.w, SCR.y + SCR.h);
    gl.addColorStop(0, 'rgba(255,255,255,0.12)');
    gl.addColorStop(0.4, 'rgba(255,255,255,0)');
    g.fillStyle = gl;
    g.fillRect(SCR.x, SCR.y, SCR.w, SCR.h);
    F.mark(g, 290, 140, 0.34, 'povmark');
    F.P(g, 'pov-base', C.lumpy(C.roundRect(80, 820, 1440, 160, 30), 'lbase', 2, 4), COL.grey, { bevel: 14, shine: 0.6, prints: 5, marks: 8, shadowOffset: [0, -6] });
    for (let i = 0; i < 13; i++) F.put(g, 150 + i * 100, 860, 1, 0, () => F.P(g, 'pov-key' + (i % 3), C.lumpy(C.roundRect(0, 0, 86, 40, 10), 'key' + (i % 3), 0.6), '#4a4d57', F.small({ bevel: 4 })));
    // sticky notes on the bezel, with handwriting pressed in
    const note = (x, y, rot, col, key) => F.put(g, x, y, 1, rot, () => {
        F.P(g, key, C.lumpy(C.roundRect(-60, -56, 120, 112, 8), key, 1.2), col, { bevel: 7, shine: 0.4, prints: 1 });
        g.save();
        g.strokeStyle = 'rgba(60,40,30,0.55)';
        g.lineWidth = 2.6;
        g.lineCap = 'round';
        for (let i = 0; i < 3; i++) {
            g.beginPath();
            for (let k = 0; k <= 8; k++) g.lineTo(-40 + k * 10, -24 + i * 22 + Math.sin(k * 1.9 + i) * 4);
            g.stroke();
        }
        g.restore();
    });
    note(1392, 150, 0.12, '#f3d36b', 'note-y');
    note(214, 700, -0.1, '#a9dcc4', 'note-m');
    // the press: ticks round the button
    if (tq >= 1.0 && tq < 1.25) {
        const bx = BTN.x + BTN.w / 2, by = BTN.y + BTN.h / 2;
        [[-1.9, 150], [-1.2, 130], [2.6, 150], [1.9, 140], [-2.6, 150]].forEach(([a, r], i) =>
            F.put(g, bx + Math.cos(a) * r, by + Math.sin(a) * r * 0.6, 1, a, () => F.P(g, 'pov-tick', C.capsule([[-14, 0], [14, 0]], 5), COL.coral, F.small({ bevel: 2.5 }))));
    }
    // her finger (right hand, back of the hand: POV)
    if (d < TIP.length) {
        const [tx, ty] = TIP[d], s = 2.1, rot = -0.55;
        const ax = -23 * s, ay = -128 * s, wx = tx - (ax * Math.cos(rot) - ay * Math.sin(rot)), wy = ty - (ax * Math.sin(rot) + ay * Math.cos(rot));
        // the sleeve up to the wrist, from the bottom right
        F.put(g, wx, wy, 1, rot, () => F.P(g, 'pov-sleeve', C.lumpy(C.capsule([[0, 40], [0, 420]], [70, 80]), 'povsl', 2), COL.navy, { bevel: 16, shine: 0.3, marks: 10, prints: 3 }));
        F.hand(g, 'pointBack', 'right', wx, wy, s, rot, v);
    }
    // the invoice pops out of the screen, towards the camera (1.25–2.0)
    if (tq >= 1.25) {
        const u = E_.out(E_.seg(tq, 1.25, 1.92));
        const s = E_.lerp(0.35, 1.5, u), y = E_.lerp(430, 470, u), rot = E_.lerp(0, -0.05, u);
        F.put(g, 800, y, s, rot, () => F.invoice(g, false));
    }
    g.restore();
}

// ------------------------------------------------------------------------ 2–6: send
const LX = 560, LY = 322, INV = [1010, 372], SLOT = [1330, 432];
function planeAt(lt) {
    const u = E_.inOut(E_.seg(lt, 1.5, 2.5));
    const p0 = INV, p1 = [1240, 120], p2 = SLOT;
    const bz = (k) => (1 - u) * (1 - u) * p0[k] + 2 * (1 - u) * u * p1[k] + u * u * p2[k];
    const dx = 2 * (1 - u) * (p1[0] - p0[0]) + 2 * u * (p2[0] - p1[0]), dy = 2 * (1 - u) * (p1[1] - p0[1]) + 2 * u * (p2[1] - p1[1]);
    return { x: bz(0), y: bz(1), rot: Math.atan2(dy, dx) + Math.PI / 2, s: E_.lerp(0.5, 0.22, u) };
}
function title(g, lt, t0, str, t1) {
    if (lt < t0 || (t1 != null && lt >= t1)) return;
    const size = 66, font = `700 ${size}px "${BRAND.font}", sans-serif`;
    const m = document.createElement('canvas').getContext('2d');
    m.font = font;
    let x = 300;
    [...str].forEach((ch, i) => {
        const w = m.measureText(ch).width, a = lt - t0 - i / 24;
        if (ch !== ' ' && a >= 0) {
            const aq = Math.floor(a * 12 + 1e-6) / 12, sc = aq < 1 / 12 ? 0.4 : aq < 2 / 12 ? 1.18 : aq < 3 / 12 ? 0.96 : 1;
            FC.put(g, x + w / 2, 840, sc, 0, () => Clay.text(g, 'ttl', ch, 0, 0, size, BRAND.col.navy, { font: BRAND.font, align: 'center', bevel: size * 0.06, soft: size * 0.03, shadowBlur: size * 0.035, shadowOffset: [2, 5] }));
        }
        x += w;
    });
}
function send(g, lt, tq, v) {
    const C = Clay, F = FC, COL = F.COL;
    const flag = tq < 2.5 ? 0 : Math.min(1.12, E_.back(E_.seg(tq, 2.5, 2.75))), shake = tq >= 2.5 && tq < 2.75 ? (drawingAt(lt, 2.5) % 2 ? 4 : -4) : 0;
    const look = tq < 1.5 ? [0.85, -0.15] : (() => { const p = planeAt(Math.min(tq, 2.5)); return [clamp((p.x - LX) / 500, -1, 1), clamp((p.y - LY) / 400, -1, 1)]; })();
    const blink = tq >= 0.5 && tq < 0.59;
    const mouth = tq >= 2.5 ? 'grin' : tq >= 1.5 ? 'o' : 'smile';
    g.save();
    const push = 1 + 0.025 * E_.inOut(E_.seg(tq, 0, 4));
    g.translate(820, 460);
    g.scale(push, push);
    g.translate(-820, -460);
    F.wall(g);
    F.window_(g, tq + 2);
    F.shelf(g);
    F.clock(g, tq + 2, 880, 150, 0.8);
    F.lauraBody(g, LX, LY, 1, { v });
    F.lauraHead(g, LX, LY, 1, { v, look, blink, mouth, tilt: tq >= 2.5 ? 0.06 : 0.01 });
    F.desk(g);
    F.deskDetails(g);
    F.laptopBack(g);
    F.mug(g, 300, 624);
    F.penCup(g, 1020, 616);
    F.mailbox(g, 1330, 628, 0.9, flag, shake);
    F.lauraArms(g, LX, LY, 1, v);
    F.hand(g, 'rest', 'right', LX - 112, LY + 300, 1.3, 0.25, v);
    F.hand(g, 'rest', 'left', LX + 112, LY + 300, 1.3, -0.25, v);
    // the invoice: floating, stamped on the beat (0.5), folding (1.0–1.25), flying (1.5–2.5)
    const bob = Math.sin(tq * 3) * 4;
    if (tq < 1.0) {
        const sq = tq >= 0.5 && tq < 0.59 ? 0.96 : 1;
        F.put(g, INV[0], INV[1] + bob, 0.52 * sq, -0.04, () => F.invoice(g, tq >= 0.5));
    } else if (tq < 2.5) {
        const d = Math.min(3, 1 + drawingAt(lt, 1.0));
        if (tq < 1.5) F.put(g, INV[0], INV[1] + bob, 0.52, -0.04, () => F.fold(g, d));
        else {
            // the last stretch goes into the slot: clipped at the slot's lip
            const p = planeAt(tq), into = tq >= 2.25;
            g.save();
            if (into) { g.beginPath(); g.rect(0, 0, 1600, SLOT[1] + 6); g.clip(); }
            F.put(g, p.x, p.y, p.s, p.rot, () => F.fold(g, 3));
            g.restore();
        }
    }
    // the stamp comes down by itself on the beat (0.5): the product seals it
    if (tq >= 0.25 && tq < 0.84) {
        const K = [[0.25, [900, -120], -0.3], [0.42, [990, 330], -0.05], [0.5, [1004, 470], 0], [0.59, [1004, 462], 0], [0.67, [990, 380], -0.05], [0.84, [880, -160], -0.3]];
        const k = K.findIndex(([a]) => a > tq), [a0, p0, r0] = K[Math.max(0, k - 1)], [a1, p1, r1] = K[k < 0 ? K.length - 1 : k];
        const u = k < 0 ? 1 : E_.seg(tq, a0, a1);
        F.stamp(g, E_.lerp(p0[0], p1[0], u), E_.lerp(p0[1], p1[1], u), 0.62, E_.lerp(r0, r1, u), v);
        if (tq >= 0.5 && tq < 0.67) [[-1, 0.2], [1, -0.2]].forEach(([sd, a]) => [0, 1, 2].forEach((j) =>
            F.put(g, 1004 + sd * (130 + j * 6), 440 + (j - 1) * 28, 1, a + (j - 1) * 0.3 * sd, () => F.P(g, 'st-tick', C.capsule([[-16, 0], [16, 0]], 5), COL.ink, F.small({ bevel: 2.5 })))));
    }
    // the flag goes up: ticks
    if (tq >= 2.5 && tq < 2.75) [-0.5, 0, 0.5].forEach((a) => F.put(g, 1446 + Math.sin(a) * 60, 440 - Math.cos(a) * 70, 1, a, () => F.P(g, 'mb-tick', C.capsule([[0, -16], [0, 16]], 5), COL.coral, F.small({ bevel: 2.5 }))));
    F.plant(g, 70, 820, 1);
    g.restore();
    title(g, tq, 0.5, BRAND.copy.issued, 2.75);
    title(g, tq, 2.75, BRAND.copy.compliance);
    F.mark(g, 1500, 820, 0.6, 'brmark');
}
