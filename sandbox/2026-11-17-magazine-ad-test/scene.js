// 2026-11-17-magazine-ad-test · style magazine-ad
// «Fresh!»: a 1950s magazine ad prints itself, wakes up, sells a loaf, and the cat gets the
// first bite (brief.md, Script). The two panels are ref/C-a.png and ref/C-b.png, separated
// into their three inks by tools/separate.py (sep/C-*.js). Joe and the cat are held as
// printed (round 3: pieces of a drawing moved on pivots read as a puppet); what moves is the
// press, the camera, the type, the graphics cut from the page (starbursts, «Fresh!») and
// objects drawn in code (steam, stars, labels, the loaf, paw prints). Everything is drawn in the
// references' pixels (1280 × 720) through a camera; the press prints the plates, its dots
// growing as the camera moves in on the page. Animation runs on twos: time is the drawing's.
const REF = [1280, 720];

// ---- the separations
function fillRings(g, rings, a) {
    g.fillStyle = Ad.tone(a);
    g.beginPath();
    for (const r of rings) {
        g.moveTo(r[0][0], r[0][1]);
        for (let i = 1; i < r.length; i++) g.lineTo(r[i][0], r[i][1]);
        g.closePath();
    }
    g.fill('evenodd');
}
// plates: { ink: { solid, bands } }; inks: which plates have printed yet (the press run)
function drawPlates(press, plates, inks) {
    for (const ink of Ad.ORDER) {
        if (inks && !inks.includes(ink)) continue;
        const P = plates[ink];
        if (!P) continue;
        if (P.solid.length) fillRings(press.plate(ink), P.solid, 1);
        const sc = press.plate(ink, 'screen');
        for (const [a, rings] of P.bands) fillRings(sc, rings, a);
    }
}
// a piece of a panel (a graphic printed on it: a starburst, the lettering), moved about its
// pivot: { dx, dy, rot, sx, sy, hide, clip }
function drawPart(press, part, m = {}, inks) {
    if (m.hide) return;
    const [px, py] = part.pivot;
    press.save();
    press.each((p) => {
        p.translate(px + (m.dx ?? 0), py + (m.dy ?? 0));
        p.rotate(m.rot ?? 0);
        p.scale(m.sx ?? m.s ?? 1, m.sy ?? m.s ?? 1);
        p.translate(-px, -py);
    });
    // opaque: what lies under the piece does not print through it
    if (part.poly) press.knockout((g) => { g.beginPath(); part.poly.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); });
    if (m.clip) press.clip(m.clip);
    drawPlates(press, part.plates, inks);
    press.restore();
}
// a panel: its background, then its pieces (moves: { piece: {…} })
function drawPanel(press, name, moves = {}, inks) {
    const S = SEP[name];
    drawPlates(press, S.plates, inks);
    for (const [k, part] of Object.entries(S.parts)) drawPart(press, part, moves[k], inks);
}

// ---- the camera: (cx, cy) in reference pixels at the centre of the frame, z = 1 shows the
// whole panel; it never shows past the panel's edges
function camera(press, cx, cy, z) {
    const hw = REF[0] / 2 / z, hh = REF[1] / 2 / z;
    cx = Math.min(REF[0] - hw, Math.max(hw, cx));
    cy = Math.min(REF[1] - hh, Math.max(hh, cy));
    press.each((p) => {
        p.translate(800, 450);
        p.scale(1.25 * z, 1.25 * z);
        p.translate(-cx, -cy);
    });
    // where the page's origin lands on the frame (logical units): the screen hangs from it
    CAM.origin = [800 - 1.25 * z * cx, 450 - 1.25 * z * cy];
    CAM.zoom = z;
}
const CAM = { origin: [0, 0], zoom: 1 };
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const inOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const outBack = (x) => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2);
const lerp = (a, b, x) => a + (b - a) * x;
const tri = (x) => 1 - Math.abs(((x % 1) + 1) % 1 * 2 - 1);
// a hop: 0 → up → 0 over dur after `at`
const hop = (t, at, dur) => (t < at || t > at + dur ? 0 : Math.sin(((t - at) / dur) * Math.PI));

// ---- live pieces drawn in code
// steam: wisps of paper rising inside the oven's mouth (clip), a light orange haze in them
function steam(press, t, clipPoly, x0s, base, rise, amt = 1) {
    press.save();
    press.clip((g) => { g.moveTo(clipPoly[0][0], clipPoly[0][1]); for (const [x, y] of clipPoly.slice(1)) g.lineTo(x, y); g.closePath(); });
    press.knockout((g) => {
        x0s.forEach((x0, k) => {
            for (let c = 0; c < 2; c++) {
                const ph = ((t * 0.55 + k * 0.37 + c * 0.5) % 1), y0 = base - ph * rise, a = Math.sin(ph * Math.PI) * amt;
                if (a < 0.08) continue;
                const pts = [];
                for (let i = 0; i <= 7; i++) pts.push([x0 + Math.sin(i * 0.9 + t * 2.1 + k * 2 + c) * (8 + i * 2.2), y0 - i * 17]);
                g.globalAlpha = a;
                Ad.brush(g, pts, 7 + 4 * a, 'st' + k + c, { taper: [0.3, 0.6], wobble: 0.35 });
            }
        });
    });
    press.restore();
}
// a loaf drawn in code (the end card): a dome of orange, a black screen on its shadow side,
// three paper score marks and a brush outline; bite: 0..1 knocks a bite out of its right end
function loaf(press, x, y, w, h, rot, seed, bite = 0) {
    if (w < 1 || h < 1) return;
    const O = press.plate('orange'), KS = press.plate('black', 'screen'), K = press.plate('black'), OS = press.plate('orange', 'screen');
    const shape = (g) => { g.beginPath(); g.moveTo(-w, h * 0.35); g.bezierCurveTo(-w * 1.05, -h * 0.55, -w * 0.4, -h, 0, -h); g.bezierCurveTo(w * 0.45, -h, w * 1.05, -h * 0.5, w, h * 0.3); g.quadraticCurveTo(0, h * 0.62, -w, h * 0.35); g.closePath(); };
    press.save();
    press.each((p) => { p.translate(x, y); p.rotate(rot); });
    press.knockout((g) => { shape(g); g.fill(); });
    O.fillStyle = Ad.tone(1); shape(O); O.fill();
    KS.fillStyle = Ad.tone(0.55); KS.beginPath(); KS.ellipse(w * 0.15, h * 0.12, w * 0.95, h * 0.5, 0, 0, Math.PI); KS.fill();
    OS.fillStyle = Ad.tone(0.5); OS.beginPath(); OS.ellipse(-w * 0.2, -h * 0.55, w * 0.5, h * 0.22, -0.1, 0, Math.PI * 2); OS.fill();
    press.knockout((g) => {
        for (let k = -1; k <= 1; k++) Ad.brush(g, [[k * w * 0.48 - w * 0.12, -h * 0.25], [k * w * 0.48 + w * 0.02, -h * 0.62], [k * w * 0.48 + w * 0.16, -h * 0.82]], h * 0.11, seed + 'sc' + k, { taper: [0.35, 0.4] });
    });
    Ad.brush(K, [[-w, h * 0.35], [-w * 0.95, -h * 0.4], [-w * 0.45, -h * 0.95], [0, -h], [w * 0.5, -h * 0.92], [w * 0.95, -h * 0.35], [w, h * 0.3]], h * 0.07, seed + 'o', { taper: [0.1, 0.1] });
    Ad.brush(K, [[-w, h * 0.35], [-w * 0.4, h * 0.52], [w * 0.3, h * 0.5], [w, h * 0.3]], h * 0.1, seed + 'b', { taper: [0.1, 0.1] });
    if (bite > 0) press.knockout((g) => { const r = h * 0.32 * bite; for (const [bx, by] of [[w * 0.92, -h * 0.25], [w * 0.98, h * 0.12], [w * 0.75, -h * 0.55]]) { g.beginPath(); g.arc(bx, by, r, 0, 7); g.fill(); } });
    press.restore();
}
// a starburst badge: a filled star of n points, a brush outline, and its words
function badge(press, x, y, r, s, ink, lines) {
    if (s <= 0.01) return;
    const P = press.plate(ink), K = press.plate('black'), n = 18;
    press.save();
    press.each((p) => { p.translate(x, y); p.scale(s, s); p.rotate(-0.12); });
    const pts = [];
    for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2, rr = i % 2 ? r * 0.8 : r; pts.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
    press.knockout((g) => { g.beginPath(); pts.forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.closePath(); g.fill(); });
    P.fillStyle = Ad.tone(1); P.beginPath(); pts.forEach(([a, b], i) => (i ? P.lineTo(a, b) : P.moveTo(a, b))); P.closePath(); P.fill();
    Ad.brush(K, [...pts, pts[0]], r * 0.04, 'bdg' + x, { taper: [0, 0], wobble: 0.2, step: 4 });
    K.fillStyle = Ad.tone(1);
    for (const l of lines) {
        K.font = l.font; K.textAlign = 'center'; K.textBaseline = 'middle';
        K.fillText(l.text, l.x ?? 0, l.y ?? 0);
    }
    press.restore();
}

// ---- shots (times in seconds; t is the drawing's time, on twos)
const SHOTS = [[0, 3, '1 · Press run'], [3, 6, '2 · The page wakes'], [6, 9, '3 · The sleeping town'], [9, 13, '4 · Joe at the oven'],
    [13, 16, '5 · Golden crust'], [16, 19, '6 · Somebody\'s watching'], [19, 23, '7 · Ten cents'], [23, 28, '8 · Early Bird'], [28, 30, '9 · Lift-off']];
const ALL = ['orange', 'turquoise', 'black'];
const OVEN_A = [[1030, 420], [1030, 280], [1060, 200], [1140, 140], [1280, 125], [1280, 420]];
const OVEN_B = [[1010, 470], [1010, 260], [1040, 205], [1120, 190], [1255, 200], [1255, 470]];

// the starbursts' life on the page: a slow turn and a twinkle on the offbeats
function sparkle(t, k) {
    const off = Math.floor(t * 2 - 0.5 + k * 0.5);
    const tw = hop(t, off / 2 + 0.25, 0.25);
    return { rot: Math.sin(t * 0.9 + k) * 0.12 + t * 0.15 * (k % 2 ? -1 : 1), s: 1 + 0.18 * tw };
}

// C-a as the page sits: Joe and the cat held as printed; the graphics live (sparkles), the
// fire breathes and steam rises
const OVEN_A_GLOW = [[1035, 420], [1035, 285], [1065, 205], [1140, 150], [1280, 132], [1280, 330], [1150, 312], [1035, 335]];
function pageA(press, t, extra = {}, inks) {
    const moves = { sb_tl: sparkle(t, 0), sb_or: sparkle(t, 1), sb_mid: sparkle(t, 2), sb_tr: sparkle(t, 3), ...extra };
    drawPanel(press, 'C-a', moves, inks);
    if (!inks || inks.includes('orange')) { ovenGlow(press, t, OVEN_A_GLOW); steam(press, t, OVEN_A, [1110, 1195], 330, 70, extra.steamAmt ?? 1); }
}
function nightWindows(press, darkened) {
    // lit windows across the street (C-a): [x, y, w, h]; each goes dark on its cue
    const W = [[95, 348, 8, 19], [282, 329, 9, 24], [213, 312, 15, 28]];
    const QS = press.plate('turquoise', 'screen'), KS = press.plate('black', 'screen');
    W.forEach(([x, y, w, h], i) => {
        if (!darkened[i]) return;
        QS.fillStyle = Ad.tone(0.95); QS.fillRect(x - 1, y - 1, w + 2, h + 2);
        KS.fillStyle = Ad.tone(0.8); KS.fillRect(x - 1, y - 1, w + 2, h + 2);
    });
}
function lampFlicker(press, off) {
    if (!off) return;
    const QS = press.plate('turquoise', 'screen'), KS = press.plate('black', 'screen');
    QS.fillStyle = Ad.tone(0.7); QS.beginPath(); QS.ellipse(163, 262, 24, 22, 0, 0, 7); QS.fill();
    KS.fillStyle = Ad.tone(0.45); KS.beginPath(); KS.ellipse(163, 262, 24, 22, 0, 0, 7); KS.fill();
}
// stars come out over the rooftops (C-a's window sky, measured on a 10 px zoom): paper
// sparkles knocked out of the night, one per half beat from `from`, each twinkling
const SKY = [[232, 212], [118, 218], [282, 222], [190, 214], [312, 248], [250, 226], [130, 262], [296, 262]];
function skyStars(press, t, from) {
    press.knockout((g) => {
        SKY.forEach(([x, y], i) => {
            const at = from + i * 0.5;
            if (t < at) return;
            const s = (2.6 + (i % 3)) * (1 + 0.45 * hop(t, at, 0.25) + 0.2 * hop(t, Math.floor(t * 2) / 2 + 0.25 * (i % 2), 0.25));
            Ad.brush(g, [[x - s * 1.6, y], [x, y], [x + s * 1.6, y]], s * 0.55, 'sx' + i, { taper: [0.5, 0.5] });
            Ad.brush(g, [[x, y - s * 1.6], [x, y], [x, y + s * 1.6]], s * 0.55, 'sy' + i, { taper: [0.5, 0.5] });
        });
    });
}
// the fire breathes: an orange screen over the oven's mouth, swelling and easing
function ovenGlow(press, t, poly) {
    const OS = press.plate('orange', 'screen');
    OS.fillStyle = Ad.tone(0.14 + 0.12 * Math.sin(t * 5.3) * Math.sin(t * 2.1 + 1));
    OS.beginPath(); poly.forEach(([x, y], i) => (i ? OS.lineTo(x, y) : OS.moveTo(x, y))); OS.closePath(); OS.fill();
}
// a hand-lettered label on a paper tag (knocked out of whatever is under it), popping in
// with k (0..1), and an arrow that draws itself from the tag to what it names (p 0..1)
function tag(press, x, y, lines, k, rot, seed) {
    if (k <= 0.02) return;
    const K = press.plate('black');
    let w = 0, h = 10;
    for (const l of lines) {
        K.font = l.font;
        if ('letterSpacing' in K) K.letterSpacing = l.spacing ?? '0px';
        w = Math.max(w, K.measureText(l.text).width); h += l.h;
    }
    if ('letterSpacing' in K) K.letterSpacing = '0px';
    w += 30;
    press.save();
    press.each((p) => { p.translate(x, y); p.rotate(rot); p.scale(k, k); });
    const box = (g) => { g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, 6); };
    press.knockout((g) => { box(g); g.fill(); });
    Ad.brush(K, [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2], [-w / 2, -h / 2]], 2.6, seed + 'b', { taper: [0, 0], wobble: 0.3, step: 6 });
    K.fillStyle = Ad.tone(1); K.textAlign = 'center'; K.textBaseline = 'alphabetic';
    let yy = -h / 2 + 5;
    for (const l of lines) {
        yy += l.h;
        K.font = l.font;
        if ('letterSpacing' in K) K.letterSpacing = l.spacing ?? '0px';
        K.fillText(l.text, 0, yy - (l.base ?? 6));
    }
    if ('letterSpacing' in K) K.letterSpacing = '0px';
    K.textAlign = 'left';
    press.restore();
}
function arrow(press, pts, p, seed, w = 3) {
    if (p <= 0) return;
    const K = press.plate('black'), P = Ad.smooth(pts, 2), n = Math.max(2, Math.round(P.length * Math.min(1, p)));
    const part = P.slice(0, n);
    Ad.brush(K, part, w, seed, { taper: [0.15, 0], wobble: 0.2, step: 2 });
    if (p >= 1) {
        const [x1, y1] = P[P.length - 1], [x0, y0] = P[Math.max(0, P.length - 6)], a = Math.atan2(y1 - y0, x1 - x0), L = w * 4.5;
        for (const da of [2.6, -2.6]) Ad.brush(K, [[x1 + Math.cos(a + da) * L, y1 + Math.sin(a + da) * L], [x1, y1]], w, seed + da, { taper: [0.3, 0] });
    }
}
// a ribbon banner with a slogan: paper, notched ends, brush outline, black script
function banner(press, x, y, text, size, k, rot, seed) {
    if (k <= 0.02) return;
    const K = press.plate('black');
    K.font = `${size}px 'Kaushan Script'`;
    const w = K.measureText(text).width / 2 + size * 0.7, h = size * 0.62, nt = size * 0.35;
    const shape = [[-w - nt, -h], [w + nt, -h], [w, 0], [w + nt, h], [-w - nt, h], [-w, 0]];
    press.save();
    press.each((p) => { p.translate(x, y); p.rotate(rot); p.scale(k, k); });
    press.knockout((g) => { g.beginPath(); shape.forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.closePath(); g.fill(); });
    Ad.brush(K, [...shape, shape[0]], size * 0.07, seed, { taper: [0, 0], wobble: 0.25, step: 5 });
    Ad.script(K, text, 0, size * 0.32, size, { align: 'center', rot: 0, slant: -0.08, color: Ad.tone(1) });
    press.restore();
}
// a paw print stamped in black ink (a cat walked through the ink): pad and four toes
function paw(press, x, y, rot, s) {
    const K = press.plate('black');
    press.save();
    press.each((p) => { p.translate(x, y); p.rotate(rot); p.scale(s, s); });
    K.fillStyle = Ad.tone(1);
    K.beginPath(); K.moveTo(-15, 8); K.bezierCurveTo(-17, -6, -6, -10, 0, -10); K.bezierCurveTo(6, -10, 17, -6, 15, 8); K.bezierCurveTo(12, 15, -12, 15, -15, 8); K.fill();
    for (const [tx, ty, r] of [[-15, -16, 5.2], [-5.5, -24, 5.6], [5.5, -24, 5.6], [15, -16, 5.2]]) { K.beginPath(); K.ellipse(tx, ty, r * 0.85, r * 1.1, tx * 0.03, 0, 7); K.fill(); }
    press.restore();
}

function shot1(press, t) {
    // the plates land on the downbeats, each a little off register, and settle; the
    // hand-lettering is not on them yet: it is brushed on next
    const land = [['turquoise', 0.5], ['orange', 1.5], ['black', 2.5]];
    const inks = land.filter(([, at]) => t >= at).map(([i]) => i);
    const reg = { orange: [-2, 1], turquoise: [2, 2], black: [0, 0] };
    for (const [ink, at] of land) {
        const k = t >= at ? Math.exp(-(t - at) * 7) : 0;
        reg[ink] = [reg[ink][0] + 14 * k, reg[ink][1] - 9 * k];
    }
    camera(press, 640, 360, 1 + 0.01 * Math.max(...land.map(([, at]) => (t >= at ? Math.exp(-(t - at) * 9) : 0))));
    if (inks.length) pageA(press, t, { fresh: { hide: true } }, inks);
    return { register: reg };
}
// «Fresh!» brushed on: a slanted edge sweeping left to right reveals it
function freshOn(press, t, a, b) {
    const k = inOut(seg(t, a, b));
    if (k <= 0) return { hide: true };
    if (k >= 1) return null;
    return { clip: (g) => { const x = lerp(60, 560, k); g.moveTo(0, 0); g.lineTo(x + 60, 0); g.lineTo(x - 40, 260); g.lineTo(0, 260); g.closePath(); } };
}
function shot2(press, t) {
    camera(press, 640, 360, 1 + 0.03 * seg(t, 3, 6));
    const beat = Math.floor(t * 2) / 2, flash = hop(t, beat, 0.25) * (t >= 4.5 ? 1 : 0);
    const on = freshOn(press, t, 3.0, 4.0);
    pageA(press, t, { fresh: on ?? { s: 1 + 0.06 * flash } });
    return {};
}
function shot3(press, t) {
    const k = inOut(seg(t, 6, 8.5)), z = lerp(1.03, 3.0, k);
    camera(press, lerp(640, 214, k), lerp(360, 300, k), z);
    pageA(press, t);
    nightWindows(press, [t >= 7.0, t >= 7.5, t >= 8.0]);
    lampFlicker(press, (t > 6.6 && t < 6.75) || (t > 7.15 && t < 7.25) || (t > 8.4 && t < 8.5));
    skyStars(press, t, 6.5);
    return {};
}
function shot4(press, t) {
    // back out to Joe; his label is pinned on; then the camera drifts to the oven
    const k = inOut(seg(t, 9, 9.6)), d = inOut(seg(t, 11.5, 13));
    const z = lerp(3.0, 1.3, k) + lerp(0, 0.35, d);
    camera(press, lerp(lerp(214, 700, k), 1000, d), lerp(lerp(300, 300, k), 340, d), z);
    pageA(press, t);
    nightWindows(press, [1, 1, 1]);
    skyStars(press, 99, 0);
    tag(press, 845, 92, [{ text: 'Joe', font: "40px 'Kaushan Script'", h: 40 }, { text: 'UP SINCE 4 A.M.', font: "15px 'Anton'", h: 20, spacing: '2px', base: 4 }], outBack(seg(t, 10.0, 10.3)), 0.07, 'tagjoe');
    arrow(press, [[795, 118], [770, 140], [740, 152], [712, 156]], seg(t, 10.35, 10.7), 'arjoe');
    return {};
}
function crust(press, t) {
    // the crust crackles on the beats: paper flicks along the score lines
    press.knockout((g) => {
        const r = Motion.rng('crack' + Math.floor(t * 2));
        if ((t * 2) % 1 < 0.5) for (let i = 0; i < 9; i++) { const x = 960 + r() * 300, y = 330 + r() * 50; Ad.brush(g, [[x, y], [x + 4 + r() * 6, y - 3 - r() * 4]], 1.6, 'ck' + i + Math.floor(t * 2), { taper: [0.3, 0.3] }); }
    });
    // flour dust falling in front
    const OS = press.plate('orange', 'screen');
    OS.fillStyle = Ad.tone(0.35);
    for (let i = 0; i < 26; i++) {
        const r = Motion.rng('dust' + i), x = 980 + r() * 280, y = 290 + ((r() * 160 + t * 22) % 160), s = 1 + r() * 1.6;
        OS.beginPath(); OS.arc(x + Math.sin(t * 2 + i) * 4, y, s, 0, 7); OS.fill();
    }
}
function shot5(press, t) {
    const z = lerp(1.65, 2.9, inOut(seg(t, 13, 16)));
    camera(press, lerp(1000, 1110, inOut(seg(t, 13, 14))), lerp(340, 360, seg(t, 13, 14)), z);
    pageA(press, t);
    nightWindows(press, [1, 1, 1]);
    crust(press, t);
    banner(press, 1080, 268, 'Golden crust!', 30, outBack(seg(t, 13.5, 13.8)), -0.06 + 0.02 * Math.sin(t * 3), 'bn1');
    if (t >= 14.5) {
        const K = press.plate('black'), k = seg(t, 14.5, 15.1);
        press.save(); press.clip((g) => g.rect(960, 284, 260 * k, 40));
        press.knockout((g) => { g.font = "17px 'Anton'"; g.textAlign = 'center'; g.lineWidth = 6; g.lineJoin = 'round'; if ('letterSpacing' in g) g.letterSpacing = '2px'; g.strokeText('SOFT AS A CLOUD INSIDE', 1088, 306); });
        K.font = "17px 'Anton'"; K.textAlign = 'center'; K.fillStyle = Ad.tone(1); if ('letterSpacing' in K) K.letterSpacing = '2px';
        K.fillText('SOFT AS A CLOUD INSIDE', 1088, 306);
        if ('letterSpacing' in K) K.letterSpacing = '0px'; K.textAlign = 'left';
        press.restore();
    }
    return {};
}
function shot6(press, t) {
    // the cat, held as printed; the camera leans in on the beats; its label is pinned on
    const b = Math.floor(t * 2) / 2, z = 2.75 + 0.06 * inOut(seg(t, 16, 19)) + 0.025 * hop(t, b, 0.25);
    camera(press, 120, 470, z);
    pageA(press, t);
    nightWindows(press, [1, 1, 1]);
    skyStars(press, 99, 0);
    tag(press, 318, 404, [{ text: 'Whiskers', font: "30px 'Kaushan Script'", h: 32 }, { text: 'HEAD TASTER', font: "13px 'Anton'", h: 18, spacing: '2px', base: 4 }], outBack(seg(t, 16.75, 17.05)), -0.06, 'tagcat');
    arrow(press, [[268, 420], [238, 438], [205, 440], [182, 430]], seg(t, 17.1, 17.45), 'arcat', 2.6);
    if (t >= 18.0) badge(press, 212, 384, 17, outBack(seg(t, 18.0, 18.25)), 'turquoise', [{ text: '!', font: "26px 'Kaushan Script'", y: 1 }]);
    return {};
}
// the boomerang that carries the cut to the second panel
// (logical units: the frame is 1600 × 900; its leading edge at x)
function boomerangWipe(press, x) {
    press.knockout((g) => Ad.boomerang(g, x + 260, 450, 520, -0.12));
    const Q = press.plate('turquoise');
    Q.fillStyle = Ad.tone(1);
    Ad.boomerang(Q, x + 260, 450, 520, -0.12);
    Ad.brush(press.plate('black'), [[x - 240, 230], [x + 420, 360], [x + 760, 330]], 5, 'bw', { taper: [0.2, 0.4] });
}
const OVEN_B_GLOW = [[1095, 470], [1095, 270], [1150, 215], [1250, 220], [1250, 470]];
function shot7(press, t) {
    const wipe = seg(t, 19, 19.5);
    if (wipe < 1) {
        // C-a (as shot 6 left it) to the right of the boomerang's sweep, C-b behind it
        const x = lerp(-800, 1700, inOut(wipe));
        press.save(); press.clip((g) => g.rect(x, 0, 1700 - x, 900)); press.save(); camera(press, 120, 470, 2.81); pageA(press, t); press.restore(); press.restore();
        press.save(); press.clip((g) => g.rect(-100, 0, x + 100, 900)); press.save(); camera(press, 640, 360, 1); drawPanel(press, 'C-b'); press.restore(); press.restore();
        boomerangWipe(press, x);
        return {};
    }
    camera(press, 640, 360, 1 + 0.035 * seg(t, 19.5, 23));
    drawPanel(press, 'C-b', { sb_tl: sparkle(t, 0), sb_or: sparkle(t, 1) });
    ovenGlow(press, t, OVEN_B_GLOW);
    steam(press, t, OVEN_B, [1080, 1160], 360, 80);
    // the price spins in like a coin and lands on the beat
    const k = seg(t, 20.25, 20.75), b = Math.floor(t * 2) / 2;
    if (t >= 20.25) {
        press.save();
        press.each((p) => { p.translate(1110, 125); p.rotate(-Math.PI * 2 * (1 - inOut(k))); p.translate(-1110, -125); });
        badge(press, 1110, 125, 108, outBack(k) * (1 + 0.04 * hop(t, b, 0.25) * (t > 21 ? 1 : 0)), 'turquoise', [
            { text: '10¢', font: "64px 'Titan One'", y: -14 }, { text: 'a loaf!', font: "34px 'Kaushan Script'", y: 40 }]);
        press.restore();
    }
    return {};
}
function endCard(press, t, inks) {
    const has = (i) => !inks || inks.includes(i);
    const O = press.plate('orange'), Q = press.plate('turquoise'), QS = press.plate('turquoise', 'screen'), K = press.plate('black');
    // the sun rises behind everything: rays on a screen, the disc flat orange
    const rise = outBack(seg(t, 23.25, 24.25)), cy = 720 + 240 * (1 - rise);
    if (has('turquoise')) {
        QS.fillStyle = Ad.tone(0.32);
        for (let i = 0; i < 16; i++) {
            const a0 = Math.PI + (i / 16) * Math.PI + t * 0.05, a1 = a0 + Math.PI / 32;
            QS.beginPath(); QS.moveTo(640, cy); QS.arc(640, cy, 1100, a0, a1); QS.closePath(); QS.fill();
        }
    }
    if (has('orange')) { O.fillStyle = Ad.tone(1); O.beginPath(); O.arc(640, cy, 190, Math.PI, 0); O.fill(); }
    // «Early Bird» drops in letter by letter, then «BAKERY»
    const word = 'Early Bird';
    K.font = O.font = Q.font = "124px 'Titan One'";
    const widths = [...word].map((c) => K.measureText(c).width), total = widths.reduce((a, b) => a + b, 0);
    let x = 640 - total / 2;
    [...word].forEach((c, i) => {
        const at = 23.5 + i * 0.125, k = seg(t, at, at + 0.3), y = 190 - 260 * (1 - outBack(k));
        if (t >= at && c !== ' ') {
            press.knockout((g) => { g.font = "124px 'Titan One'"; g.fillText(c, x + 7, y + 7); g.fillText(c, x, y); });
            // the shadow under the letter is cut away, so the orange prints clean on paper
            if (has('turquoise')) { Q.fillStyle = Ad.tone(1); Q.fillText(c, x + 7, y + 7); Q.save(); Q.globalCompositeOperation = 'destination-out'; Q.fillText(c, x, y); Q.restore(); }
            if (has('orange')) { O.fillStyle = Ad.tone(1); O.fillText(c, x, y); }
            if (has('black')) { K.lineWidth = 5; K.lineJoin = 'round'; K.strokeStyle = Ad.tone(1); K.strokeText(c, x, y); }
        }
        x += widths[i];
    });
    if (has('black') && t >= 24.75) {
        K.font = "60px 'Titan One'"; K.textAlign = 'center'; K.fillStyle = Ad.tone(1);
        const s = outBack(seg(t, 24.75, 25.0));
        K.save(); K.translate(640, 262); K.scale(s, s); if ('letterSpacing' in K) K.letterSpacing = '14px'; K.fillText('BAKERY', 0, 0); K.restore();
        if ('letterSpacing' in K) K.letterSpacing = '0px';
        K.textAlign = 'left';
    }
    // «Baked while you sleep!» brushes on left to right
    if (has('black') && t >= 25.25) {
        const k = seg(t, 25.25, 26.0);
        press.save(); press.clip((g) => g.rect(300, 290, 680 * k, 110));
        Ad.script(K, 'Baked while you sleep!', 640, 360, 62, { align: 'center', rot: -0.05, color: Ad.tone(1) });
        press.restore();
    }
    if (has('black') && t >= 26.0) {
        K.font = "27px 'Anton'"; K.textAlign = 'center'; K.fillStyle = Ad.tone(1);
        if ('letterSpacing' in K) K.letterSpacing = '5px';
        K.fillText('MILL STREET  ·  OPEN AT 6 A.M.', 640, 430);
        if ('letterSpacing' in K) K.letterSpacing = '0px';
        K.textAlign = 'left';
    }
    // the loaf turns in its starburst; inky paw prints walk up to it, one per half beat,
    // and on the last word a bite is gone (Whiskers, the head taster)
    const lp = outBack(seg(t, 24.5, 25.0));
    if (t >= 24.5 && lp > 0.03) {
        if (has('turquoise')) badge(press, 1045, 560, 128, lp, 'turquoise', []);
        const bite = t >= 27.5 ? 1 : 0;
        if (has('orange') || has('black')) loaf(press, 1045, 565, 110 * lp, 62 * lp, -0.12 + 0.05 * Math.sin(t * 2), 'hero', bite);
    }
    if (has('black')) {
        // a cat walking in from the left edge to the loaf: left and right paws alternate
        const steps = [[90, 640], [235, 622], [380, 606], [525, 594], [670, 586], [815, 582]];
        steps.forEach(([px, py], i) => {
            const at = 26.25 + i * 0.208;
            if (t < at) return;
            paw(press, px, py + (i % 2 ? -22 : 22), Math.PI / 2 - 0.08, 1.75 - 0.25 * seg(t, at, at + 0.12));
        });
    }
}
function shot8(press, t) {
    camera(press, 640, 360, 1 + 0.03 * hop(t, 27.5, 0.25));
    endCard(press, t);
    return {};
}
function shot9(press, t) {
    // the plates lift off in reverse: black, orange, turquoise
    const lift = [['black', 28.5], ['orange', 29.0], ['turquoise', 29.5]];
    const inks = lift.filter(([, at]) => t < at).map(([i]) => i);
    const reg = { orange: [-2, 1], turquoise: [2, 2], black: [0, 0] };
    for (const [ink, at] of lift) { const k = seg(t, at - 0.17, at); reg[ink] = [reg[ink][0] - 30 * k * k, reg[ink][1] - 40 * k * k]; }
    camera(press, 640, 360, 1);
    if (inks.length) endCard(press, 28, inks);
    return { register: reg };
}

Motion.scene({
    fps: 24,
    duration: 30,
    bpm: 120,
    logical: [1600, 900],
    uses: ['styles/risograph/riso.js', 'styles/magazine-ad/ad.js', 'sandbox/2026-11-17-magazine-ad-test/sep/C-a.js', 'sandbox/2026-11-17-magazine-ad-test/sep/C-b.js'],
    fonts: [
        { family: 'Kaushan Script', src: 'fonts/KaushanScript-Regular.ttf' },
        { family: 'Titan One', src: 'fonts/TitanOne-latin.woff2' },
        { family: 'Anton', src: 'fonts/Anton-latin.woff2' },
    ],
    shots: SHOTS,
    setup(env) {
        return { press: Ad.press(env) };
    },
    draw(g, t0, env) {
        const { press } = env.state;
        const d = Math.floor(t0 * 12 + 1e-6), t = d / 12; // on twos: the drawing's time
        const i = SHOTS.findIndex(([a, b]) => t >= a && t < b), idx = i < 0 ? SHOTS.length - 1 : i;
        press.begin(d);
        press.save();
        CAM.origin = [0, 0]; CAM.zoom = 1;
        const o = [shot1, shot2, shot3, shot4, shot5, shot6, shot7, shot8, shot9][idx](press, t) ?? {};
        press.restore();
        // the screen is the page's: it scales and travels with the camera (the last camera set)
        press.print(g, { key: d, register: o.register, zoom: CAM.zoom, origin: CAM.origin.map((v) => v * env.k) });
        // animatic label (not part of the print)
        g.save();
        g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(10, 10, 330, 34);
        g.fillStyle = '#fff'; g.font = '20px monospace';
        g.fillText(`${t0.toFixed(2)}s  ${SHOTS[idx][2]}`, 20, 34);
        g.restore();
    },
});
