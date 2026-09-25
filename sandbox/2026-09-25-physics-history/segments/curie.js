// Segment FIS-05 of physics-history (20–26 s of the piece; local time 0–6): Marie Curie
// measures an invisible property of matter. The light mark that closed Faraday's scene keeps
// running along its scale; the camera pulls back and the scale turns out to be the reading
// scale of a quadrant electrometer (lamp and scale: a small mirror on the suspension throws
// the lamp's light onto it). Curie, at her bench in the shed on rue Lhomond, sets a dish of
// dark mineral powder on the lower plate of an ionisation chamber: the mark settles at a
// reading. She swaps it for a second preparation and the mark goes further. Then a blue
// explanatory layer shows events leaving the sample and ionising the air between the plates
// (what the instrument detects), and one of those tracks stretches into the amber line that
// opens Einstein's scene.
//
//   Seg.curie.init(env) → state
//   Seg.curie.draw(press, tq, st, ctx)    tq: local time (on twos); ctx.st.newtonFaraday is
//                                         used for the very first drawing (the join)
//   Seg.curie.atlas(press, tq, st)        Curie at her bench, for the finale's lens
var Seg = globalThis.Seg ?? (globalThis.Seg = {});
(() => {
const { lerp, seg } = Ease;
const TAU = Math.PI * 2;

// ── separations ──────────────────────────────────────────────────────────────────────────
const AMBER = { yellow: 1, 'pink.s': 0.55 };
const BRASS = { yellow: 1, 'pink.s': 0.22, 'navy.s': 0.08 };
const BRASS_LT = { yellow: 1, 'pink.s': 0.1 };
const BRASS_SH = { yellow: 1, 'pink.s': 0.4, 'navy.s': 0.45 };
const BRASS_DK = { yellow: 1, 'pink.s': 0.55, 'navy.s': 0.72 };
const WOOD = { 'yellow.s': 0.85, 'pink.s': 0.6, 'navy.s': 0.45 };
const WOOD_TOP = { 'yellow.s': 0.72, 'pink.s': 0.4, 'navy.s': 0.12 };
const WOOD_EDGE = { 'yellow.s': 0.85, 'pink.s': 0.62, 'navy.s': 0.4 };
const WOOD_DK = { 'yellow.s': 0.9, 'pink.s': 0.75, 'navy.s': 0.8 };
const GRAIN = { 'pink.s': 0.8, 'navy.s': 0.65, 'yellow.s': 0.9 };
const IRON = { navy: 1, yellow: 0.9, 'blue.s': 0.35 };          // cast iron, ebonite
const IRON_LT = { navy: 1, 'yellow.s': 0.6, 'blue.s': 0.55 };   // its sheen
const GLASS = { 'blue.s': 0.28, 'yellow.s': 0.3, 'navy.s': 0.32 }; // old glass: dark, a little green
const TINT = { 'yellow.s': 0.22, 'blue.s': 0.12 };                // clear glass over a dark ground
const PORCELAIN = { 'blue.s': 0.1, 'yellow.s': 0.06 };
const PORC_SH = { 'blue.s': 0.35, 'navy.s': 0.18 };
const ORE = { navy: 1, yellow: 0.85, 'pink.s': 0.3 };           // pitchblende: grey-black
const ORE2 = { navy: 0.95, yellow: 1, pink: 0.6 };              // the second preparation: brown-black
const DRESS = { navy: 1, yellow: 1, 'pink.s': 0.4, 'blue.s': 0.15 }; // black wool
const DRESS_LIT = { 'navy.s': 0.72, 'yellow.s': 0.85, 'blue.s': 0.35, 'pink.s': 0.45 };
const DRESS_DK = { navy: 1, yellow: 1, pink: 0.7 };
const DRESS_RIM = { navy: 1, yellow: 1, pink: 0.85, 'blue.s': 0.45 };
const SILK = { 'yellow.s': 0.45, 'blue.s': 0.55, 'navy.s': 0.3 }; // silk-covered wire
const EXPL = { 'blue.s': 0.22 };                                  // the explanatory layer

// ── the lab fades in from the dark of the close shot: a partial knockout and scaled inks,
// so light things cross-fade from the ground instead of popping (FADE is set per drawing)
let FADE = 1;
// the world rectangle in view (set per drawing): pieces outside it are not painted
let VIEW = null;
const V = (x0, y0, x1, y1) => !VIEW || (x1 >= VIEW[0] && x0 <= VIEW[2] && y1 >= VIEW[1] && y0 <= VIEW[3]);
const fspec = (spec, f) => {
    if (f >= 1) return spec;
    const o = {};
    for (const [k, v] of Object.entries(spec)) o[k] = typeof v === 'function' ? v : v * f;
    return o;
};
function put(press, path, spec, o = {}) {
    if (FADE <= 0.001) return;
    if (FADE >= 1) return Ph.put(press, path, spec, o);
    if (o.knock !== false) press.knockout((g) => { g.globalAlpha = FADE; g.beginPath(); path(g); g.fill(); });
    Ph.ink(press, path, fspec(spec, FADE));
}
const ink = (press, path, spec) => { if (FADE > 0.001) Ph.ink(press, path, fspec(spec, FADE)); };
const line = (press, pts, w, spec, o) => put(press, (g) => Ph.poly(g, Ph.outline(pts, w)), spec, o);
const knock = (press, path, a = 1) => { if (FADE > 0.001) press.knockout((g) => { g.globalAlpha = a * FADE; g.beginPath(); path(g); g.fill(); }); };
const { smooth, poly, taper, circle, ellipse } = Ph;

// ── geometry (world units; the wide shot is the world at zoom 1) ─────────────────────────
// The closing scale of Faraday's scene lives in its own units ("scale units" = that shot's
// screen): the mark at x, y = 388.4, ticks every 34. In the world it is Z0 times smaller.
// The close shot's beam came from (-60, 120) off frame: that is the mirror.
const Z0 = 4;
const SY = 388.4;                        // the scale's centre line (scale units)
const MIRROR_L = [-60, 120];             // the mirror in scale units (the close shot's source)
const MIRROR = [1020, 501.5];            // …and in the world: inside the electrometer's lantern
const P0 = [MIRROR[0] - (MIRROR_L[0] - 800) / Z0, MIRROR[1] - (MIRROR_L[1] - SY) / Z0]; // world of (800, SY)
const toW = (s) => [P0[0] + (s[0] - 800) / Z0, P0[1] + (s[1] - SY) / Z0];
const S_L = 800 + (978 - P0[0]) * Z0;    // the strip's left end (-228), hidden behind the drum
const S_R = 2100;                         // its right end
const H = [325, 330], NS = 1.1;          // Marie's head centre and scale
const BENCH = 600, FLOOR = 850;
const CH = { x: 760, lo: 558, hi: 452, rx: 64, ry: 11, t: 7 };   // the chamber's two plates
const EL = { x: 1020 };                  // the electrometer
const LAMP = { x: 1130, y: 596 };        // the scale's lamp (base on the bench)
const DISH = { rx: 24, h: 9 };
const ON_PLATE = [CH.x, CH.lo - 2];      // a dish's bottom centre on the lower plate
const SPOT_A = [646, 597], SPOT_B = [566, 598]; // where the dishes wait on the bench

// readings (scale units): at rest, first sample, second preparation
const R_REST = 950, R1 = 1300, R2 = 1750;
// the hands' timeline (local s, on twelfths)
const TL = { go1: 0.58, set1: 0.92, back1: 1.33, go2: 1.5, grip1: 1.83, aside: 2.17, grip2: 2.5, set2: 2.92, back2: 3.33 };

// ── camera: [t, zoom, centre x, centre y]; zoom interpolates in log space ─────────────────
const CAMK = [
    [0, Z0, P0[0], P0[1] + (450 - SY) / Z0],
    [0.92, 1.0, 800, 452],
    [1.5, 1.06, 820, 466],
    [3.5, 1.2, 870, 482],
    [5.3, 2.0, 900, 505],
    [6.0, 2.1, 904, 505],
];
function camAt(lt) {
    let i = 0;
    while (i < CAMK.length - 2 && lt >= CAMK[i + 1][0]) i++;
    // the pull-back out of the close shot eases as a smootherstep: it leaves the held frame
    // as gently as the cubic but peaks lower
    const x = seg(lt, CAMK[i][0], CAMK[i + 1][0]), a = CAMK[i], b = CAMK[i + 1];
    const u = i === 0 ? x * x * x * (x * (6 * x - 15) + 10) : Ease.inOut(x);
    return { z: Math.exp(lerp(Math.log(a[1]), Math.log(b[1]), u)), c: [lerp(a[2], b[2], u), lerp(a[3], b[3], u)] };
}
const viewOf = (cam) => [cam.c[0] - 820 / cam.z, cam.c[1] - 470 / cam.z, cam.c[0] + 820 / cam.z, cam.c[1] + 470 / cam.z];
const toScreen = (cam, p) => [800 + (p[0] - cam.c[0]) * cam.z, 450 + (p[1] - cam.c[1]) * cam.z];

// ── the hand: poses by the pinch point (thumb and index tips), elbow, wrist roll ─────────
const POSE = {
    ready: { p: [612, 506], e: [470, 548], r: 0.12, open: 0 },
    plate: { p: [ON_PLATE[0] - DISH.rx + 2, ON_PLATE[1] - DISH.h], e: [566, 532], r: 0.2, open: 0 },
    rest: { p: [478, 593], e: [376, 588], r: 0.38, open: 0.35 },
    spotA: { p: [SPOT_A[0] - DISH.rx + 2, SPOT_A[1] - DISH.h], e: [470, 584], r: 0.14, open: 0 },
    spotB: { p: [SPOT_B[0] - DISH.rx + 2, SPOT_B[1] - DISH.h], e: [430, 590], r: 0.12, open: 0 },
};
// moves: [t0, t1, from, to, lift (an arc up while carrying)]
const MOVES = [
    [TL.go1, TL.set1, 'ready', 'plate', 26],
    [TL.set1 + 0.08, TL.back1, 'plate', 'rest', 14],
    [TL.go2, TL.grip1, 'rest', 'plate', 18],
    [TL.grip1 + 0.04, TL.aside, 'plate', 'spotA', 34],
    [TL.aside + 0.04, TL.grip2, 'spotA', 'spotB', 20],
    [TL.grip2 + 0.04, TL.set2, 'spotB', 'plate', 34],
    [TL.set2 + 0.08, TL.back2, 'plate', 'rest', 14],
];
function handAt(lt) {
    let cur = POSE.ready, pose = null;
    for (const [t0, t1, a, b, lift] of MOVES) {
        if (lt < t0) { pose = pose ?? POSE[a]; break; }
        if (lt <= t1) {
            const u = Ease.inOut(seg(lt, t0, t1)), A = POSE[a], B = POSE[b];
            pose = { p: [lerp(A.p[0], B.p[0], u), lerp(A.p[1], B.p[1], u) - lift * Math.sin(Math.PI * u)], e: [lerp(A.e[0], B.e[0], u), lerp(A.e[1], B.e[1], u) - lift * 0.4 * Math.sin(Math.PI * u)], r: lerp(A.r, B.r, u) };
            break;
        }
        cur = POSE[b];
    }
    pose = pose ?? cur;
    // fingers: open after letting go, close before a grip
    const open = keysAt([[0, 0], [TL.set1, 0], [TL.set1 + 0.12, 0.8], [TL.back1, 0.35], [TL.go2, 0.35], [TL.grip1 - 0.14, 0.8], [TL.grip1, 0],
        [TL.aside, 0], [TL.aside + 0.1, 0.8], [TL.grip2 - 0.12, 0.8], [TL.grip2, 0], [TL.set2, 0], [TL.set2 + 0.12, 0.8], [TL.back2, 0.35]], lt);
    // breathing and a small tremor of attention
    const br = Math.sin(lt * 2.4) * 1.2;
    return { p: [pose.p[0], pose.p[1] + br], e: [pose.e[0], pose.e[1] + br], r: pose.r, open: Math.min(1, open) };
}
// scalar keyframes [[t, v], …] with inOut between them
function keysAt(k, t) {
    let i = 0;
    while (i < k.length - 1 && t >= k[i + 1][0]) i++;
    if (i === k.length - 1) return k[i][1];
    return lerp(k[i][1], k[i + 1][1], Ease.inOut(seg(t, k[i][0], k[i + 1][0])));
}
// where each dish is: 'hand', or a bench/plate position
function dishesAt(lt) {
    const d1 = lt < TL.set1 ? 'hand' : lt < TL.grip1 ? ON_PLATE : lt < TL.aside ? 'hand' : SPOT_A;
    const d2 = lt < TL.grip2 ? SPOT_B : lt < TL.set2 ? 'hand' : ON_PLATE;
    return { d1, d2 };
}
// the reading's target over time (the mark follows it through a damped response)
function target(t) {
    if (t < TL.set1) return R_REST;
    if (t < TL.grip1 + 0.05) return R1;
    if (t < TL.set2) return R_REST;
    return R2;
}
// Marie's gaze: the dish while she handles it, the scale while the mark moves
function gazeAt(lt) {
    const keys = [[0, [1, 0.35]], [0.55, [1, 0.8]], [1.0, [1, 0.8]], [1.12, [1, 0.1]], [1.48, [1, 0.1]], [1.6, [1, 0.8]], [3.0, [1, 0.8]], [3.12, [1, 0.12]], [3.5, [1, 0.12]], [3.66, [1, 0.7]]];
    let i = 0;
    while (i < keys.length - 1 && lt >= keys[i + 1][0]) i++;
    if (i === keys.length - 1) return keys[i][1];
    const a = keys[i], b = keys[i + 1], u = Ease.inOut(seg(lt, a[0], b[0]));
    return [lerp(a[1][0], b[1][0], u), lerp(a[1][1], b[1][1], u)];
}

// ── the room ───────────────────────────────────────────────────────────────────────────
// the shed's wall: tarred vertical planks with seams, nail heads, two girts
function wall(press) {
    put(press, (g) => g.rect(-400, -300, 2600, 1170), { blue: 0.85, 'navy.s': 0.62, 'pink.s': 0.2, 'yellow.s': 0.12 });
    const r = Motion.rng('curie-planks');
    for (let i = 0, x = -400; x < 2200; i++, x += 66) {
        const k = r(), gs = [r(), r(), r(), r(), r(), r()];
        if (!V(x, -300, x + 66, 870)) continue;
        ink(press, (g) => g.rect(x + 2, -300, 62, 1170), { 'navy.s': 0.08 + k * 0.2 });
        line(press, [[x, -300], [x + 1, 870]], 3, { navy: 1 });
        for (let j = 0; j < 2; j++) {
            const gx = x + 10 + gs[j * 3] * 44, gy = -200 + gs[j * 3 + 1] * 900;
            line(press, [[gx, gy], [gx + (gs[j * 3 + 2] - 0.5) * 6, gy + 120 + gs[j * 3 + 2] * 160]], taper(2), { 'navy.s': 0.55, 'pink.s': 0.2 });
        }
    }
    // girts: a top beam and a rail at shoulder height, with nail heads
    for (const [y, h] of [[20, 34], [408, 22]]) {
        put(press, (g) => g.rect(-400, y, 2600, h), { 'yellow.s': 0.55, 'pink.s': 0.45, 'navy.s': 0.7 });
        put(press, (g) => g.rect(-400, y, 2600, 4), { 'yellow.s': 0.5, 'pink.s': 0.3, 'navy.s': 0.35 });
        ink(press, (g) => g.rect(-400, y + h, 2600, 10), { 'navy.s': 0.5 });
        for (let x = -367; x < 2200; x += 66) if (V(x - 4, y, x + 4, y + h)) put(press, circle(x, y + h / 2, 3), { navy: 1, 'yellow.s': 0.4 });
    }
}
// floorboards
function floor(press) {
    put(press, (g) => g.rect(-400, FLOOR, 2600, 300), WOOD_DK);
    put(press, (g) => g.rect(-400, FLOOR - 5, 2600, 8), { 'yellow.s': 0.6, 'pink.s': 0.45, 'navy.s': 0.8 });
    for (let i = 0; i < 4; i++) line(press, [[-400, FLOOR + 14 + i * i * 9 + i * 8], [2200, FLOOR + 14 + i * i * 9 + i * 8]], 1.8 + i * 0.5, { navy: 1 });
    const r = Motion.rng('curie-floor');
    for (let i = 0; i < 30; i++) {
        const xx = -400 + r() * 2600, yy = FLOOR + 16 + r() * 60;
        line(press, [[xx, yy], [xx + 60 + r() * 120, yy + 1]], 1.6, GRAIN);
    }
}
// a tall window of small panes: night outside, rain running down the glass
function shedWindow(press, tq) {
    const x = 560, y = 78, w = 330, h = 262;
    put(press, (g) => g.rect(x - 20, y - 20, w + 40, h + 40), WOOD_DK);
    put(press, (g) => g.rect(x - 20, y - 20, w + 40, 5), { 'yellow.s': 0.5, 'pink.s': 0.35, 'navy.s': 0.4 });
    put(press, (g) => g.rect(x, y, w, h), { navy: 1, 'blue.s': 0.45 });
    press.save();
    press.clip((g) => g.rect(x, y, w, h));
    // a faint town glow low in the sky, roofs in silhouette
    ink(press, (g) => g.rect(x, y, w, h), { 'pink.s': (g) => Riso.ramp(g, 0, y + h * 0.4, 0, y + h, 0, 0.35 * FADE) });
    put(press, (g) => poly(g, [[x, y + h], [x, y + 200], [x + 60, y + 200], [x + 60, y + 180], [x + 120, y + 150], [x + 180, y + 180], [x + 180, y + 206], [x + 250, y + 206], [x + 250, y + 170], [x + 272, y + 170], [x + 272, y + 190], [x + w, y + 190], [x + w, y + h]]), { navy: 1, yellow: 0.7, 'blue.s': 0.4 });
    for (const [cx, cy] of [[x + 150, y + 175], [x + 214, y + 196]]) put(press, (g) => g.rect(cx, cy, 8, 10), { yellow: 1, 'pink.s': 0.4 });
    // rain: streaks running down the panes at their own speeds, and beads sitting on the glass
    const r = Motion.rng('curie-rain');
    for (let i = 0; i < 20; i++) {
        const rx = x + 6 + r() * (w - 12), sp = 70 + r() * 90, ph = r(), len = 16 + r() * 26;
        const yy = y - len + ((tq * sp + ph * (h + len)) % (h + len));
        line(press, [[rx, yy], [rx + 1.5, yy + len * 0.6], [rx + 1, yy + len]], taper(3.4, 0.6, 0.2), { 'navy.s': 0.3, 'yellow.s': 0.15 });
    }
    for (let i = 0; i < 26; i++) {
        const bx = x + r() * w, by = y + r() * h, br = 2 + r() * 2.2;
        put(press, circle(bx, by, br), { 'navy.s': 0.35, 'yellow.s': 0.12 });
        ink(press, circle(bx + br * 0.3, by + br * 0.4, br * 0.55), { 'navy.s': 0.6 });
    }
    // the lamp reflected in the lower right pane
    ink(press, ellipse(x + w - 60, y + h - 70, 26, 18), { 'yellow.s': (g) => Riso.radial(g, x + w - 60, y + h - 70, 2, 26, 0.5 * FADE, 0) });
    press.restore();
    // glazing bars (3 × 3 panes) and the sill
    for (const k of [1, 2]) {
        put(press, (g) => g.rect(x + (w * k) / 3 - 5, y, 10, h), WOOD);
        put(press, (g) => g.rect(x, y + (h * k) / 3 - 5, w, 10), WOOD);
    }
    put(press, (g) => g.rect(x - 30, y + h + 16, w + 60, 14), WOOD_EDGE);
    put(press, (g) => g.rect(x - 30, y + h + 16, w + 60, 4), WOOD_TOP);
}
// a pot-bellied cast-iron stove with its pipe, the fire flickering behind the grille
function stove(press, tq) {
    const d = Math.floor(tq * 12), fl = 0.5 + 0.5 * Motion.noise1('curie-fire', d * 0.6), x = 112;
    // pipe up into the roof, with a collar and a damper handle
    put(press, (g) => g.rect(x - 13, -300, 26, 950), IRON);
    line(press, [[x + 7, -300], [x + 7, 640]], 4, IRON_LT);
    put(press, (g) => g.rect(x - 16, 260, 32, 10), IRON_LT);
    line(press, [[x - 22, 300], [x + 22, 296]], 4, { navy: 1, yellow: 1 });
    // feet, belly, top plate
    for (const fx of [x - 48, x + 40]) put(press, (g) => poly(g, [[fx - 4, 820], [fx + 12, 820], [fx + 10, FLOOR], [fx - 6, FLOOR]]), IRON);
    put(press, (g) => smooth(g, [[x - 50, 650], [x + 50, 650], [x + 66, 730], [x + 56, 810], [x + 36, 828], [x - 36, 828], [x - 56, 810], [x - 66, 730]]), IRON);
    line(press, [[x + 42, 662], [x + 58, 730], [x + 48, 800]], taper(6), IRON_LT);
    put(press, (g) => g.rect(x - 60, 636, 120, 16), IRON);
    put(press, (g) => g.rect(x - 60, 636, 120, 4), IRON_LT);
    put(press, ellipse(x, 636, 44, 7), IRON_LT);
    // the fire door: a glow behind a grille that flickers
    put(press, (g) => g.rect(x - 28, 732, 56, 40), { yellow: 1, pink: 0.55 + 0.35 * fl, 'navy.s': 0.1 });
    for (let i = 0; i < 5; i++) line(press, [[x - 28 + 6 + i * 11, 732], [x - 28 + 6 + i * 11, 772]], 4, IRON);
    line(press, [[x - 32, 730], [x + 32, 730]], 5, IRON);
    line(press, [[x - 32, 774], [x + 32, 774]], 5, IRON);
    // a warm glow on the floor in front of the door
    knock(press, (g) => { g.fillStyle = Riso.radial(g, x, 790, 10, 150, 0.35 * fl, 0); g.arc(x, 790, 150, 0, TAU); }, 1);
    ink(press, circle(x, 790, 150), { 'yellow.s': (g) => Riso.radial(g, x, 790, 10, 150, (0.3 + 0.2 * fl) * FADE, 0), 'pink.s': (g) => Riso.radial(g, x, 790, 10, 110, 0.25 * FADE, 0) });
}
// Pierre's coat and hat on a peg board: he is out, his things are here
function coatPeg(press) {
    Ph.cam(press, 90, 0, 1, () => coatPeg0(press));
}
function coatPeg0(press) {
    put(press, (g) => g.rect(1090, 134, 150, 22), WOOD);
    put(press, (g) => g.rect(1090, 134, 150, 5), WOOD_TOP);
    const COAT = { navy: 1, yellow: 0.9, pink: 0.6 }, COAT_LT = { 'navy.s': 0.7, 'yellow.s': 0.85, 'pink.s': 0.6, 'blue.s': 0.2 }, COAT_DK = { navy: 1, yellow: 1, pink: 0.85 };
    for (const px of [1120, 1210]) { put(press, circle(px, 150, 7), BRASS_SH); line(press, [[px, 150], [px + 8, 162]], 5, BRASS_SH); }
    // a frock coat hung by its collar loop: it narrows to the peg, the shoulders slope away,
    // the sleeves hang down both sides, the skirts fall straight
    put(press, (g) => smooth(g, [[1112, 160], [1128, 160], [1150, 176], [1168, 200], [1176, 260], [1184, 360], [1192, 468], [1150, 478], [1100, 478], [1066, 468], [1070, 360], [1076, 260], [1086, 200], [1100, 176]]), COAT);
    // lapels: two lit facings making a V under the collar
    put(press, (g) => poly(g, [[1106, 172], [1120, 168], [1126, 250], [1112, 270], [1098, 220]]), COAT_LT);
    put(press, (g) => poly(g, [[1122, 168], [1136, 172], [1146, 220], [1134, 272], [1126, 250]]), COAT_LT);
    line(press, [[1102, 168], [1120, 162], [1140, 168]], 6, COAT_DK);
    line(press, [[1126, 256], [1128, 470]], taper(3), COAT_DK);
    // the sleeves, a little lighter where the lamp catches them, with cuffs
    // the near sleeve hangs in front, lit along its edge, with its cuff
    line(press, [[1160, 196], [1168, 320], [1162, 436]], taper(34, 0.1, 0.05), COAT);
    line(press, [[1174, 206], [1182, 320], [1176, 430]], taper(5, 0.2, 0.2), COAT_LT);
    line(press, [[1148, 230], [1152, 330], [1148, 430]], taper(3), COAT_DK);
    line(press, [[1146, 432], [1178, 438]], 7, COAT_DK);
    for (let i = 0; i < 3; i++) put(press, circle(1134, 300 + i * 46, 4), BRASS_SH);
    put(press, (g) => g.rect(1140, 380, 28, 7), COAT_DK);
    // the hat on the right peg: a felt bowler
    put(press, ellipse(1214, 150, 36, 8), { navy: 1, yellow: 1, 'blue.s': 0.3 });
    put(press, (g) => smooth(g, [[1188, 148], [1192, 122], [1214, 110], [1236, 122], [1240, 148]]), { navy: 1, yellow: 1, 'blue.s': 0.3 });
    line(press, [[1190, 140], [1238, 140]], 5, { navy: 1, 'pink.s': 0.6 });
    line(press, [[1200, 124], [1214, 115], [1228, 120]], taper(3), IRON_LT);
}
// a shelf of glassware and dishes on the right wall
function shelf(press, tq) {
    const y = 262, x0 = 1330, x1 = 1680;
    for (const bx of [x0 + 40, x1 - 60]) put(press, (g) => poly(g, [[bx - 7, y], [bx + 7, y], [bx + 7, y + 46], [bx - 26, y + 14]]), WOOD_DK);
    const glint = (x, yy, h) => knock(press, (g) => Ph.poly(g, Ph.outline([[x, yy], [x + 2, yy + h]], taper(4))));
    // a big round flask with clear liquid, a stack of porcelain dishes, a brown bottle, a jar of ore
    put(press, circle(1380, y - 50, 40), GLASS);
    put(press, (g) => g.rect(1370, y - 140, 20, 60), GLASS);
    press.save(); press.clip(circle(1380, y - 50, 40));
    put(press, (g) => g.rect(1330, y - 56 + Math.sin(tq * 2) * 1.5, 100, 60), { 'blue.s': 0.55, 'navy.s': 0.2 });
    press.restore();
    glint(1360, y - 76, 24);
    for (let i = 0; i < 4; i++) {
        put(press, ellipse(1460, y - 8 - i * 12, 34 - i, 7), PORCELAIN);
        ink(press, (g) => g.rect(1426, y - 8 - i * 12, 68, 7), { 'blue.s': 0.3 });
    }
    put(press, (g) => smooth(g, [[1520, y - 2], [1520, y - 90], [1530, y - 108], [1530, y - 124], [1552, y - 124], [1552, y - 108], [1562, y - 90], [1562, y - 2]]), { 'yellow.s': 0.7, 'pink.s': 0.55, 'navy.s': 0.4 });
    put(press, (g) => g.rect(1532, y - 140, 18, 18), { 'yellow.s': 0.4, 'navy.s': 0.55 });
    put(press, (g) => g.rect(1524, y - 70, 34, 30), { 'yellow.s': 0.2, 'pink.s': 0.1 });
    glint(1528, y - 88, 60);
    put(press, (g) => g.rect(1590, y - 70, 54, 68), GLASS);
    put(press, (g) => smooth(g, [[1592, y - 2], [1592, y - 40], [1604, y - 48], [1622, y - 44], [1642, y - 38], [1642, y - 2]]), ORE);
    put(press, (g) => g.rect(1586, y - 80, 62, 12), { 'yellow.s': 0.35, 'navy.s': 0.55 });
    glint(1598, y - 64, 20);
    put(press, (g) => g.rect(x0, y, x1 - x0, 14), WOOD);
    put(press, (g) => g.rect(x0, y, x1 - x0, 4), WOOD_TOP);
}
// a burlap sack of pitchblende residue under the bench, a little ore spilled at its foot
function sack(press) {
    const S = { 'yellow.s': 0.7, 'pink.s': 0.42, 'navy.s': 0.55 };
    put(press, (g) => smooth(g, [[1420, FLOOR], [1414, 800], [1436, 766], [1466, 752], [1500, 756], [1530, 776], [1542, 812], [1548, FLOOR]]), S);
    put(press, (g) => smooth(g, [[1460, 760], [1470, 732], [1484, 728], [1500, 736], [1494, 760]]), S);
    line(press, [[1462, 756], [1482, 750], [1500, 756]], 5, { 'yellow.s': 0.5, 'pink.s': 0.3, 'navy.s': 0.3 });
    const r = Motion.rng('curie-weave');
    for (let i = 0; i < 40; i++) { const sx = 1424 + r() * 116, sy = 770 + r() * 76; line(press, [[sx, sy], [sx + 6, sy + 1]], 1.6, { 'navy.s': 0.7 }); }
    line(press, [[1430, 800], [1450, 840]], taper(3), { navy: 1, yellow: 1 });
    put(press, (g) => smooth(g, [[1540, FLOOR], [1560, FLOOR - 8], [1590, FLOOR - 10], [1612, FLOOR]]), ORE);
}
// Pierre's stool, standing empty at the right of the bench
function stool2(press) {
    const x = 1360, top = 700;
    for (const [dx, sp] of [[-44, WOOD_DK], [44, WOOD_DK], [-36, WOOD], [36, WOOD]]) put(press, (g) => poly(g, [[x + dx * 0.8 - 6, top], [x + dx * 0.8 + 6, top], [x + dx + 6, FLOOR], [x + dx - 6, FLOOR]]), sp);
    put(press, (g) => g.rect(x - 40, 780, 80, 8), WOOD_DK);
    put(press, ellipse(x, top + 10, 52, 10), WOOD_EDGE);
    put(press, ellipse(x, top, 52, 10), WOOD_TOP);
    line(press, [[x - 30, top - 2], [x + 20, top - 4]], 1.6, GRAIN);
}
// the bench: lit top, thick front edge, apron in shadow, square legs (as in Newton's study)
function bench(press) {
    const x0 = -400, x1 = 2200, top = BENCH;
    for (const lx of [36, 930, 1600]) put(press, (g) => g.rect(lx - 22, top + 60, 44, 400), WOOD_DK);
    put(press, (g) => g.rect(x0 + 30, top + 50, x1 - x0 - 60, 60), WOOD_DK);
    put(press, (g) => g.rect(x0, top + 18, x1 - x0, 36), WOOD_EDGE);
    put(press, (g) => g.rect(x0, top, x1 - x0, 20), WOOD_TOP);
    put(press, (g) => g.rect(x0, top + 18, x1 - x0, 4), { 'yellow.s': 0.5, 'pink.s': 0.25 });
    ink(press, (g) => g.rect(x0 + 30, top + 54, x1 - x0 - 60, 14), { 'navy.s': 0.7 });
    const r = Motion.rng('curie-bench');
    for (let i = 0; i < 26; i++) {
        const y = top + (r() < 0.35 ? 4 + r() * 12 : 24 + r() * 26), xa = x0 + r() * (x1 - x0), len = Math.min(80 + r() * 260, x1 - 8 - xa);
        const j1 = r(), j2 = r(), j3 = r();
        if (len < 20 || !V(xa, y - 4, xa + len, y + 4)) continue;
        line(press, [[xa, y], [xa + len * 0.5, y + (j1 - 0.5) * 3], [xa + len, y + (j2 - 0.5) * 4]], taper(1.6 + j3 * 2.2), GRAIN);
    }
    // stains and a burn mark from years of work
    ink(press, ellipse(880, top + 8, 40, 5), { 'navy.s': 0.35, 'pink.s': 0.2 });
    ink(press, ellipse(1180, top + 10, 26, 4), { 'navy.s': 0.45 });
}
// the lamp's warm light over the bench and wall (side light from the right)
function warmLight(press, tq) {
    const d = Math.floor(tq * 12), fl = 0.85 + 0.15 * Motion.noise1('curie-lamp', d * 0.5);
    const c = [LAMP.x - 10, 500], R = 640;
    knock(press, (g) => { g.fillStyle = Riso.radial(g, c[0], c[1], 20, R, 0.32 * fl, 0); g.arc(c[0], c[1], R, 0, TAU); });
    ink(press, circle(c[0], c[1], R), { 'yellow.s': (g) => Riso.radial(g, c[0], c[1], 20, R, 0.42 * fl * FADE, 0), 'pink.s': (g) => Riso.radial(g, c[0], c[1], 20, R * 0.6, 0.12 * FADE, 0) });
}

// ── the figure ───────────────────────────────────────────────────────────────────────────
const SKIN = Cast.SKIN, SKIN_SH = Cast.SKIN_SH, LINEN = Cast.LINEN;
const SKIN_DK = { 'yellow.s': 0.36, 'pink.s': 0.5, 'navy.s': 0.2 };
const LINE = { 'pink.s': 0.55, 'navy.s': 0.4 };
const INK = { navy: 1 };
const HAIR = { 'pink.s': 0.4, yellow: 0.75, 'navy.s': 0.6 };
const HAIR_LT = { 'pink.s': 0.2, yellow: 0.55, 'navy.s': 0.16 };
const HAIR_DK = { 'pink.s': 0.45, yellow: 1, navy: 0.92 };
function lock(press, pts, w, o = {}) {
    line(press, pts, taper(w, o.a ?? 0.25, o.b ?? 0.35), HAIR);
    const off = (dd) => pts.map(([x, y], i) => {
        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
        const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
        return [x - (dy / l) * dd, y + (dx / l) * dd];
    });
    line(press, off(-w * 0.18).slice(0, -1), taper(w * 0.22, 0.3, 0.3), HAIR_LT);
    line(press, off(w * 0.3).slice(1), taper(w * 0.12, 0.3, 0.4), HAIR_DK);
}
// a closed eye (a blink): the lid down, lashes along its edge
function closedEye(press, x, y, w) {
    const h = w * 0.5;
    put(press, (g) => smooth(g, [[x - w / 2, y - h * 0.1], [x - w * 0.05, y - h * 0.55], [x + w / 2, y - h * 0.05], [x - w * 0.05, y + h * 0.4]]), SKIN_SH);
    line(press, [[x - w * 0.52, y], [x, y + h * 0.3], [x + w * 0.5, y + h * 0.02]], taper(w * 0.12, 0.2, 0.2), INK);
    line(press, [[x - w * 0.3, y - h * 0.95], [x + w * 0.1, y - h * 1.05], [x + w * 0.4, y - h * 0.7]], taper(w * 0.06), LINE);
}
// Marie Curie c. 1900 (after the laboratory photographs of the period): 33, a slim oval
// face with a broad forehead, deep-set eyes under straight brows, a straight nose, thin lips;
// ash-brown hair drawn up into a bun at the crown with a frizz of short curls at the
// hairline; a plain black high-necked dress. Seated on a stool, facing right. Local units:
// head centre (0, 0). o: { look, blink, t }
function marie(press, o) {
    const fl = (FLOOR - H[1]) / NS, t = o.t ?? 0;
    // o.bust: from the waist up (no stool, no skirt), for close shots
    if (!o.bust) {
    // the stool under her: a round seat that shows behind her, three splayed legs and a ring
    for (const [x0, x1, sp] of [[-150, -176, WOOD_DK], [-58, -44, WOOD_DK], [-112, -112, WOOD]]) put(press, (g) => poly(g, [[x0 - 7, 300], [x0 + 7, 300], [x1 + 7, fl], [x1 - 7, fl]]), sp);
    put(press, (g) => g.rect(-168, 404, 118, 8), WOOD_DK);
    put(press, (g) => g.rect(-172, 286, 150, 18), WOOD_EDGE);
    put(press, (g) => g.rect(-172, 286, 150, 5), WOOD_TOP);
    // the skirt: over the seat, the lap forward to the knee, then down to the floor in folds
    const hem = [[296, fl], [262, fl - 4], [226, fl + 1], [186, fl - 5], [146, fl], [104, fl - 4], [62, fl + 1], [16, fl - 4], [-30, fl], [-66, fl - 3]];
    put(press, (g) => smooth(g, [[-116, 250], [40, 262], [176, 292], [246, 322], [262, 370], [276, 430], ...hem, [-100, 420], [-122, 330]]), DRESS);
    // the lit knee and shin under the cloth, and the folds falling from the knee: each a lit
    // ridge beside a dark crease
    put(press, (g) => smooth(g, [[170, 296], [240, 320], [260, 366], [272, 430], [290, fl - 2], [258, fl - 4], [246, 400], [214, 334]]), DRESS_LIT);
    for (const [a, c, d] of [[[226, 336], [220, 400], [226, fl]], [[166, 318], [160, 400], [186, fl - 4]], [[104, 310], [100, 400], [104, fl - 3]], [[46, 300], [40, 400], [16, fl - 3]], [[-20, 290], [-30, 380], [-30, fl]]]) {
        line(press, [[a[0] + 7, a[1]], [c[0] + 8, c[1]], [d[0] + 9, d[1]]], taper(6, 0.4, 0.1), DRESS_LIT);
        line(press, [a, c, d], taper(4, 0.3, 0.1), DRESS_RIM);
    }
    // the hem breaks on the floor; a boot's toe shows
    put(press, (g) => smooth(g, [[268, fl - 10], [294, fl - 12], [312, fl - 4], [314, fl], [266, fl]]), IRON);
    line(press, [[276, fl - 8], [306, fl - 6]], 2.4, IRON_LT);
    }
    // (o.slim narrows the bodice about her neck: her slight build in the close shots)
    if (o.slim) { press.save(); press.each((g) => { g.translate(10, 0); g.scale(o.slim, 1); g.translate(-10, 0); }); }
    // bodice: narrow shoulders, a fitted front lit from the lamp on the right
    put(press, (g) => smooth(g, [[-116, 166], [-88, 122], [-34, 104], [34, 102], [88, 116], [118, 162], [130, 280], [122, 380], [-100, 380], [-124, 280]]), DRESS);
    put(press, (g) => smooth(g, [[32, 106], [86, 120], [114, 166], [126, 280], [118, 380], [72, 380], [50, 200]]), DRESS_LIT);
    line(press, [[40, 110], [52, 200], [60, 380]], taper(4), DRESS_RIM);
    for (let i = 0; i < 6; i++) {
        put(press, circle(47 + i * 1.5, 128 + i * 22, 4), { navy: 1, yellow: 1 });
        knock(press, circle(48 + i * 1.5, 126.5 + i * 22, 1.6));
    }
    // a watch pinned at the breast on a short chain
    line(press, [[82, 150], [88, 164], [86, 176]], 2.4, BRASS);
    put(press, circle(86, 184, 8), BRASS);
    put(press, circle(86, 184, 5), { 'yellow.s': 0.3, 'pink.s': 0.1 });
    if (o.slim) press.restore();
    // neck and the high collar with a narrow white edge
    put(press, (g) => smooth(g, [[-8, 40], [30, 44], [36, 72], [-12, 76]]), SKIN_SH);
    put(press, (g) => smooth(g, [[-24, 52], [12, 56], [40, 54], [48, 76], [44, 106], [-24, 108], [-30, 80]]), DRESS);
    put(press, (g) => smooth(g, [[30, 58], [42, 56], [48, 78], [44, 104], [34, 100]]), DRESS_LIT);
    line(press, [[-22, 54], [12, 58], [42, 55]], taper(5, 0.1, 0.1), LINEN);
    line(press, [[-20, 80], [20, 84], [44, 82]], taper(3), DRESS_RIM);
    // the face in near profile
    const face = [[-44, -58], [0, -74], [40, -70], [50, -54], [53, -40], [51, -30], [58, -14], [68, 2], [73, 9], [68, 15], [61, 17], [63, 24], [59, 29], [63, 35], [58, 42], [58, 52], [53, 64], [36, 74], [10, 72], [-18, 54], [-40, 20], [-48, -18]];
    put(press, (g) => smooth(g, face), SKIN);
    press.save();
    press.clip((g) => smooth(g, face));
    put(press, (g) => smooth(g, [[-70, -60], [-16, -52], [-2, -20], [-10, 20], [2, 54], [26, 90], [-80, 110]]), SKIN_SH, { knock: false });
    put(press, (g) => smooth(g, [[18, -34], [48, -30], [52, -16], [28, -10], [14, -20]]), { 'pink.s': 0.2, 'yellow.s': 0.12 }, { knock: false });
    put(press, (g) => smooth(g, [[50, -20], [60, -4], [66, 10], [58, 16], [50, 4]]), SKIN_SH, { knock: false });
    // the hollow under the cheekbone (a thin, tired face) and a light cheek above it
    put(press, (g) => smooth(g, [[12, 26], [30, 30], [42, 44], [36, 58], [16, 50]]), { 'pink.s': 0.2, 'yellow.s': 0.14, 'navy.s': 0.06 }, { knock: false });
    put(press, ellipse(30, 16, 15, 9), { 'pink.s': 0.24, 'yellow.s': 0.08 }, { knock: false });
    put(press, (g) => smooth(g, [[8, 62], [36, 70], [54, 64], [46, 80], [0, 82]]), SKIN_DK, { knock: false });
    press.restore();
    // features: nose, nostril, thin lips set firm, chin, a brow drawn down in attention
    line(press, [[51, -30], [58, -14], [67, 1], [72, 8]], taper(3.6, 0.2, 0.2), LINE);
    line(press, [[61, 16], [56, 15], [54, 10]], taper(4), INK);
    line(press, [[47, 31], [55, 32], [61, 31]], taper(4.2, 0.4, 0.1), INK);
    put(press, (g) => smooth(g, [[53, 33], [61, 33], [59, 38], [53, 37]]), { 'pink.s': 0.4, 'yellow.s': 0.12 });
    line(press, [[44, 50], [53, 48], [58, 44]], taper(2.6), LINE);
    line(press, [[12, -30], [30, -35], [50, -29]], taper(6, 0.2, 0.3), { navy: 1, 'pink.s': 0.4 });
    line(press, [[44, -34], [50, -40]], taper(2.2), LINE);
    if (o.blink) closedEye(press, 37, -13, 26);
    else Cast.eye(press, 37, -13, 26, o.look);
    line(press, [[16, 1], [30, 6], [42, 3]], taper(2.4), { 'pink.s': 0.5, 'navy.s': 0.15 });
    line(press, [[22, -52], [38, -54]], taper(2), { 'pink.s': 0.35 });
    // hair: the mass behind the ear rising to the crown, a cap over the skull, locks swept
    // up and back from the hairline into a bun on the crown
    put(press, (g) => smooth(g, [[-28, -30], [-44, -14], [-52, 10], [-42, 30], [-30, 34], [-32, 8], [-28, -18]]), HAIR);
    // the ear, its top under the hair
    put(press, (g) => smooth(g, [[-4, -18], [-16, -24], [-28, -12], [-28, 8], [-18, 22], [-8, 16], [-2, 0]]), SKIN_SH);
    line(press, Ph.sample([[-10, -12], [-20, -12], [-22, 2], [-14, 12]], false, 5), taper(2.6), LINE);
    put(press, ellipse(-12, 18, 3, 3), { yellow: 1, 'pink.s': 0.3 });
    put(press, (g) => smooth(g, [[-62, -30], [-58, -74], [-24, -96], [20, -96], [46, -82], [52, -64], [34, -62], [8, -66], [-16, -60], [-30, -40], [-50, -14]]), HAIR);
    lock(press, [[46, -66], [20, -78], [-10, -88], [-40, -96]], 22, { a: 0.1 });
    lock(press, [[40, -60], [14, -66], [-14, -68], [-44, -80]], 16, { a: 0.15 });
    lock(press, [[-34, 28], [-50, 2], [-58, -34], [-62, -70]], 20);
    lock(press, [[-22, -30], [-38, -52], [-52, -78]], 14);
    // the bun: a coil of hair on the crown
    put(press, ellipse(-46, -104, 32, 24, -0.25), HAIR);
    const coil = [];
    for (let k = 0; k <= 30; k++) { const a = -0.6 + (k / 30) * 5.2, rr = 28 - k * 0.55; coil.push([-46 + Math.cos(a) * rr, -104 + Math.sin(a) * rr * 0.75]); }
    line(press, coil, taper(9, 0.1, 0.4), HAIR_LT);
    line(press, coil.map(([x, y]) => [x + 2, y + 4]), taper(3, 0.2, 0.4), HAIR_DK);
    put(press, circle(-48, -106, 5), HAIR_DK);
    // the frizz of short curls along the hairline, and flyaway hairs that stir
    for (const [cx, cy, r] of [[46, -64, 7], [36, -68, 8], [24, -70, 7], [12, -72, 8], [0, -72, 6], [52, -56, 5]]) {
        line(press, Ph.sample([[cx + r, cy], [cx, cy - r], [cx - r, cy], [cx - r * 0.2, cy + r * 0.6]], false, 5), taper(4), HAIR);
        line(press, Ph.sample([[cx + r * 0.6, cy - r * 0.2], [cx, cy - r * 0.7], [cx - r * 0.5, cy - r * 0.1]], false, 4), taper(1.8), HAIR_DK);
    }
    for (let i = 0; i < 5; i++) {
        const a = -2.2 + i * 0.35, sw = Motion.noise1('curie-fly' + i, t * 1.3) * 4;
        const b0 = [-46 + Math.cos(a) * 30, -104 + Math.sin(a) * 23];
        line(press, [b0, [b0[0] + Math.cos(a) * 10 + sw, b0[1] + Math.sin(a) * 9], [b0[0] + Math.cos(a) * 18 + sw * 1.6, b0[1] + Math.sin(a) * 14 + 3]], taper(1.8, 0.1, 0.5), HAIR);
    }
}
// her near arm: a fitted black sleeve with a small puff at the shoulder, a white cuff
function sleeve(press, s, e, w, width) {
    line(press, [s, e], (u) => width * (1 - 0.14 * u) + 7, DRESS_RIM);
    line(press, [e, w], (u) => width * (0.84 - 0.24 * u) + 7, DRESS_RIM);
    line(press, [s, e], (u) => width * (1 - 0.14 * u), DRESS);
    line(press, [e, w], (u) => width * (0.84 - 0.24 * u), DRESS);
    put(press, circle(s[0] + 4, s[1] - 4, width * 0.66), DRESS);
    line(press, [[s[0] - width * 0.4, s[1] - width * 0.3], [s[0] + 6, s[1] - width * 0.64], [s[0] + width * 0.6, s[1] - width * 0.2]], taper(width * 0.18), DRESS_LIT);
    for (const k of [-1, 0, 1]) line(press, [[e[0] - 10 + k * 9, e[1] - width * 0.3], [e[0] - 2 + k * 11, e[1] + width * 0.2]], taper(2.6), DRESS_RIM);
    const nrm = (a, b, dd) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [dy / l * dd, -dx / l * dd]; };
    const up = (n) => (n[1] > 0 ? [-n[0], -n[1]] : n);
    const u1 = up(nrm(s, e, width * 0.28)), u2 = up(nrm(e, w, width * 0.24));
    line(press, [[s[0] + u1[0] + (e[0] - s[0]) * 0.2, s[1] + u1[1] + (e[1] - s[1]) * 0.2], [e[0] + u1[0], e[1] + u1[1]]], taper(width * 0.18), DRESS_LIT);
    line(press, [[e[0] + u2[0], e[1] + u2[1]], [w[0] + u2[0] - (w[0] - e[0]) * 0.1, w[1] + u2[1] - (w[1] - e[1]) * 0.1]], taper(width * 0.18), DRESS_LIT);
    // the cuff: a white band round the wrist
    const dx = w[0] - e[0], dy = w[1] - e[1], l = Math.hypot(dx, dy) || 1;
    line(press, [[w[0] - dx / l * 12, w[1] - dy / l * 12], [w[0] + dx / l * 2, w[1] + dy / l * 2]], width * 0.66, LINEN);
    line(press, [[w[0] - dx / l * 12, w[1] - dy / l * 12], [w[0] - dx / l * 10, w[1] - dy / l * 10]], width * 0.66, Cast.LINEN_SH);
}

// ── the apparatus ─────────────────────────────────────────────────────────────────────────
// a dish of mineral powder: bottom centre (bx, by). kind 1: a porcelain capsule of ground
// pitchblende; kind 2: a brass capsule of a darker, richer preparation
function dish(press, bx, by, kind) {
    const { rx, h } = DISH, body = kind === 1 ? PORCELAIN : BRASS, sh = kind === 1 ? PORC_SH : BRASS_SH;
    const bowl = (g) => { g.moveTo(bx - rx, by - h); g.quadraticCurveTo(bx - rx + 2, by, bx - rx * 0.6, by); g.lineTo(bx + rx * 0.6, by); g.quadraticCurveTo(bx + rx - 2, by, bx + rx, by - h); g.ellipse(bx, by - h, rx, 4.5, 0, 0, Math.PI, false); g.closePath(); };
    put(press, bowl, body);
    // shadow side away from the lamp (left), and the rim's lit edge on the right
    press.save(); press.clip(bowl);
    ink(press, (g) => g.rect(bx - rx - 2, by - h - 6, rx * 0.9, h + 8), sh);
    press.restore();
    // the powder: a low mound filling the capsule, with a few catching grains
    put(press, (g) => smooth(g, [[bx - rx + 3, by - h], [bx - 10, by - h - 5], [bx + 2, by - h - 6.5], [bx + 14, by - h - 4], [bx + rx - 3, by - h], [bx, by - h + 3.5]]), kind === 1 ? ORE : ORE2);
    const r = Motion.rng('curie-grains' + kind);
    for (let i = 0; i < 7; i++) put(press, circle(bx - 14 + r() * 28, by - h - 1 - r() * 4, 0.9 + r() * 0.8), { 'yellow.s': kind === 1 ? 0.3 : 0.55, 'pink.s': kind === 1 ? 0.05 : 0.3, 'navy.s': 0.2 });
    line(press, [[bx - rx, by - h], [bx - rx * 0.4, by - h + 4.2], [bx + rx * 0.4, by - h + 4.2], [bx + rx, by - h]], 2.2, kind === 1 ? { 'blue.s': 0.12 } : BRASS_LT);
}
// the ionisation chamber (after the Curies' plate condenser): two horizontal brass plates,
// the lower one on an ebonite column and charged from the battery, the upper one hung from
// an insulated arm and wired to the electrometer. The sample lies on the lower plate.
function plate(press, x, y, rx, ry, t) {
    put(press, (g) => { g.ellipse(x, y + t, rx, ry, 0, 0, Math.PI); g.lineTo(x - rx, y); g.ellipse(x, y, rx, ry, 0, Math.PI, 0, true); g.closePath(); }, BRASS_SH);
    put(press, ellipse(x, y, rx, ry), BRASS);
    ink(press, ellipse(x, y, rx, ry), { 'navy.s': (g) => Riso.ramp(g, x + rx, 0, x - rx, 0, 0, 0.35 * FADE) });
    knock(press, (g) => Ph.poly(g, Ph.outline([[x + rx * 0.2, y - ry * 0.7], [x + rx * 0.6, y - ry * 0.45], [x + rx * 0.85, y - ry * 0.1]], taper(3.4, 0.3, 0.3))));
}
function chamberBack(press) {
    const { x, lo, rx, ry, t } = CH;
    // base block, the stand rod at the back right and its arm
    put(press, (g) => g.rect(x - 78, 582, 156, 16), WOOD);
    put(press, (g) => g.rect(x - 78, 582, 156, 4), WOOD_TOP);
    put(press, ellipse(x + 86, 588, 16, 5), BRASS_SH);
    line(press, [[x + 86, 588], [x + 86, 410]], 7, BRASS_SH);
    line(press, [[x + 88, 588], [x + 88, 412]], 2.2, BRASS_LT);
    put(press, (g) => g.rect(x + 76, 400, 20, 14), BRASS_DK);
    line(press, [[x + 86, 406], [x, 406]], 7, BRASS_SH);
    line(press, [[x + 86, 404], [x, 404]], 2, BRASS_LT);
    // ebonite insulator and the rod down to the upper plate
    put(press, (g) => smooth(g, [[x - 8, 410], [x + 8, 410], [x + 10, 426], [x + 6, 434], [x - 6, 434], [x - 10, 426]]), IRON);
    line(press, [[x + 4, 414], [x + 5, 428]], 2.4, IRON_LT);
    line(press, [[x, 434], [x, CH.hi]], 5, BRASS_SH);
    // the column under the lower plate
    put(press, (g) => g.rect(x - 9, lo + t, 18, 582 - lo - t), IRON);
    line(press, [[x + 4, lo + t + 2], [x + 4, 580]], 2.4, IRON_LT);
    // the lower plate, with a terminal screw on its edge
    plate(press, x, lo, rx, ry, t);
    put(press, (g) => g.rect(x - rx - 8, lo + 1, 10, 6), BRASS_DK);
}
function chamberFront(press) {
    const { x, hi, rx, ry, t } = CH;
    plate(press, x, hi, rx, ry, t);
    put(press, (g) => g.rect(x + rx - 2, hi + 1, 10, 6), BRASS_DK);
}
// a quadrant electrometer (Curie type): a brass drum of four quadrants on levelling feet, a
// glass lantern holding the needle's mirror, a glass tube with the suspension fibre and a
// torsion head on top. The mirror turns with the reading.
function electrometer(press, reading) {
    const x = EL.x;
    // levelling base with three screw feet
    put(press, ellipse(x, 588, 64, 9), BRASS_SH);
    for (const fx of [x - 52, x + 50, x - 4]) {
        put(press, (g) => g.rect(fx - 5, 588, 10, 10), BRASS_DK);
        put(press, ellipse(fx, 598, 9, 3), BRASS_SH);
    }
    // the drum
    put(press, (g) => g.rect(x - 50, 520, 100, 64), BRASS);
    ink(press, (g) => g.rect(x - 50, 520, 60, 64), { 'navy.s': (g) => Riso.ramp(g, x - 50, 0, x + 10, 0, 0.6, 0) });
    ink(press, (g) => g.rect(x + 26, 520, 24, 64), { 'navy.s': (g) => Riso.ramp(g, x + 26, 0, x + 50, 0, 0, 0.3) });
    // knurled bands at the top and bottom of the drum
    for (let k = -46; k <= 46; k += 6) {
        line(press, [[x + k, 524], [x + k, 530]], 2, { 'navy.s': 0.6, 'pink.s': 0.3 });
        line(press, [[x + k, 578], [x + k, 585]], 2, { 'navy.s': 0.7, 'pink.s': 0.3 });
    }
    line(press, [[x + 18, 522], [x + 20, 582]], taper(5, 0.2, 0.2), { 'yellow.s': 0.3 });
    put(press, (g) => g.rect(x - 52, 578, 104, 8), BRASS_SH);
    put(press, ellipse(x, 520, 50, 8), BRASS_LT);
    ink(press, ellipse(x, 520, 50, 8), { 'navy.s': (g) => Riso.ramp(g, x - 50, 0, x + 50, 0, 0.3 * FADE, 0) });
    // the quadrants' seams and the two terminals on insulators
    line(press, [[x - 50, 551], [x + 50, 551]], 2.4, { navy: 1, 'pink.s': 0.4 });
    line(press, [[x - 10, 524], [x - 10, 578]], 2.4, { navy: 1, 'pink.s': 0.4 });
    for (const [tx, ty] of [[x - 50, 536], [x - 50, 566]]) {
        put(press, (g) => g.rect(tx - 16, ty - 5, 16, 10), IRON);
        put(press, circle(tx - 18, ty, 5), BRASS_SH);
    }
    // the lantern: a short glass cylinder with a brass cap, the mirror inside
    ink(press, (g) => g.rect(x - 18, 482, 36, 38), TINT);
    for (const ex of [x - 18, x + 16]) knock(press, (g) => g.rect(ex, 482, 2.5, 38), 0.45);
    const rot = (reading - R_REST) / 4200;
    press.save();
    press.each((g) => { g.translate(MIRROR[0], MIRROR[1]); g.rotate(-0.35 + rot); });
    put(press, (g) => g.rect(-7, -5, 14, 10), { 'blue.s': 0.2, 'navy.s': 0.1 });
    knock(press, (g) => g.rect(-5, -3.5, 10, 3));
    press.restore();
    line(press, [[x, 482], [x, MIRROR[1] - 5]], 1.6, { navy: 1 });
    knock(press, (g) => Ph.poly(g, Ph.outline([[x - 13, 486], [x - 12, 514]], taper(3.4))));
    put(press, (g) => g.rect(x - 22, 476, 44, 8), BRASS_SH);
    // the suspension tube and fibre, the torsion head
    ink(press, (g) => g.rect(x - 7, 300, 14, 176), TINT);
    for (const ex of [x - 7, x + 5]) knock(press, (g) => g.rect(ex, 300, 2.2, 176), 0.4);
    line(press, [[x, 304], [x, 476]], 1.4, { navy: 0.8 });
    knock(press, (g) => Ph.poly(g, Ph.outline([[x - 3.5, 310], [x - 3.5, 470]], taper(3.2, 0.1, 0.1))), 0.8);
    put(press, (g) => g.rect(x - 12, 290, 24, 12), BRASS);
    put(press, ellipse(x, 288, 14, 5), BRASS_LT);
    put(press, (g) => g.rect(x - 4, 276, 8, 12), BRASS_SH);
    put(press, circle(x, 274, 7), BRASS);
}
// the wire from the upper plate's arm to the electrometer, and from the battery to the
// lower plate: silk-covered copper with a little sag
function wires(press) {
    const w = (pts) => {
        const s = Ph.sample(pts, false, 6);
        line(press, s, 5, SILK);
        line(press, s.map(([x, y]) => [x, y + 1.6]), 1.6, { navy: 1 });
    };
    w([[CH.x + 96, 404], [CH.x + 140, 414], [EL.x - 120, 470], [EL.x - 80, 520], [EL.x - 68, 536]]);
    w([[CH.x - CH.rx - 10, CH.lo + 4], [CH.x - CH.rx - 30, CH.lo + 12], [560, 580], [520, 578], [500, 566]]);
}
// the battery that charges the lower plate: three glass cells on a tray, zinc and copper
function battery(press) {
    put(press, (g) => g.rect(400, 576, 124, 10), WOOD);
    for (let i = 0; i < 3; i++) {
        const cx = 416 + i * 40;
        put(press, (g) => g.rect(cx - 13, 542, 28, 36), GLASS);
        put(press, (g) => g.rect(cx - 13, 556, 28, 22), { 'blue.s': 0.5, 'navy.s': 0.25 });
        put(press, (g) => g.rect(cx - 7, 532, 5, 34), { 'blue.s': 0.3, 'navy.s': 0.4 });
        put(press, (g) => g.rect(cx + 3, 534, 5, 32), { yellow: 1, 'pink.s': 0.6, 'navy.s': 0.2 });
        knock(press, (g) => Ph.poly(g, Ph.outline([[cx - 10, 546], [cx - 10, 574]], taper(3))));
        if (i < 2) line(press, [[cx + 6, 532], [cx + 22, 524], [cx + 35, 532]], 2.2, { yellow: 1, 'pink.s': 0.6 });
    }
}
// an open notebook with rows of marks (no letters) and a pen
function notebook(press) {
    const x = 452, y = 590;
    put(press, (g) => poly(g, [[x - 86, y + 8], [x, y - 2], [x + 86, y + 8], [x + 80, y + 12], [x, y + 4], [x - 92, y + 12]]), { 'yellow.s': 0.16, 'pink.s': 0.06 });
    put(press, (g) => poly(g, [[x - 92, y + 12], [x, y + 4], [x + 80, y + 12], [x + 80, y + 14], [x - 92, y + 14]]), { 'yellow.s': 0.3, 'pink.s': 0.15, 'navy.s': 0.2 });
    line(press, [[x, y - 2], [x, y + 4]], 2, { 'navy.s': 0.5 });
    for (let i = 0; i < 2; i++) for (const s of [-1, 1]) line(press, [[x + s * 14, y + 2 + i * 3], [x + s * (70 - i * 6), y + 7 + i * 3]], 1.3, { 'navy.s': 0.7 });
    line(press, [[x + 30, y + 6], [x + 98, y - 2]], 3.4, IRON);
    line(press, [[x + 96, y - 2], [x + 104, y - 3]], 2, BRASS);
}
// the scale's lamp: a brass oil lamp whose chimney stands in a tin shade; a port in the
// shade aims the light at the mirror, a mica window shows the flame
function lamp(press, tq) {
    const x = LAMP.x, d = Math.floor(tq * 12), fl = Motion.noise1('curie-lamp', d * 0.5);
    // the font, the burner collar and its wick knob
    put(press, (g) => smooth(g, [[x - 28, LAMP.y], [x - 31, 584], [x - 22, 568], [x - 10, 562], [x + 10, 562], [x + 22, 568], [x + 31, 584], [x + 28, LAMP.y]]), BRASS);
    ink(press, (g) => g.rect(x - 32, 560, 30, 38), { 'navy.s': 0.35 });
    line(press, [[x + 14, 568], [x + 24, 580]], taper(3), BRASS_LT);
    put(press, (g) => g.rect(x - 14, 552, 28, 10), BRASS_SH);
    put(press, circle(x + 20, 556, 5), BRASS_SH);
    // the tin shade round the chimney
    put(press, (g) => g.rect(x - 19, 472, 38, 82), IRON);
    line(press, [[x + 12, 476], [x + 12, 550]], 3.4, IRON_LT);
    put(press, ellipse(x, 472, 19, 4), IRON_LT);
    put(press, (g) => g.rect(x - 21, 546, 42, 6), IRON_LT);
    // mica window with the flame, and the port towards the mirror
    put(press, (g) => g.rect(x - 5, 512, 13, 22), { yellow: 1, pink: 0.35 + 0.25 * fl });
    put(press, (g) => smooth(g, [[x + 1.5, 514 - fl * 2], [x + 5, 526], [x + 1.5, 531], [x - 2, 526]]), { yellow: 1 });
    line(press, [[x - 6, 511], [x + 9, 511]], 2.4, IRON_LT);
    put(press, circle(x - 20, 500, 9), BRASS_SH);
    put(press, circle(x - 21, 500, 6), { yellow: 1, 'pink.s': 0.2 + 0.2 * fl });
    knock(press, circle(x - 22, 499, 2.4));
    // the chimney above the shade, heat shimmering off it
    ink(press, (g) => g.rect(x - 7, 436, 14, 36), TINT);
    for (const ex of [x - 7, x + 5]) knock(press, (g) => g.rect(ex, 436, 2.2, 36), 0.45);
    knock(press, (g) => Ph.poly(g, Ph.outline([[x - 3, 440], [x - 3, 468]], taper(3))));
    for (let i = 0; i < 2; i++) {
        const yy = 430 - ((tq * 30 + i * 14) % 28), sw = Math.sin(tq * 5 + i * 2) * 3;
        line(press, [[x + sw, yy], [x + 1 - sw, yy - 10]], taper(2.6), { 'yellow.s': 0.35 });
    }
}
// the reading scale (in scale units, inside the world): a long ivory strip on a dark wooden
// holder behind the electrometer, ticks every 34, a dot every 10; lw = scale units per
// screen unit, so the ticks stay a readable width however far the camera pulls back
function scaleStrip(press, lw, o = {}) {
    const top = SY - 34, h = 68;
    // holder: posts to the bench and a dark backing (faded in with the room)
    const bench = SY + (BENCH - 4 - P0[1]) * Z0;
    if (o.holder !== false) {
        for (const px of [640, 1980]) {
            put(press, (g) => g.rect(px - 36, top + 40, 72, bench - top - 40), WOOD_DK);
            put(press, (g) => g.rect(px - 70, bench - 30, 140, 30), WOOD);
        }
        put(press, (g) => g.rect(S_L, top - 16, S_R - S_L + 50, h + 32), WOOD_DK);
        put(press, (g) => g.rect(S_R, top - 16, 50, h + 32), WOOD_EDGE);
    }
    Ph.put(press, (g) => g.rect(S_L, top, S_R - S_L, h), { 'yellow.s': 0.16, 'pink.s': 0.06 });
    Ph.ink(press, (g) => g.rect(S_L, top + h - 12, S_R - S_L, 12), { 'navy.s': 0.35, 'pink.s': 0.2 });
    for (let i = -30; i <= 38; i++) {
        const x = 800 + i * 34, l = i % 5 === 0 ? 30 : 14;
        Ph.line(press, [[x, top + 4], [x, top + 4 + l]], Math.max(i % 5 === 0 ? 4 : 3, (i % 5 === 0 ? 1.6 : 1.1) * lw), { navy: 1 });
        if (i % 10 === 0) Ph.put(press, Ph.circle(x, top + 48, Math.max(5, 1.6 * lw)), { navy: 1 });
    }
}
// the reflected beam from the mirror to the mark, with dust drifting in it, and the mark.
// far: where the wedge starts (the mirror; at the join, the close shot's source line)
function beamAndMark(press, sx, far, tq, lw) {
    const y = SY, src = -60;
    const hm = 12 + 28 * (sx - far[0]) / Math.max(1, sx - src), bb = 1 + 0.6 * seg(lw, 1, 3.5);
    const wedge = (g) => { g.beginPath(); g.moveTo(far[0], far[1] - hm); g.lineTo(sx, y - 12); g.lineTo(sx, y + 12); g.lineTo(far[0], far[1] + hm); g.closePath(); };
    press.knockout((g) => { g.fillStyle = Riso.ramp(g, src, 0, sx, 0, 0.12 * bb, 0.4 * bb); wedge(g); g.fill(); });
    Ph.ink(press, wedge, { 'yellow.s': (g) => Riso.ramp(g, src, 0, sx, 0, 0.1 * bb, 0.5 * bb) });
    // dust: the close shot's motes, then more over the stretch from the mirror
    const at = (u) => [lerp(far[0], sx, u), lerp(far[1], y, u)];
    const us = (src - far[0]) / (sx - far[0]);
    const r = Motion.rng('dust');
    for (let i = 0; i < 40; i++) {
        const u = r(), off = (r() - 0.5) * 2, ph = r() * 6.28, sp = 0.3 + r() * 0.6;
        const uu = us + (1 - us) * u, p = at(uu);
        const by = p[1] + off * lerp(34, 10, u) + Math.sin(tq * sp + ph) * 6;
        Ph.put(press, Ph.circle(p[0] + Math.cos(tq * sp * 0.7 + ph) * 8, by, Math.max(2 + r() * 2, 0.9 * lw)), { 'yellow.s': 0.5 });
    }
    const r2 = Motion.rng('curie-dust2');
    for (let i = 0; i < 16; i++) {
        const u = r2() * us, ph = r2() * 6.28, sp = 0.3 + r2() * 0.6, p = at(u), off = (r2() - 0.5) * 2;
        Ph.put(press, Ph.circle(p[0] + Math.cos(tq * sp * 0.7 + ph) * 8, p[1] + off * hm * 0.8 + Math.sin(tq * sp + ph) * 6, Math.max(2 + r2() * 2, 0.9 * lw)), { 'yellow.s': 0.5 });
    }
    // the mark: a screened halo round a yellow core with a paper-white centre
    const R = Math.max(58, 34 * lw), cx = Math.max(13, 10 * lw), cy = Math.max(16, 12 * lw);
    press.knockout((g) => { g.fillStyle = Riso.radial(g, sx, y, 4, R, 0.9, 0); g.beginPath(); g.arc(sx, y, R, 0, TAU); g.fill(); });
    Ph.ink(press, Ph.circle(sx, y, R), { 'yellow.s': (g) => Riso.radial(g, sx, y, 6, R, 0.9, 0) });
    Ph.put(press, Ph.ellipse(sx, y, cx, cy), { yellow: 1 });
    press.knockout(Ph.ellipse(sx, y, cx * 0.46, cy * 0.5));
}
// motes of mineral dust in the lamp's side light round the chamber; a puff where a dish is
// set down or lifted (they settle, they do not glow)
function motes(press, lt) {
    const r = Motion.rng('curie-motes');
    for (let i = 0; i < 26; i++) {
        const x0 = CH.x - 120 + r() * 240, y0 = CH.hi - 40 + r() * 170, sp = 0.2 + r() * 0.5, ph = r() * TAU, s = 1.3 + r() * 1.4;
        const x = x0 + Math.sin(lt * sp + ph) * 14 + lt * 3, y = y0 + Math.cos(lt * sp * 0.8 + ph) * 10 + lt * 2;
        const lit = 0.5 + 0.5 * Math.sin(lt * 1.3 + ph);
        if (lt > 3.4 && i % 3) continue;
        put(press, circle(x, y, s), { 'yellow.s': 0.3 + 0.35 * lit, 'pink.s': 0.1 });
    }
    for (const [t0, p] of [[TL.set1, ON_PLATE], [TL.grip1 + 0.04, ON_PLATE], [TL.aside, SPOT_A], [TL.set2, ON_PLATE]]) {
        const u = seg(lt, t0, t0 + 1.1);
        if (u <= 0 || u >= 1) continue;
        const rr = Motion.rng('curie-puff' + t0);
        for (let i = 0; i < 9; i++) {
            const a = -Math.PI * (0.1 + 0.8 * rr()), v = 14 + rr() * 22, s = (1.2 + rr() * 1.4) * (1 - u * 0.6);
            const e = 1 - Math.pow(1 - u, 2);
            put(press, circle(p[0] + Math.cos(a) * v * e + (rr() - 0.5) * 20, p[1] - DISH.h - 4 + Math.sin(a) * v * e * 0.8 + u * u * 16, s), { 'yellow.s': 0.5 * (1 - u), 'pink.s': 0.12 });
        }
    }
}

// ── the explanatory layer: events leaving the sample, ionising the air between the plates
// (what the chamber and electrometer measure). Short straight tracks and ion pairs in the
// light-blue diagram layer, never a glow.
function events() {
    const r = Motion.rng('curie-events'), out = [];
    let t = 3.62;
    while (t < 5.3) {
        const ox = ON_PLATE[0] - 16 + r() * 32, oy = ON_PLATE[1] - DISH.h - 4 - r() * 3;
        const a = -Math.PI * (0.04 + 0.92 * r()), len = 60 + r() * 80;
        // tracks that run up stop at the upper plate; the others fly out of the chamber
        let L = len;
        const dy = Math.sin(a);
        if (dy < -0.2 && Math.abs(ox + Math.cos(a) * ((CH.hi + CH.ry + CH.t - oy) / dy) - CH.x) < CH.rx) L = Math.min(len, (CH.hi + CH.ry + CH.t + 2 - oy) / dy);
        // some scatter: a kink part way along (a collision with an atom of the air)
        const kink = r() < 0.35 ? { at: 0.4 + r() * 0.3, da: (r() < 0.5 ? -1 : 1) * (0.5 + r() * 0.7) } : null;
        out.push({ t, o: [ox, oy], a, L, kink, ions: 2 + Math.floor(r() * 2), s: r() });
        t += 0.085 - 0.035 * seg(t, 3.6, 4.6) + r() * 0.04;
    }
    return out;
}
const EVENTS = events();
function layer(press, lt, cam) {
    const v = Ease.inOut(seg(lt, 3.46, 3.9));
    if (v <= 0) return;
    // the diagram layer: a veil over the room, a dotted ring round the chamber
    Ph.ink(press, (g) => g.rect(0, 0, 1600, 900), { 'navy.s': 0.42 * v + 0.26 * Ease.inOut(seg(lt, 5.4, 5.9)) });
    press.save();
    press.each((g) => { g.translate(800, 450); g.scale(cam.z, cam.z); g.translate(-cam.c[0], -cam.c[1]); });
    const ring = Ease.out(seg(lt, 3.5, 3.95)), rc = [CH.x, (CH.hi + CH.lo) / 2 + 4], rr = 128;
    const fadeRing = 1 - seg(lt, 5.3, 5.8);
    if (fadeRing > 0) for (let a = -Math.PI / 2; a < -Math.PI / 2 + TAU * ring; a += 0.105) {
        Ph.put(press, Ph.circle(rc[0] + Math.cos(a) * rr, rc[1] + Math.sin(a) * rr, 3.2 * fadeRing / Math.sqrt(cam.z / 1.4)), EXPL);
    }
    // each event: a track that shoots out, its tail catching up, and the ion pairs it leaves
    // along its path drifting apart towards the plates
    for (const e of EVENTS) {
        const age = lt - e.t;
        if (age < 0 || age > 0.9) continue;
        const head = Ease.out(seg(age, 0, 0.14)), tail = Ease.in(seg(age, 0.14, 0.42));
        const P = (u) => {
            if (!e.kink || u <= e.kink.at) return [e.o[0] + Math.cos(e.a) * e.L * u, e.o[1] + Math.sin(e.a) * e.L * u];
            const k = [e.o[0] + Math.cos(e.a) * e.L * e.kink.at, e.o[1] + Math.sin(e.a) * e.L * e.kink.at], b = e.a + e.kink.da;
            return [k[0] + Math.cos(b) * e.L * (u - e.kink.at), k[1] + Math.sin(b) * e.L * (u - e.kink.at)];
        };
        if (tail < 1) {
            const pts = [P(tail)];
            if (e.kink && tail < e.kink.at && head > e.kink.at) pts.push(P(e.kink.at));
            pts.push(P(head));
            Ph.line(press, pts, taper(5.5, 0.7, 0.08), EXPL);
            Ph.put(press, Ph.circle(...P(head), 4), { blue: 1 });
        }
        const iu = seg(age, 0.1, 0.9);
        if (iu > 0 && iu < 1) for (let k = 0; k < e.ions; k++) {
            const q = P((k + 0.7) / (e.ions + 0.4)), dr = iu * 18, s = 2.6 * (1 - iu * 0.5);
            Ph.put(press, Ph.circle(q[0] + 3, q[1] - dr, s), EXPL);
            Ph.put(press, Ph.circle(q[0] - 3, q[1] + dr, s), { blue: 1 });
        }
    }
    press.restore();
}
// the end: one track leaves the sample to the right, turns amber and stretches into the
// horizontal line (8 wide, full width, y = 450) that opens Einstein's scene
const LINE_T = [5.32, 5.84];
function endLine(press, lt, cam) {
    if (lt < LINE_T[0]) return;
    const o = toScreen(cam, [ON_PLATE[0] + 10, ON_PLATE[1] - DISH.h - 6]);
    const u = Ease.inOut(seg(lt, LINE_T[0], LINE_T[1])), ut = Ease.inOut(seg(lt, LINE_T[0] + 0.12, LINE_T[1]));
    const B0 = [o[0] + 96 * cam.z, o[1] - 34 * cam.z];
    const A = [lerp(o[0], -40, ut), lerp(o[1], 450, ut)], B = [lerp(B0[0], 1640, u), lerp(B0[1], 450, u)];
    const amber = lt >= LINE_T[0] + 1 / 12;
    const w = lerp(4.5, 8, Ease.out(seg(lt, LINE_T[0], LINE_T[1] - 0.2)));
    const pts = Array.from({ length: 25 }, (_, i) => [lerp(A[0], B[0], i / 24), lerp(A[1], B[1], i / 24)]);
    Ph.line(press, pts, u >= 1 ? 8 : taper(w, 0.03, 0.03), amber ? AMBER : EXPL);
}

// ── the whole world at one moment ────────────────────────────────────────────────────────
// s: { lt, tq, hand, dishes, reading, look, blink, lean, lw, far }
function world(press, s) {
    VIEW = s.view ?? null;
    wall(press);
    if (V(520, 40, 920, 380)) shedWindow(press, s.tq);
    if (V(1320, 100, 1690, 310)) shelf(press, s.tq);
    if (V(1150, 100, 1340, 490)) coatPeg(press);
    if (V(30, -300, 200, 850)) stove(press, s.tq);
    if (V(-400, 840, 2200, 1200)) floor(press);
    if (V(1400, 720, 1620, 860)) sack(press);
    warmLight(press, s.tq);
    // Marie behind the bench
    const hp = [H[0] + s.lean * 12 + (s.dx ?? 0), H[1] + s.lean * 6 + Math.sin(s.lt * 2.4) * 1.2];
    if (V(hp[0] - 160, hp[1] - 160, hp[0] + 340, 860)) Ph.cam(press, hp[0], hp[1], NS, () => marie(press, { look: s.look, blink: s.blink, t: s.lt }));
    bench(press);
    if (V(1300, 690, 1420, 850)) stool2(press);
    // on the bench, back to front: battery, the scale and its lamp, the electrometer, the
    // chamber with its sample, the dishes waiting, the notebook
    if (!s.atlas && V(400, 520, 530, 590)) battery(press);
    if (!s.fading) inScale(press, () => scaleStrip(press, s.lw));
    if (V(1090, 400, 1170, 600)) lamp(press, s.tq);
    if (V(960, 260, 1080, 600)) electrometer(press, s.reading);
    wires(press);
    if (V(680, 395, 850, 600)) chamberBack(press);
    const { d1, d2 } = s.dishes;
    for (const [d, k] of [[d1, 1], [d2, 2]]) if (d !== 'hand') dish(press, d[0], d[1], k);
    if (V(680, 395, 850, 600)) chamberFront(press);
    if (!s.atlas && V(360, 580, 560, 610)) notebook(press);
    // her arm and hand, holding a dish or not
    const hd = s.hand, sh = [hp[0] - 26 * NS, hp[1] + 124 * NS];
    const R = (v) => [Math.cos(hd.r) * v[0] - Math.sin(hd.r) * v[1], Math.sin(hd.r) * v[0] + Math.cos(hd.r) * v[1]];
    const pin = R([63 * NS, 41 * NS]), wrist = [hd.p[0] - pin[0], hd.p[1] - pin[1]];
    sleeve(press, sh, hd.e, [wrist[0] - 4, wrist[1] + 2], 50);
    const handPart = (part) => Ph.cam(press, wrist[0], wrist[1], NS, () => { press.each((g) => g.rotate(hd.r)); Cast.pinchHand(press, hd.open, part); });
    handPart('thumb');
    const held = d1 === 'hand' ? 1 : d2 === 'hand' ? 2 : 0;
    if (held) dish(press, hd.p[0] + DISH.rx - 2, hd.p[1] + DISH.h, held);
    handPart('front');
    motes(press, s.lt);
    // the beam and the mark over everything on the bench
    if (!s.fading) inScale(press, () => beamAndMark(press, s.reading, s.far, 12 + s.lt, s.lw));
}
// draw fn in the scale's own units
function inScale(press, fn) {
    press.save();
    press.each((g) => { g.translate(P0[0], P0[1]); g.scale(1 / Z0, 1 / Z0); g.translate(-800, -SY); });
    fn();
    press.restore();
}
const withCam = (press, cam, fn) => {
    press.save();
    press.each((g) => { g.translate(800, 450); g.scale(cam.z, cam.z); g.translate(-cam.c[0], -cam.c[1]); });
    fn();
    press.restore();
};

// the mark's reading (scale units)
function readingAt(lt, st) {
    if (lt < 0.5) return 800 + Ease.inOut(seg(12 + lt, 11.2, 12.5)) * 560;
    const settled = seg(lt, TL.set2 + 0.7, TL.set2 + 1.2);
    return st.sim(lt) + Motion.noise1('curie-spot', lt * 2) * 5 * settled;
}

Seg.curie = {
    // parts reused by the v2 segment (segments/curie-radium.js)
    parts: { marie, DRESS, DRESS_LIT, DRESS_RIM },
    init() {
        // the electrometer: a damped response of the mark to the ionisation current, from
        // where Faraday's mark stopped (1360, at rest) at 0.5 s; integrated once at 1 ms
        const dt = 0.001, t0 = 0.5, n = Math.ceil((6.5 - t0) / dt), xs = new Float32Array(n);
        let x = 1360, v = 0;
        const w = TAU * 1.9, z = 0.62;
        for (let i = 0; i < n; i++) {
            const acc = w * w * (target(t0 + i * dt) - x) - 2 * z * w * v;
            v += acc * dt; x += v * dt; xs[i] = x;
        }
        return { sim: (t) => xs[Math.min(n - 1, Math.max(0, Math.round((t - t0) / dt)))] };
    },
    draw(press, tq, st, ctx) {
        const lt = tq;
        // the join: the very first drawing is Faraday's closing frame itself
        if (lt < 1 / 24 && ctx?.st?.newtonFaraday) { Seg.newtonFaraday.scale(press, 12 + lt, ctx.st.newtonFaraday); return; }
        const cam = camAt(lt);
        Ph.put(press, (g) => g.rect(0, 0, 1600, 900), { blue: 0.9, 'navy.s': 0.9 });
        const reading = readingAt(lt, st), far = MIRROR_L;
        const bl = lt > 3.8 && lt < 3.97; // one blink while she watches the layer come up
        const lean = Ease.inOut(seg(lt, TL.go1 - 0.1, TL.set1)) * (1 - Ease.inOut(seg(lt, TL.set1 + 0.1, TL.back1))) + Ease.inOut(seg(lt, TL.go2 - 0.1, TL.grip1)) * (1 - Ease.inOut(seg(lt, TL.set2 + 0.1, TL.back2))) + 0.5 * Ease.inOut(seg(lt, 3.6, 4.2));
        // the room comes up out of the close shot's dark: the whole lab under a veil of the
        // ground that thins, the scale, beam and mark always on top of it
        const fade = Ease.inOut(seg(lt, 1 / 12, 0.42)), fading = fade < 1, lw = Z0 / cam.z;
        withCam(press, cam, () => world(press, { lt, tq, hand: handAt(lt), dishes: dishesAt(lt), reading, look: gazeAt(lt), blink: bl, lean, lw, far, fading, view: viewOf(cam) }));
        if (fading) {
            const a = 1 - fade;
            press.knockout((g) => { g.globalAlpha = a; g.beginPath(); g.rect(0, 0, 1600, 900); g.fill(); });
            Ph.ink(press, (g) => g.rect(0, 0, 1600, 900), { blue: 0.9 * a, 'navy.s': 0.9 * a });
            // the strip runs behind the electrometer: the drum comes up over it with the room
            withCam(press, cam, () => {
                inScale(press, () => scaleStrip(press, lw, { holder: false }));
                FADE = fade;
                electrometer(press, reading);
                FADE = 1;
                inScale(press, () => beamAndMark(press, reading, far, 12 + lt, lw));
            });
        }
        layer(press, lt, cam);
        endLine(press, lt, cam);
    },
    atlas(press, tq, st) {
        // Curie at her bench, the second preparation on the plate, a finger on the plate's
        // rim, the mark at its reading on the scale: she sits nearer the apparatus here so the
        // lens (r 400 round the centre) holds her face, the chamber and the mark
        const cam = { z: 0.92, c: [840, 430] }, dx = 200;
        const lt = 3.6 + (tq % 2);
        const reading = 750 + Motion.noise1('curie-atlas', tq * 1.5) * 10;
        const hand = { p: [672, 590 + Math.sin(tq * 2.4) * 1.2], e: [566, 588], r: 0.38, open: 0.35 };
        withCam(press, cam, () => world(press, { lt, tq, hand, dishes: { d1: [-999, 0], d2: ON_PLATE }, reading, look: [1, 0.55], blink: false, lean: 0.3, lw: Z0 / cam.z, far: MIRROR_L, dx, atlas: true }));
    },
};
})();
