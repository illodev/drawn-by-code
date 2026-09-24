// 2026-09-24-opus5-riso · a 1:1 study (not published as ours) of a risograph-printed film
// (references/opus5-risograph.mp4, author to be credited). A blue dot on paper sends out
// sonar rings; illustrations ("cards", cards/*.js) open in circles round it, then flash full
// frame one per half beat, then re-inked with a white ring; a mosaic of all of them; orbits;
// «opus 5 · claude». Every frame is printed by styles/risograph (Riso), one print per drawing.
// Times are measured on the reference (out/cuts.txt, sheets every 1/12 s).
const DIR = 'sandbox/2026-09-24-opus5-riso/';
const CARD_NAMES = [
    'koi', 'grasshopper', 'jellyfish', 'owl', 'bell', 'lighthouse', 'wolf', 'phone', 'turntable', 'frogs', 'bats',
    'wave', 'cat', 'sunflower', 'radio', 'fireworks', 'hummingbird', 'kettle', 'ferris', 'waterfall', 'bicycle', 'whale',
    'piano', 'rocket', 'city', 'planet', 'lightning', 'balloons', 'cello', 'volcano', 'shell', 'dish', 'train', 'campfire',
    'chimes', 'field', 'snowflake', 'mountains', 'aurora', 'savanna', 'dunes', 'ice', 'flower',
];
// The edit: [start, kind, card, options]. kinds: 'sonar' (dot + rings + flecks), 'circle'
// (the card opens in a circle over the previous frame), 'full' (the card full frame).
// the pink colourway of 23–24 s: only pink and navy (purple where they meet)
const PINKSET = { yellow: 'pink', blue: 'navy' };
const EDIT = [
    [0, 'sonar'], [1.5, 'circle', 'koi', { c: [500, 500], r: [150, 262, 290, 290, 290, 232] }],
    [2.0, 'sonar'], [2.75, 'circle', 'grasshopper', { c: [500, 500], r: [147, 244, 258, 261, 255, 190], coin: true }],
    [3.25, 'circle', 'jellyfish', { c: [575, 540], r: [130, 250, 262, 262, 262, 262, 262, 262] }],
    [4.0, 'sonar', null, { rings: 'late' }], [4.5, 'circle', 'owl', { c: [500, 500], r: [270], thenFull: true }],
    [5.0, 'circle', 'bell', { c: [500, 500], r: [360], thenFull: true, over: 'owl' }],
    [5.5, 'circle', 'lighthouse', { c: [500, 500], r: [360], thenFull: true, over: 'bell' }],
    [6.0, 'sonar', null, { rings: 'late' }], [6.5, 'circle', 'wolf', { c: [500, 500], r: [385], thenFull: true }],
    [7.0, 'full', 'phone'], [7.25, 'full', 'turntable'], [7.5, 'full', 'frogs'], [7.75, 'full', 'bats'],
    [8.0, 'sonar', null, { rings: 'late' }],
    [8.25, 'full', 'wave'], [8.5, 'full', 'cat'], [8.75, 'full', 'sunflower'], [9.0, 'full', 'radio'], [9.25, 'full', 'fireworks'],
    [9.5, 'full', 'hummingbird'], [9.75, 'full', 'kettle'], [10.0, 'sonar', null, { rings: 'late' }],
    [10.25, 'full', 'ferris'], [10.5, 'full', 'waterfall'], [10.75, 'full', 'bicycle'], [11.0, 'full', 'whale'], [11.25, 'full', 'piano'],
    [11.5, 'full', 'rocket'], [11.75, 'full', 'city'], [12.0, 'full', 'planet'], [12.125, 'full', 'lightning', { ring: true }],
    [12.25, 'full', 'balloons', { ring: true }], [12.375, 'full', 'cello'], [12.5, 'full', 'volcano'], [12.625, 'full', 'shell'],
    [12.75, 'full', 'dish'], [12.875, 'full', 'train'], [13.0, 'full', 'campfire'], [13.125, 'full', 'chimes'], [13.25, 'full', 'field'],
    [13.375, 'full', 'snowflake'], [13.5, 'full', 'mountains'], [13.625, 'full', 'aurora'], [13.75, 'full', 'savanna'],
    [13.875, 'full', 'dunes'], [14.0, 'full', 'ice'],
    // the same cards again, re-inked, with a white ring
    [14.125, 'full', 'koi', { ring: true, inks: { blue: 'pink', pink: 'yellow', yellow: 'blue' } }],
    [14.25, 'full', 'grasshopper', { ring: true, inks: { navy: 'blue', yellow: 'yellow' } }],
    [14.375, 'full', 'jellyfish', { ring: true, inks: { blue: 'pink', pink: 'blue' } }],
    [14.5, 'full', 'owl', { ring: true, inks: { pink: 'blue' } }],
    [14.625, 'full', 'bell', { ring: true, inks: { pink: 'blue' } }],
    [14.75, 'full', 'lighthouse', { ring: true, inks: { blue: 'pink', pink: 'blue' } }],
    [14.875, 'full', 'wolf', { ring: true, inks: { blue: 'pink' } }],
    [15.0, 'full', 'phone', { ring: true, inks: { blue: 'pink', pink: 'blue' } }],
    [15.125, 'full', 'turntable', { ring: true, inks: { blue: 'pink', pink: 'yellow' } }],
    [15.25, 'full', 'bats', { ring: true, inks: { pink: 'blue', blue: 'yellow' } }],
    [15.375, 'full', 'wave', { ring: true, inks: { blue: 'pink', pink: 'blue' } }],
    [15.5, 'full', 'sunflower', { ring: true, inks: { blue: 'pink' } }],
    [15.625, 'full', 'radio', { ring: true, inks: { pink: 'blue' } }],
    [15.75, 'full', 'hummingbird', { ring: true, inks: { blue: 'pink', pink: 'yellow' } }],
    [15.875, 'full', 'kettle', { ring: true, inks: { pink: 'blue', blue: 'pink' } }],
    [16.0, 'mosaic'], [18.0, 'orbits'], [23.0, 'full', 'waterfall', { inks: PINKSET }], [23.167, 'full', 'bicycle', { inks: PINKSET }], [23.333, 'full', 'piano', { inks: PINKSET }],
    [23.5, 'full', 'rocket', { inks: PINKSET }], [23.667, 'full', 'city', { inks: PINKSET }], [23.833, 'full', 'lightning', { inks: PINKSET }], [24.0, 'night'], [26.0, 'title'], [28.1, 'end'],
];
Motion.scene({
    fps: 24,
    duration: 28,
    logical: [1000, 1000],
    uses: ['styles/risograph/riso.js', ...CARD_NAMES.map((n) => ({ src: DIR + 'cards/' + n + '.js', optional: true }))],
    fonts: [{ family: 'Hand', src: 'fonts/PatrickHand-Regular.ttf' }],
    audio: { mix: 'out/reference-audio.wav' }, // the reference's track, local only (never committed)
    shots: EDIT.slice(0, -1).map(([a, k, c], i) => [a, EDIT[i + 1][0], c ?? k]),
    setup(env) {
        return { press: Riso.press(env) };
    },
    draw(g, t, env) {
        const { press } = env.state, d = Math.floor(t * 12 + 1e-6), tq = d / 12;
        let i = EDIT.findIndex(([a]) => a > tq + 1e-6) - 1;
        if (i < 0) i = EDIT.length - 2;
        const [t0, kind, card, o = {}] = EDIT[i], lt = tq - t0, ld = Math.round(lt * 12);
        press.begin(d);
        if (kind === 'sonar') sonar(press, lt, o);
        else if (kind === 'circle') circleCard(press, card, lt, ld, o);
        else if (kind === 'full') { drawCard(press, card, lt); if (o.ring) whiteRing(press, ld); }
        else if (kind === 'mosaic') mosaic(press, lt);
        ORBIT_DOT = null;
        if (kind === 'orbits') orbits(press, lt);
        else if (kind === 'night') night(press, lt);
        else if (kind === 'title') title(press, lt);
        if (ORBIT_DOT !== 'none') dot(press, ORBIT_DOT ?? [500, 500]);
        press.print(g, { key: d, inks: kind === 'mosaic' && lt >= 1.0 ? MOSAIC_BLUE : o.inks });
    },
});

// ------------------------------------------------------------------ pieces
const T = (v) => Riso.tone(v);
function drawCard(press, name, lt) {
    if (CARDS[name]) return CARDS[name](press, lt);
    // placeholder until the card exists: a two-ink field with its name
    const s = press.plate('pink', 'screen'), n = press.plate('navy');
    s.fillStyle = T(0.35);
    s.fillRect(0, 0, 1000, 1000);
    n.fillStyle = T(1);
    n.font = '90px Hand';
    n.textAlign = 'center';
    n.fillText(name, 500, 700);
}
var CARDS = CARDS || {};
// the blue dot at the centre: navy with a pink under-print (the register shows it)
function dot(press, [x, y]) {
    const n = press.plate('navy'), b = press.plate('blue'), p = press.plate('pink');
    for (const [g, v, r] of [[b, 0.9, 20], [n, 1, 17], [p, 0.5, 14]]) {
        g.fillStyle = T(v);
        g.beginPath();
        g.arc(x, y, r, 0, 7);
        g.fill();
    }
}
// sonar rings: one born every 2 drawings, radius by age (measured): 160, 270, 465, 620…
const RING_R = [160, 270, 465, 640, 820];
function sonar(press, lt, o) {
    const b = press.plate('blue'), ld = Math.round(lt * 12);
    const births = o.rings === 'late' ? [0, 1, 3] : [0, 2, 4];
    for (const bd of births) {
        const age = ld - bd;
        if (age < 0 || age >= RING_R.length) continue;
        Riso.ring(b, 500, 500, RING_R[age] * (o.rings === 'late' ? 0.82 : 1), Math.max(3.5, 9 - age * 1.6), 'sonar' + bd + age, { color: T(0.95), wobble: 0.01 });
    }
    // flecks: trios of short arcs converging on the dot from the edges (0.6–1.45 s after)
    const groups = [[Math.PI + 0.12, 0.58, 0.42], [-0.85, 0.92, 0.5], [0.72, 1.0, 0.46]];
    for (const [ang, at, dur] of groups) {
        const u = (lt - at) / dur;
        if (u < 0 || u > 1) continue;
        const R = 520 - u * 150;
        for (let k = 0; k < 3; k++) {
            const r = R + k * 28 - 28, a0 = ang - 0.1 + k * 0.02;
            b.save();
            b.strokeStyle = T(0.9);
            b.lineWidth = 3.2 - k * 0.5;
            b.lineCap = 'round';
            b.beginPath();
            b.arc(500, 500, r, a0, a0 + 0.2 - k * 0.03);
            b.stroke();
            b.restore();
        }
    }
}
// a card opening in a circle: radius per drawing from o.r (the last one holds); over the
// previous card (o.over) or the paper; a blue rim; 'thenFull' goes full frame after one drawing
function circleCard(press, name, lt, ld, o) {
    if (o.thenFull && ld >= 1) return drawCard(press, name, lt);
    const r = o.r[Math.min(ld, o.r.length - 1)], [cx, cy] = o.c;
    if (o.over) drawCard(press, o.over, lt + 0.5);
    if (o.coin) {
        const n = press.plate('navy');
        n.fillStyle = T(0.85);
        n.beginPath();
        n.ellipse(cx, cy + r * 0.12, r, r, 0, 0, 7);
        n.fill();
    }
    press.knockout((g) => { g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill(); });
    press.save();
    press.clip((g) => g.arc(cx, cy, r, 0, 7));
    drawCard(press, name, lt);
    press.restore();
    Riso.ring(press.plate('blue'), cx, cy, r, 7, 'rim' + name, { color: T(1), wobble: 0.006 });
}
// the white ring over re-inked cards (knocked out of every plate), breathing on twos
function whiteRing(press, ld) {
    const r = 300 + (ld % 3) * 12;
    press.knockout((g) => { g.lineWidth = 9; g.beginPath(); g.arc(500, 500, r, 0, 7); g.stroke(); });
}
// ------------------------------------------------------------------ the mosaic (16–17.67)
// every card in a circle, measured on the 16.5 s frame (800 px grid → units × 1.25):
// [card, x, y, r]; three rings round the dot, dashed guide circles, a yellow screen ground
const MOSAIC = [
    ['koi', 410, 270, 43], ['grasshopper', 515, 345, 45], ['jellyfish', 505, 470, 45], ['owl', 385, 525, 46], ['bell', 282, 445, 46], ['lighthouse', 298, 320, 45],
    ['kettle', 340, 155, 40], ['wolf', 470, 160, 40], ['phone', 578, 230, 39], ['turntable', 638, 345, 39], ['frogs', 642, 470, 39], ['bats', 568, 565, 39],
    ['wave', 455, 640, 40], ['cat', 330, 632, 40], ['sunflower', 220, 570, 40], ['radio', 160, 455, 39], ['fireworks', 165, 330, 40], ['hummingbird', 230, 220, 39],
    ['campfire', 312, 55, 34], ['chimes', 435, 45, 34], ['field', 550, 80, 35], ['ferris', 652, 152, 35], ['waterfall', 720, 250, 34], ['bicycle', 752, 368, 34],
    ['whale', 740, 490, 34], ['piano', 688, 605, 35], ['rocket', 600, 690, 35], ['city', 488, 740, 34], ['planet', 365, 750, 34], ['lightning', 248, 718, 34],
    ['balloons', 148, 648, 35], ['cello', 78, 545, 34], ['volcano', 45, 425, 34], ['shell', 58, 305, 34], ['dish', 110, 192, 34], ['train', 200, 105, 34],
].map(([n, x, y, r]) => [n, x * 1.25, y * 1.25, r * 1.25]);
function mosaic(press, lt) {
    const ld = Math.round(lt * 12), blueOut = lt >= 1.0;
    // the ground: yellow screen (pink in the corners on the first drawing)
    if (!blueOut) {
        const y = press.plate('yellow', 'screen');
        y.fillStyle = T(0.32);
        y.fillRect(0, 0, 1000, 1000);
        if (ld === 0) { const y2 = press.plate('yellow'); y2.fillStyle = T(0.9); y2.fillRect(0, 0, 1000, 1000); }
    }
    // guide circles: a thin one, dashed hand-drawn ones, ticks round the dot
    const b = press.plate('blue');
    if (lt < 1.2) {
        Riso.ring(b, 500, 500, 375, 2.2, 'mguide', { color: T(0.8), wobble: 0.004 });
        Riso.ring(b, 500, 500, 90, 2.2, 'mcore', { color: T(0.8), wobble: 0.004 });
        for (const [R, seed] of [[250, 'md1'], [480, 'md2'], [610, 'md3']]) {
            b.save();
            b.setLineDash([26, 22]);
            b.lineDashOffset = ld * 4;
            Riso.ring(b, 500, 500, R, 2.6, seed, { color: T(0.8), wobble: 0.01 });
            b.restore();
        }
    }
    // the circles: shrink and scatter away from 17.17 (in blue ink from 17.0)
    MOSAIC.forEach(([name, x, y, r], i) => {
        let cx = x, cy = y, rr = r;
        if (lt >= 1.17) {
            const u = Math.min(1, (lt - 1.17) / 0.4), rnd = Motion.rng('ms' + i), ang = Math.atan2(y - 500, x - 500);
            if (rnd() < u * 1.3) return;
            cx += Math.cos(ang) * u * 120 * rnd();
            cy += Math.sin(ang) * u * 120 * rnd();
            rr *= 1 - u * 0.5 * rnd();
        }
        press.knockout((g) => { g.beginPath(); g.arc(cx, cy, rr, 0, 7); g.fill(); });
        press.save();
        press.clip((g) => g.arc(cx, cy, rr, 0, 7));
        press.each((g) => { g.translate(cx, cy); g.scale((rr * 2.3) / 1000, (rr * 2.3) / 1000); g.translate(-500, -500); });
        drawCard(press, name, lt + i * 0.05);
        press.restore();
        Riso.ring(b, cx, cy, rr, 4.5, 'mrim' + i, { color: T(1), wobble: 0.01 });
    });
    if (!blueOut) {
        const p = press.plate('pink');
        p.fillStyle = T(1);
        p.save(); p.translate(70, 38); p.rotate(0.2);
        p.beginPath(); for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2, R = k % 2 ? 4 : 14; p.lineTo(Math.cos(a) * R, Math.sin(a) * R); } p.fill();
        p.restore();
    }
}
// the mosaic's blue colourway: every plate printed in blue (navy stays)
const MOSAIC_BLUE = { pink: 'blue', yellow: 'blue' };

// ------------------------------------------------------------------ the orbits (18–23)
// two bodies: the blue dot (navy) and a pink dot; rings pulse out of one or the other.
// Keyframes measured on the sheets (every 1/6 s): [t, blue xy, pink xy | null]
const BODY = [[0, [500, 500], null], [1.5, [500, 500], null], [1.83, [630, 390], [300, 700]], [2.0, [640, 360], [300, 720]], [3.0, [700, 300], [300, 700]], [5.0, [720, 300], [280, 710]]];
// pulses: [t0 (s after 18), 'blue' | 'pink' | 'corner', rings, max radius, duration]
const PULSES = [
    [0.0, 'corner', 0, 0, 0.3], [0.1, 'cornerRings', 3, 900, 0.9], [0.45, 'blue', 1, 70, 0.3], [1.0, 'blue', 2, 380, 0.6],
    [1.5, 'corner', 0, 0, 0.2], [1.62, 'cornerRings', 3, 820, 0.4], [1.83, 'pink', 1, 60, 0.25], [1.95, 'blue', 1, 60, 0.3],
    [2.15, 'blue', 3, 420, 0.5], [2.62, 'pink', 3, 460, 0.45], [2.8, 'blue', 2, 90, 0.25], [3.1, 'blue', 3, 520, 0.5],
    [3.45, 'pink', 3, 300, 0.4], [3.65, 'pink', 1, 450, 0.3], [3.65, 'blue', 1, 70, 0.3],
];
function orbits(press, lt) {
    const tq = lt, key = BODY.findIndex(([a]) => a > tq), [a0, b0, p0] = BODY[Math.max(0, key - 1)], [a1, b1, p1] = BODY[key < 0 ? BODY.length - 1 : key];
    const u = key < 0 ? 1 : Ease.inOut(Ease.seg(tq, a0, a1));
    const blue = [b0[0] + (b1[0] - b0[0]) * u, b0[1] + (b1[1] - b0[1]) * u];
    const pinkP = p0 && p1 ? [p0[0] + (p1[0] - p0[0]) * u, p0[1] + (p1[1] - p0[1]) * u] : p1 && tq >= a1 ? p1 : null;
    const bp = press.plate('blue'), pp = press.plate('pink'), pS = press.plate('pink', 'screen');
    for (const [t0, who, n, R, dur] of PULSES) {
        const age = tq - t0;
        if (age < 0 || age > dur) continue;
        const v = age / dur;
        if (who === 'corner') {
            pS.fillStyle = Riso.radial(pS, 0, 1000, 0, 330, 0.95, 0);
            pS.fillRect(0, 600, 400, 400);
            continue;
        }
        const c = who === 'cornerRings' ? [-120, 1120] : who === 'blue' ? blue : pinkP ?? [300, 700];
        const g = who === 'blue' ? bp : pp;
        for (let k = 0; k < Math.max(1, n); k++) {
            const r = (R * (0.35 + 0.65 * Ease.out(v))) * (1 - k * 0.28) + (who === 'cornerRings' ? 260 : 0);
            Riso.ring(g, c[0], c[1], r, Math.max(2.2, 7 - k * 2 - v * 3), 'orb' + t0 + k, { color: T(0.95), wobble: 0.006 });
        }
    }
    if (pinkP) {
        pp.fillStyle = T(1);
        pp.beginPath(); pp.arc(pinkP[0], pinkP[1], 16, 0, 7); pp.fill();
    }
    // 22.0: the two bodies swell (pink over yellow = orange, navy over pink)
    if (tq >= 4.0 && tq < 4.17) {
        const y = press.plate('yellow'), n = press.plate('navy');
        y.fillStyle = T(1); y.beginPath(); y.arc(pinkP[0], pinkP[1], 75, 0, 7); y.fill();
        pp.fillStyle = T(1); pp.beginPath(); pp.arc(pinkP[0], pinkP[1], 58, 0, 7); pp.fill();
        pp.beginPath(); pp.arc(blue[0], blue[1], 78, 0, 7); pp.fill();
        n.fillStyle = T(1); n.beginPath(); n.arc(blue[0], blue[1], 66, 0, 7); n.fill();
    }
    // 22.17–22.84: the flower grows at the centre, rings round it
    if (tq >= 4.17) {
        const s = Math.min(1, (tq - 4.17) / 0.25);
        press.save();
        press.each((g) => { g.translate(500, 500); g.scale(0.4 + 0.6 * s, 0.4 + 0.6 * s); g.translate(-500, -500); });
        drawCard(press, 'flower', tq - 4.17);
        press.restore();
        Riso.ring(bp, 500, 500, 250 + (tq - 4.17) * 60, 5, 'fl1', { color: T(0.9) });
        Riso.ring(pp, 480, 520, 330 + (tq - 4.17) * 80, 4, 'fl2', { color: T(0.9) });
    }
    ORBIT_DOT = blue;
}
var ORBIT_DOT = null;

// ------------------------------------------------------------------ the night sky (24–26)
function night(press, lt) {
    const n = press.plate('navy'), pS = press.plate('pink', 'screen'), bS = press.plate('blue', 'screen');
    n.fillStyle = T(0.9);
    n.fillRect(0, 0, 1000, 1000);
    press.plate('blue').fillStyle = T(0.25);
    press.plate('blue').fillRect(0, 0, 1000, 1000);
    // soft purple waves (pink screen in broad diagonal bands)
    pS.save();
    for (let k = 0; k < 6; k++) {
        const gr = pS.createLinearGradient(0, 0, 1000, 1000);
        pS.fillStyle = T(0.42);
        pS.beginPath();
        const o = k * 190 - 150 + Math.sin(k * 1.7) * 40;
        pS.moveTo(o, 0); pS.bezierCurveTo(o + 180, 250, o - 60, 600, o + 160, 1000); pS.lineTo(o + 260, 1000); pS.bezierCurveTo(o + 40, 600, o + 280, 250, o + 110, 0);
        pS.fill();
    }
    pS.restore();
    bS.fillStyle = T(0.15);
    bS.fillRect(0, 0, 1000, 1000);
    // stars: white specks knocked out, fixed
    const r = Motion.rng('stars');
    press.knockout((g) => { for (let k = 0; k < 2200; k++) { g.beginPath(); g.arc(r() * 1000, r() * 1000, 0.7 + r() * 1.5, 0, 7); g.fill(); } });
    // the two bodies move to the centre, rings round them shrink; small planets gather
    // measured: 24.0 (720,300)/(280,720) → 24.6 (600,415)/(400,590) → 25.5 (520,490)/(470,530)
    const k3 = (a, b, c) => (lt < 0.6 ? a + (b - a) * Ease.out(lt / 0.6) : b + (c - b) * Ease.inOut(Ease.seg(lt, 0.6, 1.5)));
    const u = Ease.seg(lt, 0, 1.5);
    const B = [k3(720, 600, 520), k3(300, 415, 490)], Pk = [k3(280, 400, 470), k3(720, 590, 530)];
    const bp = press.plate('blue'), pp = press.plate('pink'), yy = press.plate('yellow');
    const rr = lt < 0.6 ? 0.4 + 0.6 * Ease.out(lt / 0.6) : 1 - 0.55 * Ease.inOut(Ease.seg(lt, 0.6, 1.5));
    if (lt >= 0.1) {
        Riso.ring(bp, B[0], B[1], 175 * rr, 5, 'nb1', { color: T(0.95) });
        Riso.ring(bp, B[0], B[1], 80 * rr, 10, 'nb2', { color: T(0.95) });
        Riso.ring(pp, Pk[0], Pk[1], 150 * rr, 5, 'np1', { color: T(1) });
    }
    press.knockout((g) => { for (const [x, y] of [B, Pk]) { g.beginPath(); g.arc(x, y, 30, 0, 7); g.fill(); } });
    for (const [x, y, g2] of [[B[0], B[1], bp], [Pk[0], Pk[1], pp]]) {
        yy.fillStyle = T(1); yy.beginPath(); yy.arc(x, y, 30, 0, 7); yy.fill();
        press.knockout((g) => { g.beginPath(); g.arc(x, y, 21, 0, 7); g.fill(); });
        g2.fillStyle = T(1); g2.beginPath(); g2.arc(x, y, 20, 0, 7); g2.fill();
    }
    // the planets: small ringed dots, more and more (from 24.5), drifting inwards
    const rp = Motion.rng('planets'), count = Math.floor(Ease.seg(lt, 0.5, 1.6) * 110);
    for (let k = 0; k < 110; k++) {
        const x0 = rp() * 1000, y0 = rp() * 1000, col = rp() < 0.55 ? pp : bp, sz = 5 + rp() * 7, ringed = rp() < 0.35;
        if (k >= count) continue;
        const x = x0 + (500 - x0) * 0.25 * u, y = y0 + (500 - y0) * 0.25 * u;
        press.knockout((g) => { g.beginPath(); g.arc(x, y, sz + 3, 0, 7); g.fill(); });
        col.fillStyle = T(1); col.beginPath(); col.arc(x, y, sz, 0, 7); col.fill();
        if (ringed) Riso.ring(col, x, y, sz * 2.4, 1.6, 'pr' + k, { color: T(0.9) });
    }
    ORBIT_DOT = 'none';
}

// ------------------------------------------------------------------ the title (26–28)
function title(press, lt) {
    const n = press.plate('navy'), p = press.plate('pink');
    const write = (str, x, y, size, t0, dur) => {
        const u = Ease.seg(lt, t0, t0 + dur);
        if (u <= 0) return;
        n.save();
        n.font = `${size}px Hand`;
        n.textAlign = 'center';
        const w = n.measureText(str).width;
        n.beginPath(); n.rect(x - w / 2 - 10, y - size, (w + 20) * u, size * 1.4); n.clip();
        n.fillStyle = T(1);
        n.fillText(str, x, y);
        n.restore();
    };
    if (lt < 1.84) {
        write('opus 5', 500, 405, 196, 0, 0.5);
        write('claude', 500, 668, 116, 0.84, 0.36);
        // the two dots: navy and pink
        n.fillStyle = T(1); n.beginPath(); n.arc(478, 505, 17, 0, 7); n.fill();
        p.fillStyle = T(1); p.beginPath(); p.arc(533, 505, 12, 0, 7); p.fill();
        if (lt >= 0.84 && lt < 1.17) Riso.ring(p, 533, 505, 40 + (lt - 0.84) * 60, 3, 'tring', { color: T(1) });
    }
    ORBIT_DOT = lt < 1.84 ? 'none' : null;
}
