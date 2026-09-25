// Segment FIS-07 of physics-history (32–38 s of the piece; local time 0–6): Schrödinger,
// Zurich, c. 1926. The vertical line Einstein's scene ends on is one wall of a box: the camera
// pulls back and finds him at his desk, in a study that dissolves into the abstract domain.
// 0–1: he steadies a sheet of calculations and looks up at the box. 1–3: a standing wave
// grows in it, the real part of ψ₃ oscillating while its nodes stay put; he watches one node.
// 3–5: the view turns and shows the box from above: the stationary density |ψ|² of the 2D
// state (3, 2) printed as halftone dots, the colour of each lobe cycling with the phase while
// the dots never change. From 5 the frame is the atlas vignette (draw() calls atlas()).
//
//   Seg.schrodinger.draw(press, tq, st)    tq: local time (on twos)
//   Seg.schrodinger.atlas(press, tq, st)   the same frame for tq ≥ 5 (small motions only)
var Seg = globalThis.Seg ?? (globalThis.Seg = {});
(() => {
const { put, ink, line, smooth, poly, taper, circle, ellipse } = Ph;
const lerp = Ease.lerp, seg = Ease.seg;
const TAU = Math.PI * 2;

// ── timings (local seconds) ───────────────────────────────────────────────────────────────
const TM = {
    pull: [0, 0.75], build: [0, 0.16], axis: [0.3, 0.8], adjust: [0.2, 1.0], gaze: 0.84,
    draw1: [1.0, 1.42], amp: [1.0, 2.1], env: [1.6, 2.1], nodes: 1.85, dots: [2.1, 2.9],
    turn: [3.0, 4.4], cam: [3.0, 4.7], waveOut: [3.15, 3.6], phase: [3.4, 4.2], atlas: 5.0,
};
// the display rates of the two states' phases (the real time scale is ~1e-15 s)
const W1 = TAU * 1.0, W2 = TAU * 0.5;

// ── colours as separations ────────────────────────────────────────────────────────────────
const AMBER = { yellow: 1, 'pink.s': 0.55 };
const EDGE = { 'blue.s': 0.45 };
const SKIN = Cast.SKIN, SKIN_SH = { 'yellow.s': 0.3, 'pink.s': 0.36, 'navy.s': 0.06 };
const LINE = { 'pink.s': 0.55, 'navy.s': 0.4 }, INK = { navy: 1 };
const CHEEK = { 'pink.s': 0.3, 'yellow.s': 0.1 };
const LINEN = Cast.LINEN, LINEN_SH = Cast.LINEN_SH;
// a warm grey tweed suit (lighter than Newton's and Faraday's black coats)
const SUIT = { 'navy.s': 0.78, 'yellow.s': 0.62, 'pink.s': 0.44 };
const SUIT_LT = { 'navy.s': 0.52, 'yellow.s': 0.55, 'pink.s': 0.34 };
const SUIT_DK = { navy: 1, 'yellow.s': 0.75, 'pink.s': 0.5 };
const HAIR = { 'navy.s': 0.82, yellow: 0.9, 'pink.s': 0.58 };
const HAIR_LT = { 'navy.s': 0.5, yellow: 0.85, 'pink.s': 0.45 };
const HAIR_DK = { navy: 1, yellow: 1, 'pink.s': 0.6 };
const WIRE = { navy: 1, 'yellow.s': 0.5 };
const W_TOP = { 'yellow.s': 0.72, 'pink.s': 0.42, 'navy.s': 0.14 };
const W_EDGE = { 'yellow.s': 0.85, 'pink.s': 0.62, 'navy.s': 0.42 };
const W_DARK = { 'yellow.s': 0.9, 'pink.s': 0.75, 'navy.s': 0.8 };
const GRAIN = { 'pink.s': 0.8, 'navy.s': 0.65, 'yellow.s': 0.9 };
const BRASS = { yellow: 1, 'pink.s': 0.22, 'navy.s': 0.08 };
const BRASS_SH = { yellow: 1, 'pink.s': 0.4, 'navy.s': 0.45 };
const PAPER = { 'yellow.s': 0.1, 'pink.s': 0.03, 'blue.s': 0.07 };
const fade = (spec, f) => Object.fromEntries(Object.entries(spec).map(([k, v]) => [k.endsWith('.s') ? k : k + '.s', v * f]));
const scale = (spec, f) => Object.fromEntries(Object.entries(spec).map(([k, v]) => [k, v * f]));
// a light shape at partial strength: a partial knockout, then its inks scaled
function putA(press, path, spec, a = 1) {
    if (a <= 0) return;
    if (a >= 1) return put(press, path, spec);
    press.knockout((g) => { g.globalAlpha = a; g.beginPath(); path(g); g.fill(); });
    ink(press, path, scale(spec, a));
}
const lineA = (press, pts, w, spec, a = 1) => { if (a > 0) putA(press, (g) => poly(g, Ph.outline(pts, w)), spec, a); };

// ── geometry (world units = the screen in the wide shot) ─────────────────────────────────
const H = [320, 322], NS = 1.18;            // Schrödinger's head centre and scale
const DESK = { x0: 110, x1: 690, top: 610 };
const BOX = { xL: 720, xR: 1480, y: 432 };  // the box in the side view: walls, the axis
const BOX3 = { c: [620, 370], s: 116, th: -0.3, ph: 0.98, top: 0.5 }; // the view from above
const CAM_T = { c: [480, 404], z: 1.25 };   // the atlas framing
const AMP = 0.4;                            // the wave's amplitude, box units (L = 2)

function camera(tq) {
    const p = Ease.out(seg(tq, TM.pull[0], TM.pull[1]));
    let z = Math.exp(Math.log(10) * (1 - p)), c = [lerp(BOX.xL, 800, p), 450];
    const a = Ease.inOut(seg(tq, TM.cam[0], TM.cam[1]));
    if (a > 0) { z *= Math.pow(CAM_T.z, a); c = [lerp(c[0], CAM_T.c[0], a), lerp(c[1], CAM_T.c[1], a)]; }
    return { c, z };
}
// the box's view: centre, scale (world units per box unit), yaw, pitch, the walls' extent
function view(tq) {
    const u = Ease.inOut(seg(tq, TM.turn[0], TM.turn[1])), e = Ease.inOut(seg(tq, TM.turn[0], TM.turn[0] + 1.1));
    return {
        u, c: [lerp((BOX.xL + BOX.xR) / 2, BOX3.c[0], u), lerp(BOX.y, BOX3.c[1], u)],
        s: 380 * Math.pow(BOX3.s / 380, u), th: BOX3.th * u, ph: BOX3.ph * u,
        top: BOX3.top * Math.pow(60 / BOX3.top, 1 - e), bot: -(Math.pow(61, 1 - e) - 1),
    };
}
// box coordinates (x, z ∈ [-1, 1] across and deep, y up) → world, orthographic
function P(v, x, y, z) {
    const x1 = x * Math.cos(v.th) - z * Math.sin(v.th), z1 = x * Math.sin(v.th) + z * Math.cos(v.th);
    const y2 = y * Math.cos(v.ph) + z1 * Math.sin(v.ph);
    return [v.c[0] + v.s * x1, v.c[1] - v.s * y2];
}

// ── the physics ───────────────────────────────────────────────────────────────────────────
// A particle in a box with infinite walls, 0 ≤ x ≤ L. 1D: ψ₃(x) = sin(3πx/L), its real part
// in time ψ₃(x)·cos(ω₁t); nodes at x = L/3 and 2L/3 (and the walls) for every t.
const psi1 = (xp) => Math.sin(3 * Math.PI * xp);
// 2D, (n_x, n_z) = (3, 2): ψ(x, z) = sin(3πx/L)·sin(2πz/L). By Born's rule the probability
// density is |ψ|² = sin²(3πx/L)·sin²(2πz/L): it is what the dots print (dot area ∝ |ψ|²), and
// it does not depend on time (a stationary state). Only the phase turns: Re ψe^{-iω₂t} =
// ψ·cos(ω₂t), whose sign per lobe sets the dots' colour.
const psi2 = (xp, zp) => Math.sin(3 * Math.PI * xp) * Math.sin(2 * Math.PI * zp);

// ── the domain ────────────────────────────────────────────────────────────────────────────
function boxEdges(press, v, cz, tq, part) {
    const u = v.u, w = lerp(10, 7, u) / cz, wt = lerp(6, 5, u) / cz;
    const L = (a, b, ww, alpha, spec = EDGE) => lineA(press, [P(v, ...a), P(v, ...b)], ww, spec, alpha);
    if (part === 'back') {
        // far posts, the far and side edges of the floor and the rim (they open with the turn)
        const a = seg(u, 0.05, 0.5);
        for (const x of [-1, 1]) L([x, 0, 1], [x, v.top, 1], wt, a);
        L([-1, 0, 1], [1, 0, 1], wt, a);
        for (const x of [-1, 1]) L([x, 0, -1], [x, 0, 1], wt, a);
        L([-1, v.top, 1], [1, v.top, 1], wt, a);
        for (const x of [-1, 1]) L([x, v.top, -1], [x, v.top, 1], wt, a);
        return;
    }
    // the near posts: the two lines the scene opens on
    for (const x of [-1, 1]) L([x, v.bot, -1], [x, v.top, -1], w, 1);
    if (u > 0) L([-1, v.top, -1], [1, v.top, -1], wt, seg(u, 0.3, 0.7));
    // the axis / the floor's near edge, drawn on from the left wall
    const ax = Ease.out(seg(tq, TM.axis[0], TM.axis[1]));
    if (ax > 0) L([-1, 0, -1], [-1 + 2 * ax, 0, -1], lerp(4, 4, u) / cz, 1, { 'blue.s': 0.4 });
}

function nodal(press, v, cz, tq) {
    const n = seg(tq, TM.nodes, TM.nodes + 0.3), u = v.u;
    if (n <= 0) return;
    const dash = (a, b, w, spec, alpha) => {
        const k = 22;
        for (let i = 0; i < k; i += 2) lineA(press, [P(v, ...a.map((q, j) => lerp(q, b[j], i / k))), P(v, ...a.map((q, j) => lerp(q, b[j], (i + 1) / k)))], w, spec, alpha);
    };
    // the nodal lines of the 2D state: x = L/3, 2L/3 (the 1D nodes, drawn out in depth) and
    // z = L/2 (on the axis while the box is seen edge-on)
    for (const xp of [1 / 3, 2 / 3]) dash([xp * 2 - 1, 0, -1], [xp * 2 - 1, 0, 1], 3.2 / cz, xp < 0.5 ? { pink: 0.8, 'yellow.s': 0.3 } : { 'blue.s': 0.35 }, n * seg(u, 0.1, 0.5));
    dash([-1, 0, 0], [1, 0, 0], 3.2 / cz, { 'blue.s': 0.35 }, n * seg(u, 0.1, 0.5));
    // the node marks on the axis in the side view: rings, the watched one pink
    const ra = n * (1 - seg(u, 0, 0.4));
    for (const xp of [1 / 3, 2 / 3]) {
        const [x, y] = P(v, xp * 2 - 1, 0, 0), r = 13 * Ease.pop(tq, TM.nodes, 0.35) / cz;
        if (r <= 0 || ra <= 0) continue;
        const ring = Array.from({ length: 41 }, (_, i) => [x + Math.cos(i / 40 * TAU) * r, y + Math.sin(i / 40 * TAU) * r]);
        lineA(press, ring, 4 / cz, xp < 0.5 ? { pink: 0.85, 'yellow.s': 0.3 } : { 'blue.s': 0.3 }, ra);
    }
}

// the 1D standing wave in the side view: the real part of ψ₃, its envelope ±|ψ₃|
function wave1D(press, v, cz, tq) {
    const out = 1 - seg(tq, TM.waveOut[0], TM.waveOut[1]);
    if (tq < TM.draw1[0] || out <= 0) return;
    const A = Ease.out(seg(tq, TM.amp[0], TM.amp[1])) * AMP, c = Math.cos(W1 * (tq - TM.draw1[0]));
    const reveal = Ease.out(seg(tq, TM.draw1[0], TM.draw1[1]));
    const env = seg(tq, TM.env[0], TM.env[1]) * out;
    if (env > 0) {
        for (const sg of [-1, 1]) {
            for (let i = 0; i < 60; i += 2) {
                const a = i / 60, b = (i + 1) / 60;
                lineA(press, [P(v, a * 2 - 1, sg * AMP * psi1(a), 0), P(v, (a + b) - 1, sg * AMP * psi1((a + b) / 2), 0), P(v, b * 2 - 1, sg * AMP * psi1(b), 0)], 3 / cz, { 'blue.s': 0.3 }, env);
            }
        }
    }
    const pts = [];
    for (let i = 0; i <= 90 * reveal; i++) { const xp = i / 90; pts.push(P(v, xp * 2 - 1, A * psi1(xp) * c, 0)); }
    if (pts.length > 2) lineA(press, pts, Ph.taper(8 / cz, 0.02, 0.02), AMBER, out);
}

// the density as halftone dots on the box's floor, dot area ∝ |ψ|² (Born)
function density(press, v, cz, tq) {
    const f = seg(tq, TM.dots[0], TM.dots[1]);
    if (f <= 0) return;
    const NX = 15, NZ = 14, rmax = (1 / NX) * 1.02, sq = Math.max(Math.sin(v.ph), 0.3);
    const ct = Math.cos(W2 * (tq - TM.phase[0])), pc = seg(tq, TM.phase[0], TM.phase[1]);
    const groups = { 1: [], [-1]: [] };
    for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) {
        const xp = (i + 0.5) / NX, zp = (j + 0.5) / NZ, ps = psi2(xp, zp);
        const r = rmax * Math.sqrt(ps * ps) * v.s * f; // radius ∝ |ψ|, so the area ∝ |ψ|²
        if (r * cz < 0.9) continue;
        const [X, Y] = P(v, xp * 2 - 1, 0, zp * 2 - 1);
        groups[ps >= 0 ? 1 : -1].push([X, Y, r, r * sq]);
    }
    for (const sg of [1, -1]) {
        const q = sg * ct; // Re ψe^{-iω₂t} / |ψ| in this lobe
        const spec = { yellow: 1, pink: lerp(0.4, 0.85 * Math.max(0, q), pc), blue: pc * 0.72 * Math.max(0, -q) };
        const list = groups[sg];
        put(press, (g) => { for (const [x, y, rx, ry] of list) { g.moveTo(x + rx, y); g.ellipse(x, y, rx, ry, 0, 0, TAU); } }, spec);
    }
}

// ── the study ─────────────────────────────────────────────────────────────────────────────
// the room's lower wall and floor; solid up to x0, then thinning into dots towards the box
function room(press, S, K) {
    const x0 = 540, x1 = 760, n = 6;
    press.save();
    press.clip((g) => g.rect(-600, -100, x0 + 600, 1200));
    Sets.wainscot(press, -500, 900, 470, 850, S, K);
    Sets.floor(press, -500, 900, 850, S, K);
    press.restore();
    for (let i = 0; i < n; i++) {
        const a = x0 + (x1 - x0) * (i / n), b = x0 + (x1 - x0) * ((i + 1) / n), f = 1 - (i + 1) / (n + 1);
        press.save();
        press.clip((g) => g.rect(a, -100, b - a, 1200));
        const Sb = (spec) => fade(S(spec), f);
        Sets.wainscot(press, -500, 900, 470, 850, Sb, { knock: false });
        Sets.floor(press, -500, 900, 850, Sb, { knock: false });
        press.restore();
    }
}

// a winter window: the old town at night (the Grossmünster's twin towers), snow falling
function winterWindow(press, x, y, w, h, tq, S, K) {
    const FR = { 'yellow.s': 0.8, 'pink.s': 0.6, 'navy.s': 0.55 };
    put(press, (g) => g.rect(x - 16, y - 16, w + 32, h + 32), S(FR), K);
    const glass = (g) => g.rect(x, y, w, h);
    put(press, glass, S({ navy: 1, 'blue.s': 0.4 }), K);
    press.save();
    press.clip(glass);
    // roofs and the two towers, a lit window or two
    const base = y + h;
    put(press, (g) => poly(g, [[x - 10, base], [x - 10, base - 40], [x + 30, base - 62], [x + 60, base - 44], [x + 60, base - 70], [x + 74, base - 70], [x + 74, base - 150], [x + 80, base - 172], [x + 86, base - 150], [x + 86, base - 70], [x + 100, base - 70], [x + 100, base - 150], [x + 106, base - 172], [x + 112, base - 150], [x + 112, base - 70], [x + 124, base - 58], [x + 150, base - 76], [x + w + 10, base - 50], [x + w + 10, base]]), S({ navy: 1, yellow: 0.7, 'blue.s': 0.3 }), K);
    // snow on the roofs
    for (const [a, b] of [[[x + 2, base - 44], [x + 30, base - 60]], [[x + 30, base - 60], [x + 58, base - 44]], [[x + 128, base - 60], [x + 150, base - 74]], [[x + 150, base - 74], [x + w, base - 52]]]) line(press, [a, b], 4, S({ 'blue.s': 0.12 }), K);
    for (const [wx, wy] of [[x + 40, base - 30], [x + 138, base - 36]]) put(press, (g) => g.rect(wx, wy, 7, 9), S({ yellow: 1, 'pink.s': 0.35 }), K);
    // snowflakes: each falls and drifts from its own start, looping (closed form in tq)
    const r = Motion.rng('zurich-snow');
    for (let i = 0; i < 26; i++) {
        const x0 = r() * w, sp = 22 + r() * 26, ph = r(), sz = 2 + r() * 2.4, dr = r() * 6.28;
        const yy = y - 10 + (((ph * (h + 20)) + tq * sp) % (h + 20)), xx = x + x0 + Math.sin(tq * 1.3 + dr) * 7;
        put(press, circle(xx, yy, sz), S({ 'blue.s': 0.08 }), K);
    }
    press.restore();
    // glazing bars and the sill with a ridge of snow outside
    put(press, (g) => g.rect(x + w / 2 - 6, y, 12, h), S(FR), K);
    put(press, (g) => g.rect(x, y + h * 0.45, w, 12), S(FR), K);
    put(press, (g) => smooth(g, [[x + 4, y + h - 2], [x + 40, y + h - 12], [x + 90, y + h - 8], [x + w - 4, y + h - 14], [x + w - 2, y + h], [x + 2, y + h]]), S({ 'blue.s': 0.1 }), K);
    put(press, (g) => g.rect(x - 24, y + h + 12, w + 48, 16), S({ 'yellow.s': 0.7, 'pink.s': 0.45, 'navy.s': 0.3 }), K);
}

// two old wooden skis with upturned tips and leather toe straps leaning in the corner, a pair
// of bamboo poles leaning across them, a knitted cap hung on a pole's grip (it sways a little);
// melt water drips from a binding onto the floor
function skis(press, tq, S, K) {
    const SKI = { 'yellow.s': 0.85, 'pink.s': 0.55, 'navy.s': 0.3 }, SKI_DK = { 'yellow.s': 0.9, 'pink.s': 0.7, 'navy.s': 0.62 };
    const at = (bx, tx, y) => lerp(bx, tx, (852 - y) / (852 - 200));
    // poles behind the skis, leaning the other way: bamboo with nodes, baskets, leather grips
    for (const [bx, tx] of [[128, 20], [140, 36]]) {
        const pa = (y) => lerp(bx, tx, (848 - y) / 600);
        line(press, [[bx, 848], [tx, 248]], 6, S({ 'yellow.s': 0.6, 'pink.s': 0.25, 'navy.s': 0.2 }), K);
        for (let k = 1; k < 6; k++) { const yy = 848 - k * 96; line(press, [[pa(yy) - 4, yy], [pa(yy) + 4, yy]], 3, S({ 'navy.s': 0.7, 'yellow.s': 0.5 }), K); }
        line(press, Array.from({ length: 25 }, (_, i) => [pa(806) + Math.cos(i / 24 * TAU) * 22, 806 + Math.sin(i / 24 * TAU) * 7]), 4, S({ navy: 1, 'pink.s': 0.5, yellow: 0.7 }), K);
        line(press, [[pa(806) - 20, 806], [pa(806) + 20, 806]], 2.5, S({ navy: 1, 'pink.s': 0.5, yellow: 0.7 }), K);
        line(press, [[tx + 1, 250], [tx + 5, 282]], 11, S({ navy: 1, 'pink.s': 0.6, yellow: 0.8 }), K);
    }
    for (const [bx, tx, spec] of [[14, 70, SKI_DK], [40, 96, SKI]]) {
        // the board seen from its top face, a groove down the middle, the tip curling forward
        const pts = [[bx, 852], [lerp(bx, tx, 0.5), 526], [tx, 200], [tx + 5, 166], [tx + 18, 142], [tx + 34, 134]];
        line(press, pts, (u) => (u < 0.72 ? 24 : 24 * (1 - (u - 0.72) / 0.28 * 0.75)), S(spec), K);
        line(press, pts.slice(0, 4), taper(2.4, 0.05, 0.1), S({ 'navy.s': 0.7, 'pink.s': 0.4 }), K);
        line(press, pts.map(([px, py], i) => [px - 8 + i * 0.6, py + (i > 3 ? 3 : 0)]), taper(3, 0.05, 0.3), S({ 'yellow.s': 0.45, 'pink.s': 0.15 }), K);
        // the binding: a steel toe iron and a leather strap with a buckle
        const by = 596, x = at(bx, tx, by);
        put(press, (g) => poly(g, [[x - 15, by - 8], [x + 15, by - 10], [x + 15, by + 16], [x - 15, by + 18]]), S({ navy: 1, 'pink.s': 0.6, yellow: 0.8 }), K);
        put(press, (g) => g.rect(x - 16, by + 20, 32, 8), S({ 'blue.s': 0.35, 'navy.s': 0.5 }), K);
        put(press, (g) => g.rect(x + 3, by - 4, 7, 7), S(BRASS), K);
    }
    // the cap on the far pole's grip: a knitted stocking cap, striped, with a pompom
    const sw = Math.sin(tq * 2.1) * 0.06;
    press.save();
    press.each((g) => { g.translate(38, 256); g.rotate(sw); });
    const CAP = { pink: 0.9, yellow: 1, 'navy.s': 0.1 };
    put(press, (g) => smooth(g, [[-24, -6], [22, -8], [26, 30], [16, 70], [4, 84], [-10, 70], [-22, 30]]), S(CAP), K);
    for (const y of [16, 40, 60]) line(press, [[-22 + y * 0.12, y], [22 - y * 0.12, y - 2]], 5, S({ 'yellow.s': 0.2, 'pink.s': 0.1 }), K);
    line(press, [[-26, -4], [24, -6]], 9, S({ pink: 0.8, yellow: 1, 'navy.s': 0.35 }), K);
    put(press, circle(6, 90, 11), S({ 'yellow.s': 0.2, 'pink.s': 0.1 }), K);
    press.restore();
    // drips from the near binding (every 0.9 s), a small puddle with a ring on each landing
    const P0 = [at(40, 96, 624), 626], per = 0.9, ph = ((tq + 0.2) % per) / per;
    const grow = Math.min(1, ph / 0.55), fall = Math.max(0, (ph - 0.55) / 0.3);
    if (fall <= 0) put(press, ellipse(P0[0], P0[1] + 3 * grow, 2.2 + 1.4 * grow, 2.5 + 2.2 * grow), S({ 'blue.s': 0.25 }), K);
    else if (fall < 1) put(press, ellipse(P0[0], P0[1] + (864 - P0[1]) * fall * fall, 2.6, 4.2), S({ 'blue.s': 0.25 }), K);
    put(press, ellipse(P0[0] + 2, 866, 26, 4), S({ 'blue.s': 0.5, 'navy.s': 0.3 }), K);
    const rr = seg(ph, 0.85, 1) + (ph < 0.3 ? 1 + ph / 0.3 : 0);
    if (rr > 0 && rr < 2) line(press, Array.from({ length: 25 }, (_, i) => [P0[0] + 2 + Math.cos(i / 24 * TAU) * (6 + rr * 10), 866 + Math.sin(i / 24 * TAU) * (1.5 + rr * 1.6)]), 1.8, S({ 'blue.s': 0.2 }), { knock: K.knock && rr < 1.6 });
}

// a framed photograph of mountains (Arosa, where he wrote the equation down in 1925)
function mountainPicture(press, x, y, w, h, S, K) {
    put(press, (g) => g.rect(x - 10, y - 10, w + 20, h + 20), S({ navy: 1, yellow: 0.8, 'pink.s': 0.45 }), K);
    put(press, (g) => g.rect(x - 4, y - 4, w + 8, h + 8), S(BRASS_SH), K);
    put(press, (g) => g.rect(x, y, w, h), S({ 'blue.s': 0.5, 'yellow.s': 0.08 }), K);
    press.save();
    press.clip((g) => g.rect(x, y, w, h));
    put(press, (g) => poly(g, [[x - 5, y + h], [x + 14, y + 52], [x + 30, y + 30], [x + 46, y + 44], [x + 70, y + 16], [x + 96, y + 46], [x + w + 5, y + 36], [x + w + 5, y + h]]), S({ 'navy.s': 0.6, blue: 0.7 }), K);
    // snow caps: paper, with a blue shaded side
    put(press, (g) => poly(g, [[x + 56, y + 32], [x + 70, y + 16], [x + 84, y + 32], [x + 76, y + 30], [x + 70, y + 36], [x + 62, y + 30]]), S({ 'blue.s': 0.05 }), K);
    put(press, (g) => poly(g, [[x + 20, y + 42], [x + 30, y + 30], [x + 40, y + 40], [x + 30, y + 44]]), S({ 'blue.s': 0.05 }), K);
    put(press, (g) => poly(g, [[x + 70, y + 16], [x + 84, y + 32], [x + 76, y + 30]]), S({ 'blue.s': 0.35 }), K);
    // a dark row of firs in front
    put(press, (g) => { g.moveTo(x - 5, y + h); for (let i = 0; i <= 12; i++) { const fx = x + i * (w / 12); g.lineTo(fx, y + h - 10); g.lineTo(fx + w / 24, y + h - 26 - (i % 3) * 5); } g.lineTo(x + w + 5, y + h); g.closePath(); }, S({ navy: 1, 'yellow.s': 0.6 }), K);
    press.restore();
    press.knockout((g) => { poly(g, Ph.outline([[x + w - 16, y + 6], [x + w - 6, y + 22]], taper(3))); g.fill(); });
    // the hanging cord and its nail
    line(press, [[x + 6, y - 10], [x + w / 2, y - 40], [x + w - 6, y - 10]], 2, S({ navy: 1 }), K);
    put(press, circle(x + w / 2, y - 40, 3), S(BRASS), K);
}

// an electric pendant lamp with an opal glass shade: it sways a little; a warm pool of light
function pendantLamp(press, x, y, tq, S, K, gf) {
    const sw = Math.sin(tq * 1.9) * 0.018, GR = 170;
    press.save();
    press.each((g) => { g.translate(x, -60); g.rotate(sw); g.translate(-x, 60); });
    const glowA = (0.5 + 0.03 * Math.sin(tq * 5.1)) * gf;
    press.knockout((g) => { g.fillStyle = Riso.radial(g, x, y + 60, 12, GR, glowA, 0); g.beginPath(); g.arc(x, y + 60, GR, 0, TAU); g.fill(); });
    ink(press, circle(x, y + 60, GR), { 'yellow.s': (g) => Riso.radial(g, x, y + 60, 12, GR, 0.45 * gf, 0) });
    line(press, [[x, -60], [x, y - 36]], 3, S({ navy: 1, 'yellow.s': 0.4 }), K);
    put(press, (g) => g.rect(x - 8, y - 40, 16, 16), S(BRASS_SH), K);
    // the shade: an opal dome, darker inside its rim, the bulb peeking below
    put(press, (g) => smooth(g, [[x - 12, y - 26], [x + 12, y - 26], [x + 44, y + 4], [x + 60, y + 30], [x - 60, y + 30], [x - 44, y + 4]]), S({ 'yellow.s': 0.2, 'blue.s': 0.05 }), K);
    put(press, (g) => smooth(g, [[x + 10, y - 24], [x + 40, y + 2], [x + 56, y + 26], [x + 30, y + 26], [x + 22, y]]), S({ 'yellow.s': 0.3, 'pink.s': 0.15, 'navy.s': 0.08 }), K);
    put(press, ellipse(x, y + 30, 60, 8), S({ 'yellow.s': 0.5, 'pink.s': 0.25 }), K);
    put(press, ellipse(x, y + 36, 14, 12), S({ yellow: 0.8 }), K);
    press.knockout((g) => { g.beginPath(); g.ellipse(x - 3, y + 34, 5, 4, 0, 0, TAU); g.fill(); });
    press.restore();
}

// a writing desk (1920s oak): a lit top, a thick edge, an apron with two drawers and brass
// pulls, tapered legs
function desk(press, S, K) {
    const { x0, x1, top } = DESK;
    for (const lx of [x0 + 30, x1 - 34]) put(press, (g) => poly(g, [[lx - 20, top + 60], [lx + 20, top + 60], [lx + 13, 852], [lx - 13, 852]]), S(W_DARK), K);
    put(press, (g) => g.rect(x0 + 10, top + 44, x1 - x0 - 20, 72), S(W_DARK), K);
    put(press, (g) => g.rect(x0, top + 18, x1 - x0, 30), S(W_EDGE), K);
    put(press, (g) => g.rect(x0, top, x1 - x0, 20), S(W_TOP), K);
    put(press, (g) => g.rect(x0, top + 18, x1 - x0, 4), S({ 'yellow.s': 0.5, 'pink.s': 0.25 }), K);
    // two drawers with pulls, the gap between them
    for (const [a, b] of [[x0 + 300, x0 + 440], [x0 + 450, x1 - 20]]) {
        line(press, [[a, top + 52], [b, top + 52], [b, top + 108], [a, top + 108], [a, top + 52]], 2.4, S({ navy: 1, 'pink.s': 0.3 }), K);
        const mx = (a + b) / 2;
        put(press, (g) => smooth(g, [[mx - 16, top + 76], [mx + 16, top + 76], [mx + 12, top + 86], [mx - 12, top + 86]]), S(BRASS_SH), K);
        put(press, ellipse(mx, top + 77, 16, 3), S(BRASS), K);
    }
    ink(press, (g) => g.rect(x0 + 10, top + 44, x1 - x0 - 20, 10), S({ 'navy.s': 0.7 }));
    const r = Motion.rng('desk-grain');
    for (let i = 0; i < 9; i++) {
        const yy = top + (r() < 0.4 ? 4 + r() * 12 : 24 + r() * 20), xa = x0 + r() * (x1 - x0), len = Math.min(80 + r() * 220, x1 - 8 - xa);
        if (len > 20) line(press, [[xa, yy], [xa + len * 0.5, yy + (r() - 0.5) * 3], [xa + len, yy + (r() - 0.5) * 3]], taper(1.6 + r() * 2), S(GRAIN), K);
    }
}

// a small stack of books, a cup of coffee on its saucer steaming, a fountain pen
function deskProps(press, tq, S, K) {
    const top = DESK.top + 4;
    const book = (bx, by, w, h, cover) => {
        put(press, (g) => g.rect(bx, by - h, w, h), S(cover), K);
        put(press, (g) => g.rect(bx + 8, by - h + 5, w - 8, h - 10), S({ 'yellow.s': 0.25, 'pink.s': 0.08 }), K);
        for (let i = 1; i < 3; i++) line(press, [[bx + 10, by - h + 5 + i * (h - 10) / 3], [bx + w - 2, by - h + 5 + i * (h - 10) / 3]], 1.4, S({ 'navy.s': 0.4 }), K);
        put(press, (g) => g.rect(bx, by - h, 9, h), S(cover), K);
    };
    book(126, top, 170, 26, { 'blue.s': 0.8, yellow: 1, 'navy.s': 0.4 });
    book(140, top - 26, 140, 22, { pink: 1, 'navy.s': 0.6 });
    book(132, top - 48, 150, 18, { navy: 1, 'pink.s': 0.5 });
    // the cup: saucer, a porcelain cup with a blue band, its handle, the coffee's steam
    const cx = 646;
    put(press, ellipse(cx, top - 2, 40, 7), S({ 'blue.s': 0.12, 'yellow.s': 0.05 }), K);
    put(press, (g) => smooth(g, [[cx - 26, top - 44], [cx + 26, top - 44], [cx + 22, top - 14], [cx + 12, top - 5], [cx - 12, top - 5], [cx - 22, top - 14]]), S({ 'yellow.s': 0.08, 'blue.s': 0.06 }), K);
    put(press, (g) => smooth(g, [[cx - 26, top - 44], [cx - 6, top - 44], [cx - 10, top - 20], [cx - 16, top - 8], [cx - 22, top - 14]]), S({ 'blue.s': 0.2, 'navy.s': 0.06 }), K);
    line(press, [[cx - 25, top - 34], [cx + 25, top - 34]], 3, S({ blue: 0.8 }), K);
    line(press, Ph.sample([[cx + 24, top - 38], [cx + 40, top - 34], [cx + 36, top - 20], [cx + 20, top - 16]], false, 6), 5, S({ 'yellow.s': 0.08, 'blue.s': 0.12 }), K);
    put(press, ellipse(cx, top - 44, 26, 5), S({ navy: 1, yellow: 1, pink: 0.6 }), K);
    // steam: three wisps rising and swaying, fading as they rise (closed form in tq)
    for (let k = 0; k < 3; k++) {
        const ph = ((tq * 0.55 + k / 3) % 1), y0 = top - 52 - ph * 50, pts = [];
        for (let i = 0; i < 8; i++) { const yy = y0 - i * 9; pts.push([cx - 10 + k * 10 + Math.sin(yy * 0.07 + tq * 2.2 + k * 2) * 6, yy]); }
        lineA(press, pts, taper(4.4, 0.4, 0.4), { 'blue.s': 0.1 }, 0.55 * Math.sin(ph * Math.PI) * (K.knock ? 1 : 0));
    }
    // a fountain pen lying by the books
    line(press, [[330, top - 4], [420, top - 8]], 7, S({ navy: 1, 'pink.s': 0.5 }), K);
    line(press, [[420, top - 8], [436, top - 8]], 4, S(BRASS), K);
    line(press, [[340, top - 6], [352, top - 7]], 7.5, S(BRASS_SH), K);
}

// a bentwood café chair (Thonet No. 14), side view: seat back corner at (0, 0)
function bentwood(press, d, fl, bh) {
    const WD = { 'yellow.s': 0.85, 'pink.s': 0.72, 'navy.s': 0.72 }, WL = { 'yellow.s': 0.75, 'pink.s': 0.5, 'navy.s': 0.35 };
    // back leg rising into the back's bent loop; the loop seen a little from the side
    line(press, [[6, fl], [0, fl * 0.5], [0, 0], [-10, -bh * 0.5], [-20, -bh * 0.95]], 13, WD);
    line(press, Ph.sample([[-18, -bh * 0.9], [-8, -bh * 1.02], [14, -bh * 0.98], [20, -bh * 0.6], [16, -30], [14, -4]], false, 8), 11, WL);
    line(press, Ph.sample([[-4, -bh * 0.75], [6, -bh * 0.82], [10, -bh * 0.5], [8, -40]], false, 6), 7, WD);
    // front legs splayed, the leg ring
    line(press, [[d - 10, 0], [d, fl]], 12, WL);
    line(press, [[d - 30, 0], [d - 26, fl]], 10, WD);
    line(press, Ph.sample([[4, fl * 0.62], [d * 0.5, fl * 0.6 + 6], [d - 4, fl * 0.62]], false, 6), 7, WD);
    // the caned seat: a rim with a hatched cane panel
    put(press, (g) => g.rect(-6, -16, d + 10, 18), WL);
    for (let x = 4; x < d; x += 14) line(press, [[x, -14], [x + 8, -2]], 1.6, { 'yellow.s': 0.5, 'navy.s': 0.4 });
    line(press, [[-6, 2], [d + 4, 2]], 3, { navy: 1, 'pink.s': 0.3 });
}

// ── Schrödinger (after photographs of c. 1926): 39, dark hair combed straight back from a
// high forehead, round wire spectacles, clean-shaven, a tweed suit, a bow tie. Near profile
// facing right, head centre (0, 0), in the manner of cast.js.
function lock(press, pts, w, o = {}) {
    line(press, pts, taper(w, o.a ?? 0.2, o.b ?? 0.4), HAIR);
    const off = (dd) => pts.map(([x, y], i) => {
        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
        const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
        return [x - (dy / l) * dd, y + (dx / l) * dd];
    });
    line(press, off(w * 0.2).slice(0, -1), taper(w * 0.2, 0.3, 0.3), HAIR_LT);
    line(press, off(-w * 0.28).slice(1), taper(w * 0.12, 0.3, 0.4), HAIR_DK);
}
function seatedLegs(press) {
    const fl = 452;
    put(press, (g) => smooth(g, [[-110, 280], [150, 280], [176, 380], [150, 420], [-100, 420], [-126, 360]]), SUIT_DK);
    put(press, (g) => smooth(g, [[40, 330], [230, 322], [280, 340], [284, 392], [200, 404], [40, 412]]), SUIT);
    put(press, (g) => smooth(g, [[232, 352], [284, 360], [282, 420], [272, fl - 26], [244, fl - 26], [232, 420], [226, 380]]), SUIT);
    line(press, [[280, 376], [276, 420], [272, fl - 30]], taper(4), { 'navy.s': 0.8, 'yellow.s': 0.4 });
    line(press, [[250, 380], [248, 420]], taper(3), SUIT_LT);
    // an oxford shoe: toe cap seam, laces
    put(press, (g) => smooth(g, [[236, fl - 30], [276, fl - 32], [300, fl - 20], [326, fl - 12], [328, fl], [236, fl]]), { navy: 1, yellow: 0.9, 'pink.s': 0.6 });
    line(press, [[300, fl - 20], [304, fl - 6]], 2, { 'yellow.s': 0.5, 'pink.s': 0.4 });
    for (let i = 0; i < 3; i++) line(press, [[272 + i * 7, fl - 30], [278 + i * 7, fl - 24]], 2, { 'yellow.s': 0.4, 'pink.s': 0.2 });
    line(press, [[244, fl - 6], [322, fl - 6]], 2.5, { 'yellow.s': 0.4, 'navy.s': 0.3 });
}
function schrodinger(press, o) {
    const look = o.look;
    // (o.noLegs: for a figure whose lower half is hidden, e.g. standing in a box)
    if (!o.noLegs) seatedLegs(press);
    // the jacket: shoulders, the lit front, a dark rim on the back, the near lapel
    put(press, (g) => smooth(g, [[-146, 164], [-104, 116], [-30, 104], [50, 102], [118, 120], [160, 180], [174, 320], [158, 400], [-128, 400], [-156, 310]]), SUIT);
    put(press, (g) => smooth(g, [[40, 106], [116, 124], [156, 182], [168, 320], [156, 400], [82, 400], [60, 210]]), SUIT_LT);
    line(press, Ph.sample([[-146, 170], [-104, 120], [-40, 106]], false, 6), taper(6), SUIT_DK);
    // tweed flecks
    const r = Motion.rng('tweed');
    for (let i = 0; i < 60; i++) {
        const x = -130 + r() * 290, y = 130 + r() * 260;
        line(press, [[x, y], [x + 4 + r() * 4, y + (r() - 0.5) * 3]], 1.6, r() < 0.5 ? { 'navy.s': 0.9, 'yellow.s': 0.7 } : { 'yellow.s': 0.3, 'pink.s': 0.2 });
    }
    // shirt front, the notched lapel, a buttoned front with a breast pocket and its square
    put(press, (g) => poly(g, [[10, 100], [46, 98], [62, 150], [42, 168]]), LINEN);
    line(press, [[34, 110], [48, 160]], taper(2.2), LINEN_SH);
    // the waistcoat (darker tweed) with its buttons, the jacket's notched lapel over it
    put(press, (g) => poly(g, [[40, 166], [62, 148], [76, 196], [78, 286], [58, 296], [46, 220]]), { navy: 1, 'yellow.s': 0.7, 'pink.s': 0.5 });
    for (const y of [196, 232, 268]) put(press, circle(62, y, 3.6), { yellow: 1, 'pink.s': 0.5, 'navy.s': 0.4 });
    put(press, (g) => poly(g, [[46, 104], [62, 100], [72, 122], [64, 128], [88, 200], [86, 272], [74, 272], [58, 200]]), SUIT_LT);
    line(press, [[56, 110], [60, 170], [72, 230], [76, 272]], taper(3), SUIT_DK);
    line(press, [[64, 128], [72, 122]], 2.6, SUIT_DK);
    line(press, [[88, 200], [86, 272], [84, 400]], taper(3.5), SUIT_DK);
    for (const y of [300, 350]) put(press, circle(92, y, 5), { navy: 1, 'pink.s': 0.5, yellow: 0.7 });
    line(press, [[104, 212], [148, 206]], 3, SUIT_DK);
    put(press, (g) => poly(g, [[112, 212], [124, 196], [132, 200], [140, 210]]), LINEN);
    // neck, the collar, the bow tie with small knocked-out spots
    put(press, (g) => smooth(g, [[-8, 46], [32, 48], [40, 94], [-12, 98]]), SKIN_SH);
    // a stiff turn-down collar: the band round the neck and its near point
    put(press, (g) => poly(g, [[-22, 76], [20, 70], [48, 78], [50, 92], [18, 90], [-22, 94]]), LINEN);
    line(press, [[-22, 94], [18, 90], [50, 92]], 3, { navy: 1, 'blue.s': 0.3 });
    put(press, (g) => poly(g, [[14, 78], [44, 80], [34, 104], [22, 96]]), LINEN);
    line(press, [[22, 96], [34, 104], [44, 80]], taper(2.2), LINEN_SH);
    const bow = [[38, 92], [16, 78], [8, 92], [16, 108], [38, 94], [58, 84], [66, 94], [58, 104]];
    put(press, (g) => poly(g, bow.slice(0, 5)), { navy: 1, 'pink.s': 0.7 });
    put(press, (g) => poly(g, [bow[4], bow[5], bow[6], bow[7]]), { navy: 1, 'pink.s': 0.55, 'blue.s': 0.3 });
    put(press, ellipse(38, 93, 7, 8), { navy: 1, pink: 0.6 });
    for (const [x, y] of [[18, 88], [16, 100], [26, 94], [56, 92], [58, 100]]) press.knockout(circle(x, y, 1.8));
    line(press, [[12, 84], [30, 92]], 1.6, { 'pink.s': 0.6 });
    // the face: high forehead, straight nose with a rounded tip, full lips, a firm chin
    const face = [[-42, -58], [0, -76], [42, -72], [54, -52], [58, -38], [55, -28], [63, -12], [74, 4], [79, 12], [74, 19], [65, 21], [68, 29], [63, 35], [68, 42], [62, 50], [65, 60], [58, 76], [36, 86], [2, 82], [-26, 60], [-46, 22], [-52, -20]];
    put(press, (g) => smooth(g, face), SKIN);
    press.save();
    press.clip((g) => smooth(g, face));
    put(press, (g) => smooth(g, [[-70, -60], [-16, -52], [-2, -20], [-8, 20], [4, 56], [28, 96], [-80, 110]]), SKIN_SH, { knock: false });
    put(press, (g) => smooth(g, [[18, -34], [50, -30], [54, -14], [28, -10], [14, -20]]), { 'pink.s': 0.18, 'yellow.s': 0.12 }, { knock: false });
    put(press, (g) => smooth(g, [[52, -20], [62, -4], [68, 12], [60, 18], [52, 4]]), SKIN_SH, { knock: false });
    put(press, ellipse(34, 24, 17, 12), CHEEK, { knock: false });
    put(press, (g) => smooth(g, [[16, 78], [44, 80], [58, 74], [46, 90], [8, 90]]), { 'yellow.s': 0.26, 'pink.s': 0.32, 'navy.s': 0.1 }, { knock: false });
    press.restore();
    line(press, [[55, -28], [63, -12], [74, 4], [79, 12]], taper(4, 0.2, 0.2), LINE);
    line(press, [[64, 19], [58, 18], [56, 12]], taper(4.5), INK);
    line(press, [[50, 33], [58, 35], [65, 34]], taper(4.6, 0.4, 0.1), INK);
    put(press, (g) => smooth(g, [[56, 36], [67, 37], [65, 43], [57, 42]]), { 'pink.s': 0.45, 'yellow.s': 0.15 });
    line(press, [[44, 56], [56, 54], [62, 50]], taper(3), LINE);
    line(press, [[14, 64], [30, 72], [48, 72]], taper(2.4), LINE);
    // brow, eye, the lid's fold
    line(press, [[14, -30], [32, -37], [54, -32]], taper(7, 0.2, 0.3), { navy: 1, yellow: 0.6, 'pink.s': 0.3 });
    Cast.eye(press, 40, -14, 28, look);
    line(press, [[16, 0], [32, 6], [46, 4]], taper(2.4), { 'pink.s': 0.5, 'navy.s': 0.15 });
    line(press, [[6, -52], [30, -56]], taper(2.4), { 'pink.s': 0.4 });
    // hair: dark brown, combed straight back from a high hairline with a wave lifting at the
    // front and fullness over the crown, short at the nape, the ear clear
    put(press, (g) => smooth(g, [[48, -80], [44, -94], [28, -104], [2, -108], [-28, -104], [-54, -94], [-74, -74], [-84, -44], [-86, -12], [-78, 18], [-66, 40], [-48, 46], [-40, 22], [-40, -8], [-30, -30], [-10, -50], [8, -64], [30, -72]]), HAIR);
    lock(press, [[48, -84], [30, -101], [-4, -106], [-40, -98], [-68, -78], [-82, -44]], 22, { a: 0.15 });
    lock(press, [[36, -78], [4, -94], [-34, -90], [-62, -68], [-78, -32]], 20, { a: 0.1 });
    lock(press, [[18, -68], [-14, -78], [-44, -70], [-64, -42], [-72, -6], [-62, 30]], 18, { a: 0.1 });
    lock(press, [[-34, -48], [-54, -26], [-58, 8], [-50, 38]], 14, { a: 0.1 });
    // the front wave's rim catching the lamp, and a stray lock at the crown
    line(press, Ph.sample([[50, -80], [48, -94], [34, -104], [12, -108]], false, 6), taper(4, 0.2, 0.4), HAIR_LT);
    line(press, Ph.sample([[-20, -106], [-34, -113], [-48, -108]], false, 5), taper(4.5, 0.2, 0.5), HAIR);
    // grey at the temple, over the ear
    line(press, [[-26, -34], [-36, -20], [-38, 0]], taper(4), { 'navy.s': 0.6, 'yellow.s': 0.5, 'pink.s': 0.3 });
    // the ear, in front of the hair
    const ear = [[-24, -24], [-10, -22], [-6, 0], [-12, 18], [-26, 20], [-32, -2]];
    put(press, (g) => smooth(g, ear), { 'yellow.s': 0.18, 'pink.s': 0.2 });
    put(press, (g) => smooth(g, [[-26, -18], [-16, -16], [-14, 0], [-20, 12], [-28, 10]]), SKIN_SH, { knock: false });
    line(press, Ph.sample([[-30, -8], [-24, -24], [-10, -22], [-6, 0], [-12, 18], [-26, 20]], false, 5), taper(2.6, 0.1, 0.2), LINE);
    line(press, Ph.sample([[-12, -16], [-10, -2], [-16, 10]], false, 5), taper(2.2), LINE);
    // the spectacles: a round wire rim round the eye, the glass's glint, the bridge and the
    // temple running back over the hair to the ear
    const lx = 44, ly = -13, rx = 15, ry = 18;
    const rim = Array.from({ length: 49 }, (_, i) => [lx + Math.cos(i / 48 * TAU) * rx, ly + Math.sin(i / 48 * TAU) * ry]);
    line(press, rim, 3.2, WIRE);
    press.knockout((g) => { poly(g, Ph.outline(Array.from({ length: 8 }, (_, i) => [lx + Math.cos(-2.4 + i * 0.1) * (rx - 5), ly + Math.sin(-2.4 + i * 0.1) * (ry - 5)]), taper(3))); g.fill(); });
    line(press, [[lx + rx - 1, ly - 6], [60, -20], [64, -22]], 2.6, WIRE);
    line(press, [[lx - rx + 1, ly - 4], [-4, -16], [-18, -18], [-26, -12], [-28, 0]], taper(3, 0.05, 0.3), WIRE);
}

// ── arms and hands (copied from newton-faraday: ik and the sleeve, in tweed) ─────────────
function ik(s, w, a, b, bend) {
    const dx = w[0] - s[0], dy = w[1] - s[1], d = Math.min(Math.hypot(dx, dy), a + b - 0.01);
    const ang = Math.atan2(dy, dx), c = Math.acos(Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d))));
    return [s[0] + Math.cos(ang + bend * c) * a, s[1] + Math.sin(ang + bend * c) * a];
}
function sleeve(press, s, e, w, width) {
    line(press, [s, e], (u) => width * (1 - 0.12 * u) + 7, SUIT_DK);
    line(press, [e, w], (u) => width * (0.88 - 0.18 * u) + 7, SUIT_DK);
    const SL = { 'navy.s': 0.66, 'yellow.s': 0.6, 'pink.s': 0.4 };
    line(press, [s, e], (u) => width * (1 - 0.12 * u), SL);
    line(press, [e, w], (u) => width * (0.88 - 0.18 * u), SL);
    for (const k of [-1, 0, 1]) line(press, [[e[0] - 12 + k * 10, e[1] - width * 0.3], [e[0] - 2 + k * 12, e[1] + width * 0.2]], taper(3), SUIT_DK);
    const nrm = (a, b, d) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [dy / l * d, -dx / l * d]; };
    const up = (n) => (n[1] > 0 ? [-n[0], -n[1]] : n);
    const u1 = up(nrm(s, e, width * 0.28)), u2 = up(nrm(e, w, width * 0.26));
    line(press, [[s[0] + u1[0] + (e[0] - s[0]) * 0.2, s[1] + u1[1] + (e[1] - s[1]) * 0.2], [e[0] + u1[0], e[1] + u1[1]]], taper(width * 0.2), SUIT_LT);
    line(press, [[e[0] + u2[0], e[1] + u2[1]], [w[0] + u2[0] - 10, w[1] + u2[1]]], taper(width * 0.2), SUIT_LT);
}
// the sheet of calculations: its lower left edge in the pinch, standing on the desk; rows of
// script-like marks, a small sketch of a wave with its nodes, nothing legible
// a right hand holding a sheet by its left edge: the back of the hand beside the edge (the
// fingers wrap behind the sheet, hidden), the thumb pressing on its face. Wrist at (0, 0).
function holdHand(press, part) {
    const TH = { 'yellow.s': 0.2, 'pink.s': 0.24, 'navy.s': 0.03 };
    if (part === 'back') {
        const back = [[-4, -8], [18, -16], [42, -14], [54, -6], [56, 22], [40, 32], [14, 28], [-4, 18]];
        put(press, (g) => smooth(g, back), SKIN);
        put(press, (g) => smooth(g, [[-4, 12], [20, 18], [44, 20], [56, 18], [40, 32], [10, 28]]), SKIN_SH, { knock: false });
        line(press, Ph.sample([[-4, -8], [18, -16], [42, -14], [54, -6]], false, 5), taper(2.2), LINE);
        line(press, Ph.sample([[-2, 18], [14, 28], [40, 32], [54, 24]], false, 5), taper(2.4), LINE);
        // the knuckles' ridge where the fingers turn behind the sheet, a vein
        line(press, Ph.sample([[46, -12], [50, 0], [50, 14]], false, 4), taper(2.2), LINE);
        line(press, [[6, -4], [20, -6], [32, -2]], taper(1.8), { 'blue.s': 0.3, 'pink.s': 0.2 });
        return;
    }
    // the thumb: from the heel of the hand across the edge onto the sheet, its nail at the tip
    line(press, [[26, -6], [46, -12], [62, -10], [74, -4]], taper(14, 0.1, 0.45), TH);
    line(press, Ph.sample([[34, 0], [50, -4], [64, -2], [75, 2]], false, 5), taper(2.2, 0.2, 0.3), LINE);
    line(press, Ph.sample([[40, -16], [56, -17], [70, -12]], false, 5), taper(1.8, 0.2, 0.3), LINE);
    put(press, ellipse(70, -6, 5, 3.4, -0.2), { 'pink.s': 0.3, 'yellow.s': 0.06 });
    press.knockout(ellipse(71, -7, 2, 1.2, -0.2));
    line(press, [[56, -14], [58, -8]], taper(1.8), LINE);
}
function sheet(press) {
    press.save();
    press.each((g) => g.translate(0, -22));
    const pg = [[48, 74], [140, 71], [146, -60], [54, -56]];
    put(press, (g) => poly(g, pg), PAPER);
    put(press, (g) => poly(g, [[124, 72], [140, 71], [146, -60], [134, -50]]), { 'yellow.s': 0.16, 'pink.s': 0.08, 'navy.s': 0.12 }, { knock: false });
    line(press, [[48, 74], [140, 71]], 2, { 'navy.s': 0.4 });
    const r = Motion.rng('sheet-marks');
    for (let row = 0; row < 8; row++) {
        const y = -46 + row * 11 + (row > 3 ? 34 : 0);
        if (y > 64) break;
        let x = 62 + r() * 6;
        while (x < 128) {
            const wlen = 8 + r() * 18, pts = [];
            for (let k = 0; k <= 4; k++) pts.push([x + (k / 4) * wlen, y + (k % 2 ? -2.5 : 1.5) * (0.5 + r())]);
            line(press, pts, 1.7, { navy: 0.85 });
            x += wlen + 5 + r() * 6;
        }
    }
    // the sketch: a box with a standing wave and two nodes, between the rows
    line(press, [[66, 0], [66, 28]], 1.8, { navy: 0.85 });
    line(press, [[130, 0], [130, 28]], 1.8, { navy: 0.85 });
    line(press, Array.from({ length: 31 }, (_, i) => [66 + i * 64 / 30, 14 - Math.sin(i / 30 * 3 * Math.PI) * 10]), 1.8, { 'pink.s': 0.9, navy: 0.4 });
    for (const x of [87.3, 108.7]) put(press, circle(x, 14, 2.4), { pink: 0.9 });
    press.restore();
}

// ── the frame ─────────────────────────────────────────────────────────────────────────────
function frame(press, tq) {
    const cm = camera(tq), cz = cm.z, v = view(tq);
    const fb = Ease.out(seg(tq, TM.build[0], TM.build[1]));
    const S = (spec) => (fb < 1 ? fade(spec, fb) : spec), K = { knock: fb >= 1 };
    press.save();
    press.each((g) => { g.translate(800, 450); g.scale(cz, cz); g.translate(-cm.c[0], -cm.c[1]); });
    // the study
    if (fb > 0) {
        room(press, S, K);
        winterWindow(press, 150, 60, 130, 176, tq, S, K);
        mountainPicture(press, 566, 92, 116, 78, S, K);
        skis(press, tq, S, K);
        pendantLamp(press, 470, 140, tq, S, K, fb);
    }
    // Schrödinger: breathing, the gaze on the sheet then on the node he watches
    const br = Math.sin(tq * TAU * 0.28) * 1.4;
    const eyeW = [H[0] + 40 * NS, H[1] - 14 * NS];
    const node = P(v, -1 / 3, 0, 0);
    const k1 = Ease.inOut(seg(tq, TM.adjust[0], 0.55)), k2 = Ease.inOut(seg(tq, 0.55, TM.adjust[1]));
    const target = tq < TM.gaze ? [480, 560] : node;
    const dx = target[0] - eyeW[0], dy = target[1] - eyeW[1], dl = Math.hypot(dx, dy) || 1;
    const look = [Math.max(0.2, dx / dl), Math.max(-0.9, Math.min(1, dy / dl * 1.6))];
    Ph.cam(press, H[0], H[1], NS, () => {
        Ph.cam(press, -178, 300, 1, () => bentwood(press, 320, 152, 300));
        Ph.cam(press, 0, br, 1, () => schrodinger(press, { look }));
    });
    if (fb > 0) { desk(press, S, K); deskProps(press, tq, S, K); }
    // the near arm: the elbow on the desk, the hand steadying the sheet (still from 1.0 s)
    Ph.cam(press, H[0], H[1], NS, () => {
        const wr = [66 + 6 * k2, 200 - 10 * k1 + 10 * k2], rot = -0.1 * k1 + 0.1 * k2;
        const sh = [-50, 128 + br], el = ik(sh, [wr[0] - 6, wr[1] + 4], 110, 104, 1);
        const we = [wr[0] - 6, wr[1] + 4];
        sleeve(press, sh, el, we, 60);
        // the shirt cuff across the forearm's end
        const fd = Math.hypot(we[0] - el[0], we[1] - el[1]) || 1, d = [(we[0] - el[0]) / fd, (we[1] - el[1]) / fd];
        line(press, [[we[0] - d[0] * 20, we[1] - d[1] * 20], [we[0] + d[0] * 2, we[1] + d[1] * 2]], 42, LINEN);
        line(press, [[we[0] - d[0] * 20 - d[1] * 20, we[1] - d[1] * 20 + d[0] * 20], [we[0] - d[0] * 20 + d[1] * 20, we[1] - d[1] * 20 - d[0] * 20]], 3, SUIT_DK);
        line(press, [[we[0] - d[0] * 4 + d[1] * 18, we[1] - d[1] * 4 - d[0] * 18], [we[0] + d[1] * 12, we[1] - d[0] * 12]], taper(2.4), LINEN_SH);
        Ph.cam(press, wr[0], wr[1], 1, () => {
            press.each((g) => g.rotate(rot));
            holdHand(press, 'back');
            sheet(press);
            holdHand(press, 'thumb');
        });
    });
    // the domain
    boxEdges(press, v, cz, tq, 'back');
    density(press, v, cz, tq);
    nodal(press, v, cz, tq);
    boxEdges(press, v, cz, tq, 'front');
    wave1D(press, v, cz, tq);
    press.restore();
}

Seg.schrodinger = {
    init() { return {}; },
    draw(press, tq, st) {
        if (tq >= TM.atlas) return this.atlas(press, tq, st);
        frame(press, tq);
    },
    // the vignette: the frame from 5 s on (only the small motions change)
    atlas(press, tq, st) { frame(press, Math.max(tq, TM.atlas)); },
    // the figure and its pieces, for other segments (schrodinger-box)
    parts: { schrodinger, lock, sleeve, SUIT, SUIT_LT, SUIT_DK, HAIR, HAIR_DK },
};
})();
