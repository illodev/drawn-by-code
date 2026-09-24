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
// circles measured frame by frame (24 fps) on the reference: [cx, cy, rx, ry] per frame
// from the shot's start (the bounding box of everything that is not paper, rim included)
const OPEN = {
    koi: [[520, 546, 163, 161], [533, 576, 236, 235], [541, 587, 273, 272], [544, 594, 288, 287], [544, 597, 290, 290], [544, 597, 290, 290], [544, 598, 290, 290], [544, 598, 290, 290], [544, 594, 288, 287], [543, 591, 272, 272], [537, 572, 229, 228], [522, 544, 144, 144]],
    grasshopper: [[487, 448, 162, 163], [481, 417, 234, 235], [478, 400, 274, 274], [476, 394, 287, 287], [477, 396, 290, 289], [477, 396, 290, 289], [477, 396, 290, 289], [477, 396, 290, 289], [477, 396, 290, 289], [477, 400, 286, 272], [477, 417, 272, 228], [480, 446, 258, 143]],
    jellyfish: [[552, 496, 163, 163], [583, 493, 236, 237], [600, 493, 277, 274], [606, 494, 290, 289], ...Array(11).fill([606, 494, 290, 291]), [606, 493, 288, 289], [600, 493, 272, 274], [581, 493, 230, 230], [550, 494, 143, 143]],
};
const EDIT = [
    [0, 'sonar', null, { sonar: 'first' }], [1.5, 'circle', 'koi', { open: OPEN.koi }],
    [2.0, 'sonar', null, { sonar: 'second' }], [2.75, 'circle', 'grasshopper', { open: OPEN.grasshopper, coin: true }],
    [3.25, 'circle', 'jellyfish', { open: OPEN.jellyfish }],
    [4.0, 'sonar', null, { sonar: 'late' }], [4.5, 'circle', 'owl', { c: [500, 500], r: [270], thenFull: true }],
    [5.0, 'circle', 'bell', { c: [500, 500], r: [360], thenFull: true, over: 'owl' }],
    [5.5, 'circle', 'lighthouse', { c: [500, 500], r: [360], thenFull: true, over: 'bell' }],
    [6.0, 'sonar', null, { sonar: 'late2' }], [6.5, 'circle', 'wolf', { c: [500, 500], r: [385], thenFull: true }],
    [7.0, 'full', 'phone'], [7.25, 'full', 'turntable'], [7.5, 'full', 'frogs'], [7.75, 'full', 'bats'],
    [8.0, 'sonar', null, { sonar: 'short' }],
    [8.25, 'full', 'wave'], [8.5, 'full', 'cat'], [8.75, 'full', 'sunflower'], [9.0, 'full', 'radio'], [9.25, 'full', 'fireworks'],
    [9.5, 'full', 'hummingbird'], [9.75, 'full', 'kettle'], [10.0, 'sonar', null, { sonar: 'short' }],
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
    [16.0, 'mosaic'], [18.0, 'orbits'], [22.958, 'full', 'waterfall', { inks: PINKSET }], [23.083, 'full', 'bicycle', { inks: PINKSET }], [23.208, 'full', 'whale', { inks: PINKSET }],
    [23.333, 'full', 'piano', { inks: PINKSET }], [23.458, 'full', 'rocket', { inks: PINKSET, flip: true }], [23.583, 'full', 'city', { inks: PINKSET }],
    [23.708, 'full', 'planet', { inks: PINKSET }], [23.833, 'full', 'lightning', { inks: PINKSET }], [24.0, 'night'], [26.0, 'title'], [28.1, 'end'],
];
Motion.scene({
    fps: 24,
    duration: 28,
    logical: [1000, 1000],
    uses: ['styles/risograph/riso.js', ...['g1', 'group2', 'g3', 'g4', 'g5', 'g6'].map((u) => ({ src: DIR + 'cards/_' + u + '-util.js', optional: true })), ...CARD_NAMES.map((n) => ({ src: DIR + 'cards/' + n + '.js', optional: true }))],
    fonts: [{ family: 'Hand', src: 'fonts/PatrickHand-Regular.ttf' }],
    audio: { mix: 'out/reference-audio.wav' }, // the reference's track, local only (never committed)
    shots: EDIT.slice(0, -1).map(([a, k, c], i) => [a, EDIT[i + 1][0], c ?? k]),
    setup(env) {
        return { press: Riso.press(env) };
    },
    draw(g, t, env) {
        // cuts land on the frame (24 fps: the film cuts every 1/8 s, which is not on twos);
        // motion inside a shot holds on twos, counted from the cut
        const { press } = env.state, f = Math.floor(t * 24 + 1e-6), tf = f / 24;
        let i = EDIT.findIndex(([a]) => a > tf + 1e-6) - 1;
        if (i < 0) i = EDIT.length - 2;
        const [t0, kind, card, o = {}] = EDIT[i];
        const ld = Math.floor((tf - t0) * 12 + 1e-6), lt = ld / 12, lf = Math.round((tf - t0) * 24);
        // the sonar and the opening circles change every frame; everything else on twos
        const d = i * 1000 + (kind === 'sonar' || kind === 'circle' ? 500 + lf : ld);
        press.begin(d);
        if (kind === 'sonar') sonar(press, lf, o);
        else if (kind === 'circle') circleCard(press, card, lt, ld, o, lf);
        else if (kind === 'full') {
            // o.flip: the reference re-uses some drawings mirrored left–right
            if (o.flip) { press.save(); press.each((g) => g.transform(-1, 0, 0, 1, 1000, 0)); }
            drawCard(press, card, lt);
            if (o.flip) press.restore();
            if (o.ring) whiteRing(press, ld);
        }
        else if (kind === 'mosaic') mosaic(press, lt);
        ORBIT_DOT = null;
        if (kind === 'orbits') orbits(press, lt);
        else if (kind === 'night') night(press, lt);
        else if (kind === 'title') title(press, lt);
        if (ORBIT_DOT !== 'none') dot(press, ORBIT_DOT ?? [500, 500]);
        press.print(g, { key: d, inks: kind === 'mosaic' && lt >= 1.0 ? MOSAIC_BLUE : o.inks, spread: kind === 'night' ? 0.3 : undefined });
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
// the blue dot at the centre: navy over blue and pink discs, each a little off (measured at
// 3×: blue peeks out lower left, pink upper right)
function dot(press, [x, y]) {
    for (const [ink, v, dx, dy] of [['blue', 0.95, -4, 3], ['pink', 0.9, 4, -2], ['navy', 1, 0, 0]]) {
        const g = press.plate(ink);
        g.fillStyle = T(v);
        g.beginPath();
        g.arc(x + dx, y + dy, 18, 0, 7);
        g.fill();
    }
}
// a brush ring: an annulus whose width swells and thins round the circle, slightly out of
// round (the reference's rings are painted, not stroked)
function brushRing(g, cx, cy, r, w, seed, wave = 0) {
    const rr = Motion.rng('br' + seed), p1 = rr() * 6.28, p2 = rr() * 6.28, p3 = rr() * 6.28, n = Math.max(48, Math.round(r * 0.9));
    const at = (a, side) => {
        const rad = r * (1 + 0.009 * Math.sin(2 * a + p1) + 0.005 * Math.sin(5 * a + p2)) + wave * Math.sin(9 * a + p3);
        const hw = (w / 2) * (1 + 0.32 * Math.sin(a + p2) + 0.14 * Math.sin(3 * a + p3));
        return [cx + Math.cos(a) * (rad + side * hw), cy + Math.sin(a) * (rad + side * hw)];
    };
    g.beginPath();
    for (let i = 0; i <= n; i++) { const [px, py] = at((i / n) * Math.PI * 2, 1); i ? g.lineTo(px, py) : g.moveTo(px, py); }
    for (let i = n; i >= 0; i--) { const [px, py] = at((i / n) * Math.PI * 2, -1); g.lineTo(px, py); }
    g.fill('evenodd');
}
// a fleck: a tapered brush arc round the dot at radius r, centred on angle a; far ones are
// long, thin and wavy, near ones short fat crescents (arc length ≈ 170 units, measured)
function fleck(g, r, a, w, seed) {
    const rr = Motion.rng('fk' + seed), ph = rr() * 6.28, span = Math.min(2.0, 170 / r), wav = Math.max(0, (r - 250) / 250) * 3.5, n = 40;
    const at = (s, side) => {
        const ang = a + (s - 0.5) * span, hw = (w / 2) * Math.pow(Math.sin(Math.PI * s), 0.8);
        const rad = r + wav * Math.sin(s * 9.4 + ph) + side * hw;
        return [500 + Math.cos(ang) * rad, 500 + Math.sin(ang) * rad];
    };
    g.beginPath();
    for (let i = 0; i <= n; i++) { const [px, py] = at(i / n, 1); i ? g.lineTo(px, py) : g.moveTo(px, py); }
    for (let i = n; i >= 0; i--) { const [px, py] = at(i / n, -1); g.lineTo(px, py); }
    g.fill();
}
// the sonar, measured frame by frame (24 fps, radii in units round the dot):
//   rings: born on the listed frames, radius and brush width by age in frames
//   flecks: groups of three tapered arcs at an angle, each arc [first frame, radii per
//   frame], converging on the dot (the reference's «waves»)
const D2R = Math.PI / 180;
const SONAR = {
    first: {
        births: [0, 4, 8], R: [0, 155, 270, 373, 465, 548, 618, 677], W: [0, 17, 16, 15, 14, 13, 12, 11], wave: 0,
        groups: [
            [-155, 22, [[14, [515, 510, 497, 482, 470, 452, 430, 410, 385]], [16, [520, 512, 507, 492, 482, 465, 442]], [19, [517, 515, 512, 497]]]],
            [-55, 30, [[23, [492, 480, 462, 440, 418, 387, 360]], [23, [517, 512, 505, 485, 467, 430, 410, 400]], [26, [520, 505, 492, 470, 450]]]],
            [65, 35, [[24, [590, 560, 527, 497, 452, 415, 362, 315, 260, 205, 142, 82]], [26, [590, 562, 535, 502, 462, 422, 377, 327, 272, 217]], [29, [572, 542, 512, 472, 432, 385, 335]]]],
        ],
    },
    second: { ref: 'first', groups: [[-105, 17, [[8, [532, 497, 455, 410, 362, 312, 262, 205, 145, 85]], [11, [502, 462, 422, 377, 330, 277, 220]], [13, [510, 477, 435, 387, 340]]]]] },
    late: {
        births: [1, 4, 7], R: [110, 210, 290, 370, 450, 495, 540, 590, 620, 660], W: [6, 5.5, 5, 4.6, 4.2, 3.9, 3.6, 3.3, 3, 2.8], wave: 2,
        groups: [[35, 11, [[3, [545, 538, 525, 505, 475, 395, 300, 160]], [5, [555, 540, 520, 500, 470, 400, 280]], [7, [560, 545, 520, 470, 380]]]]],
    },
    late2: { ref: 'late', groups: [[-70, 11, [[3, [545, 538, 525, 505, 475, 395, 300, 160]], [5, [555, 540, 520, 500, 470, 400, 280]], [7, [560, 545, 520, 470, 380]]]]] },
    short: {
        births: [1, 4], R: [115, 220, 295, 372, 450], W: [9, 8.5, 8, 7.5, 7], wave: 0,
        groups: [[115, 5, [[-3, [545, 530, 510, 470, 445, 410, 300, 160, 90]], [-1, [555, 540, 500, 440, 350, 230]], [0, [560, 545, 520, 470, 390, 290]]]]],
    },
};
function sonar(press, lf, o) {
    const v = SONAR[o.sonar ?? 'first'], base = v.ref ? SONAR[v.ref] : v, b = press.plate('blue');
    b.fillStyle = T(0.97);
    for (const bd of base.births) {
        const age = lf - bd;
        if (age < 0 || age >= base.R.length) continue;
        if (base.R[age] === 0) {
            // the birth frame: a blue halo round the dot (40, 37, 34), later ones already
            // pulling away from it (a paper crescent lower left)
            b.beginPath(); b.arc(500, 500, 40 - bd * 0.75, 0, 7); b.fill();
            if (bd > 0) press.knockout((g) => { g.beginPath(); g.arc(497, 503, 23, 0, 7); g.fill(); });
            continue;
        }
        brushRing(b, 500, 500, base.R[age], base.W[age], 'sonar' + (o.sonar ?? '') + bd, base.wave * Math.max(0, age - 5));
    }
    for (const [ang, end, arcs] of v.groups) {
        if (lf > end) continue;
        arcs.forEach(([f0, rs], k) => {
            const r = rs[lf - f0];
            if (r == null) return;
            fleck(b, r, ang * D2R, (k === 0 ? 10 : 6) * (r < 300 ? 1.2 : 0.8), 'fk' + ang + k + lf);
        });
    }
}
// a card opening in a circle: radius per drawing from o.r (the last one holds); over the
// previous card (o.over) or the paper; a blue rim; 'thenFull' goes full frame after one drawing
function circleCard(press, name, lt, ld, o, lf) {
    if (o.thenFull && ld >= 1) return drawCard(press, name, lt);
    let cx, cy, rx, ry;
    if (o.open) [cx, cy, rx, ry] = o.open[Math.min(lf, o.open.length - 1)].map((v, i) => (i < 2 ? v : v - 5)); // the rim's outer edge → the circle
    else { rx = ry = o.r[Math.min(ld, o.r.length - 1)]; [cx, cy] = o.c; }
    if (o.over) drawCard(press, o.over, lt + 0.5);
    const path = (g) => g.ellipse(cx, cy, rx, ry, 0, 0, 7);
    // the coin: a navy edge under the disc, showing as it turns (ry < rx)
    if (o.coin) {
        const n = press.plate('navy'), b = press.plate('blue', 'screen');
        const edge = Math.max(10, (rx - ry) * 0.25 + 14);
        n.fillStyle = T(0.85); b.fillStyle = T(0.5);
        for (const g of [n, b]) { g.beginPath(); g.ellipse(cx, cy + edge, rx, ry, 0, 0, 7); g.fill(); }
    }
    press.knockout((g) => { g.beginPath(); path(g); g.fill(); });
    // the whole illustration, scaled down into the circle (not a crop: the jellyfish at
    // 3.6 s shows its bell, tentacles and both small jellies inside the circle)
    const k = (rx * 2 * 1.06) / 1000;
    press.save();
    press.clip((g) => path(g));
    press.each((g) => { g.translate(cx, cy); g.scale(k, (k * ry) / rx); g.translate(-500, -500); });
    drawCard(press, name, lt);
    press.restore();
    const bp = press.plate('blue');
    bp.save(); bp.strokeStyle = T(1); bp.lineWidth = 8; bp.beginPath(); path(bp); bp.stroke(); bp.restore();
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
// a call and answer between two bodies, measured frame by frame (18.0–22.1): one sends out
// three rings that ease outwards (thick, thinning as they grow) and leave the frame; when
// they reach the other, it pings (a small ring round it for a few frames) and answers.
// Positions per frame, in s after 18: the dot, then the pink planet (enters at 19.75).
const DOT_PATH = [[0, 500, 500], [1.583, 500, 500], [1.625, 520, 481], [1.667, 537, 468], [1.708, 554, 454], [1.75, 569, 439], [1.792, 585, 426], [1.833, 603, 411], [1.875, 617, 400], [1.917, 631, 385], [1.958, 648, 372], [2.0, 657, 367], [2.042, 669, 357], [2.083, 678, 348], [2.125, 685, 343], [2.167, 689, 336], [2.208, 694, 331], [2.25, 698, 330], [5, 698, 330]];
const PLANET_PATH = [[1.583, -40, 1040], [1.75, -20, 925], [1.792, 52, 872], [1.833, 89, 841], [1.875, 122, 811], [1.917, 159, 783], [1.958, 193, 756], [2.0, 219, 731], [2.042, 241, 709], [2.083, 259, 693], [2.125, 276, 678], [2.167, 289, 667], [2.208, 296, 659], [2.25, 300, 657], [5, 300, 657]];
const along = (P, t) => { if (t <= P[0][0]) return [P[0][1], P[0][2]]; let i = 0; while (i < P.length - 2 && t >= P[i + 1][0]) i++; const [t0, x0, y0] = P[i], [t1, x1, y1] = P[i + 1], u = Ease.seg(t, t0, t1); return [x0 + (x1 - x0) * u, y0 + (y1 - y0) * u]; };
// emissions: [first ring's birth, emitter ('corner' | 'dot' | 'planet'), start radius, reach]
// (three rings, 1/12 s apart; r = start + reach·(1 − e^(−age/0.25)))
const EMIT = [[0.0, 'corner', 260, 900], [1.083, 'dot', 175, 560], [1.583, 'planet', 200, 750], [2.083, 'dot', 150, 620], [2.583, 'planet', 150, 650], [3.083, 'dot', 150, 620], [3.583, 'planet', 220, 650]];
// pings: [from, to, body, radius]; the corner glows (a halftone pink radial) as it sends
const PINGS = [[0.458, 0.792, 'dot', 62], [1.833, 2.083, 'dot', 52], [2.5, 2.667, 'planet', 55], [2.917, 3.042, 'dot', 55], [3.333, 3.5, 'planet', 55], [3.75, 3.917, 'dot', 55]];
const GLOWS = [[0, 0.125], [1.5, 1.625]];
function orbits(press, lt) {
    const tq = lt, blue = along(DOT_PATH, tq), pinkP = tq >= 1.583 ? along(PLANET_PATH, tq) : null;
    const bp = press.plate('blue'), pp = press.plate('pink'), pS = press.plate('pink', 'screen');
    for (const [a, b] of GLOWS) {
        if (tq < a || tq >= b) continue;
        pS.fillStyle = Riso.radial(pS, 0, 1000, 0, 360, 0.95, 0);
        pS.fillRect(0, 580, 420, 420);
    }
    const at = { corner: [-40, 1040], dot: blue, planet: pinkP ?? [-20, 925] };
    for (const [t0, who, r0, reach] of EMIT) {
        for (let k = 0; k < 3; k++) {
            const age = tq - t0 - k / 12;
            if (age < 0 || age > (who === 'corner' ? 0.95 : 0.6) || tq >= 4.0) continue;
            const r = (r0 - k * 40) + reach * (1 - Math.exp(-age / 0.25));
            const w = Math.max(3, (12 - k * 2.5) * (1 - age * 0.7));
            Riso.ring(who === 'dot' ? bp : pp, at[who][0], at[who][1], r, w, 'orb' + t0 + k, { color: T(0.97), wobble: 0.004 });
        }
    }
    for (const [a, b, who, r] of PINGS) {
        if (tq < a || tq >= b || (who === 'planet' && !pinkP)) continue;
        const c = who === 'dot' ? blue : pinkP;
        Riso.ring(who === 'dot' ? bp : pp, c[0], c[1], r * (0.85 + 0.15 * Ease.seg(tq, a, b)), 4.5, 'ping' + a, { color: T(0.95) });
    }
    if (pinkP) {
        pp.fillStyle = T(1);
        pp.beginPath(); pp.arc(pinkP[0], pinkP[1], 19, 0, 7); pp.fill();
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
        drawCard(press, 'flower', tq - 4.12); // the card grows on its own (measured 22.12 → 22.45)
        Riso.ring(bp, 500, 500, 250 + (tq - 4.17) * 60, 5, 'fl1', { color: T(0.9) });
        Riso.ring(pp, 480, 520, 330 + (tq - 4.17) * 80, 4, 'fl2', { color: T(0.9) });
    }
    ORBIT_DOT = blue;
}
var ORBIT_DOT = null;

// ------------------------------------------------------------------ the night sky (24–26)
function night(press, lt) {
    // measured on the 24–26 s frames: a navy ground (≈ [24,47,126]) with purple clouds in
    // braided ribbons (less navy, a little pink: ≈ [67,54,134]), no visible halftone dots
    // (solid plates at partial density), a diagonal milky way of white dust
    const n = press.plate('navy'), pk = press.plate('pink');
    n.fillStyle = T(1);
    n.fillRect(0, 0, 1000, 1000);
    pk.fillStyle = T(0.16);
    pk.fillRect(0, 0, 1000, 1000);
    const rib = Motion.rng('ribbons'), ribbons = [];
    for (let k = 0; k < 9; k++) ribbons.push([k * 125 - 60 + rib() * 40, 60 + rib() * 50, 150 + rib() * 120, rib() * 6.28, 30 + rib() * 25]);
    const ribbon = (g, [x0, amp, lam, ph, w], drift) => {
        g.lineWidth = w;
        g.beginPath();
        for (let y = -40; y <= 1040; y += 20) { const x = x0 + amp * Math.sin(y / lam * 6.28 * 0.5 + ph + drift); y === -40 ? g.moveTo(x, y) : g.lineTo(x, y); }
        g.stroke();
    };
    const drift = lt * 0.4;
    for (const g of [pk]) {
        g.save();
        g.filter = 'blur(12px)';
        g.lineCap = 'round';
        if (g === n) { g.globalCompositeOperation = 'destination-out'; g.strokeStyle = 'rgba(0,0,0,0.14)'; }
        else g.strokeStyle = T(0.32);
        ribbons.forEach((r) => ribbon(g, r, drift));
        g.restore();
    }
    // the ground's grain (at 3× the navy is pocked with paper and pink pixels, not smooth)
    const gr = Motion.rng('grain' + Math.floor(lt * 12));
    press.knockout((g) => { for (let k = 0; k < 17000; k++) { g.globalAlpha = 0.15 + gr() * 0.35; g.fillRect(gr() * 1000, gr() * 1000, 1.1, 1.1); } });
    pk.save(); pk.fillStyle = T(0.7);
    for (let k = 0; k < 10000; k++) pk.fillRect(gr() * 1000, gr() * 1000, 1.1, 1.1);
    pk.restore();
    // stars: white dust, dense along the diagonal band (bottom left → top right), sparse
    // elsewhere; a few pink ones
    const r = Motion.rng('stars');
    press.knockout((g) => {
        for (let k = 0; k < 9000; k++) {
            const x = r() * 1000, y = r() * 1000, band = Math.exp(-Math.pow((x + y - 1000) / 230, 2)), keep = r();
            if (keep > 0.18 + 0.82 * band) continue;
            g.globalAlpha = 0.45 + r() * 0.55;
            g.beginPath(); g.arc(x, y, 0.6 + r() * 1.1, 0, 7); g.fill();
        }
    });
    pk.save(); pk.fillStyle = T(0.9);
    for (let k = 0; k < 260; k++) { const x = r() * 1000, y = r() * 1000; pk.beginPath(); pk.arc(x, y, 0.8 + r() * 1.3, 0, 7); pk.fill(); }
    pk.restore();
    // the two bodies, measured per 0.25 s, drawing together at the centre
    const path = (P) => { let i = 0; while (i < P.length - 2 && lt + 24 >= P[i + 1][0]) i++; const [t0, x0, y0] = P[i], [t1, x1, y1] = P[i + 1], u = Ease.seg(lt + 24, t0, t1); return [x0 + (x1 - x0) * u, y0 + (y1 - y0) * u]; };
    const B = path([[24, 721, 317], [24.25, 666, 361], [24.5, 621, 393], [24.75, 576, 426], [25, 542, 457], [25.25, 527, 470], [25.5, 523, 474], [26, 520, 475]]);
    const Pk = path([[24, 276, 681], [24.25, 334, 640], [24.5, 379, 605], [24.75, 420, 573], [25, 457, 541], [25.25, 471, 528], [25.5, 475, 524], [26, 477, 523]]);
    // each body sends out rings that ease out to a size (τ ≈ 0.12 s) and stay until the one
    // after next is born (measured radii: blue 109, 154, 198, 220, 228…; pink 94, 139, 169, 183, 191…)
    const pulses = [[B, 'blue', [[0, 230], [0.6, 150], [1.12, 112], [1.62, 100]]], [Pk, 'pink', [[0.25, 190], [0.85, 118], [1.35, 112], [1.87, 110]]]];
    for (const [[x, y], ink, rings] of pulses) {
        rings.forEach(([born, max], k) => {
            const age = lt - born, next2 = rings[k + 2]?.[0] ?? 9;
            if (age < 0 || lt >= next2) return;
            const rad = max * (1 - Math.exp(-(age + 0.01) / 0.12));
            press.knockout((g) => { g.lineWidth = 11; g.beginPath(); g.arc(x, y, rad, 0, 7); g.stroke(); });
            Riso.ring(press.plate(ink), x, y, rad, 10, 'np' + ink + k, { color: T(ink === 'pink' ? 0.95 : 0.8), wobble: 0.004 });
        });
    }
    // the small planets: dots of light pink or blue in a paper halo, a third ringed, a few
    // four-dot clusters; more and more from 24.6 (≈ 150 by 25.9)
    const rp = Motion.rng('planets'), count = Math.floor(Ease.seg(lt, 0.55, 1.9) * 150);
    for (let k = 0; k < 150; k++) {
        const x0 = rp() * 1000, y0 = rp() * 1000, ink = rp() < 0.55 ? 'pink' : 'blue', sz = 5 + rp() * 4, kind = rp();
        if (k >= count) continue;
        const x = x0 + (500 - x0) * 0.08 * Ease.seg(lt, 0.55, 2), y = y0 + (500 - y0) * 0.08 * Ease.seg(lt, 0.55, 2);
        const pl = press.plate(ink);
        if (kind < 0.08) {
            // a cluster of four
            press.knockout((g) => { g.beginPath(); g.arc(x, y, sz * 2.2, 0, 7); g.fill(); });
            pl.fillStyle = T(0.9);
            for (let q = 0; q < 4; q++) { pl.beginPath(); pl.arc(x + Math.cos(q * 1.57 + 0.4) * sz * 0.9, y + Math.sin(q * 1.57 + 0.4) * sz * 0.9, sz * 0.75, 0, 7); pl.fill(); }
            continue;
        }
        press.knockout((g) => { g.beginPath(); g.arc(x, y, sz + 2.5, 0, 7); g.fill(); });
        pl.fillStyle = T(0.85); pl.beginPath(); pl.arc(x, y, sz, 0, 7); pl.fill();
        if (kind > 0.62) {
            const rr2 = sz * (2.6 + rp() * 0.6);
            press.knockout((g) => { g.lineWidth = 3; g.beginPath(); g.arc(x, y, rr2, 0, 7); g.stroke(); });
            Riso.ring(press.plate(ink, 'screen'), x, y, rr2, 2.4, 'pr' + k, { color: T(0.75) });
        }
    }
    // the bodies: a yellow ring in a paper halo round a blue or pink core
    for (const [[x, y], ink] of [[B, 'blue'], [Pk, 'pink']]) {
        press.knockout((g) => { g.beginPath(); g.arc(x, y, 36, 0, 7); g.fill(); });
        const yy = press.plate('yellow');
        yy.fillStyle = T(0.95); yy.beginPath(); yy.arc(x, y, 31, 0, 7); yy.fill();
        press.knockout((g) => { g.beginPath(); g.arc(x, y, 21, 0, 7); g.fill(); });
        const c = press.plate(ink);
        c.fillStyle = T(1); c.beginPath(); c.arc(x, y, 19, 0, 7); c.fill();
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
