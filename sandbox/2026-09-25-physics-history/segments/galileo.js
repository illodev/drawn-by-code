// Segment FIS-01 + FIS-02 of physics-history (0–8 s of the piece; local time 0–8): Galileo,
// Padua, January 1610.
//
//   0–2    FIS-01 · Look. A macro (≈ 85 mm) on the eyepiece: a lens set diagonally in a dusty
//          brass rim; an amber reflection sweeps the glass; the camera slides left and finds
//          Galileo's eye; a turn of the rim gathers the reflection into one point of light;
//          the camera travels along the leather tube (the point, at infinity, stays put).
//   2–3.5  FIS-02 · The observatory opens out of the window, round the same point (Jupiter):
//          Galileo, three-quarter view, finishes turning the focusing collar and leans in.
//   3.5–6.5 the telescope's field opens on the right: Jupiter and its four moons in three
//          configurations (three nights condensed), moving along soft ellipses, earlier
//          positions left as faint marks; each night he records a row in his notebook.
//   6.5–8  an amber pencil ring circles the planet and the camera enters it (the scene draws
//          Newton's study inside ring(lt), see Seg.galileo.ring).
//
//   Seg.galileo.draw(press, tq, st)     local time on twos
//   Seg.galileo.ring(lt)                { c, r, w } in screen units from lt ≥ 6.9, else null
//   Seg.galileo.atlas(press, tq, st)    the finale's vignette
var Seg = globalThis.Seg ?? (globalThis.Seg = {});
(() => {
const { put, ink, line, smooth, poly, taper, circle, ellipse } = Ph;
const lerp = Ease.lerp, seg = Ease.seg;

// ── timings (local seconds, on the 120 BPM grid where it lands a beat) ─────────────────────
const TM = {
    sweep: [0.08, 1.0], pan: [0.25, 1.25], blink: 0.75, adjust: [1.08, 1.5], travel: [1.5, 2.0],
    pull: [2.0, 3.0], focus: [2.0, 3.1], lean: [3.1, 3.5], fov: [3.5, 3.92],
    nights: [4.0, 5.0, 6.0], hop: 0.5, pencil: [6.5, 6.84],
};

// ── colours as separations ────────────────────────────────────────────────────────────────
const AMBER = { yellow: 1, 'pink.s': 0.55 };
const BRASS = { yellow: 1, 'pink.s': 0.22, 'navy.s': 0.08 };
const BRASS_SH = { yellow: 1, 'pink.s': 0.4, 'navy.s': 0.45 };
const BRASS_DK = { yellow: 1, 'pink.s': 0.55, 'navy.s': 0.78 };
const LEATHER = { pink: 0.85, 'yellow.s': 0.55, 'navy.s': 0.5 };
const LEATHER_LT = { pink: 0.7, 'yellow.s': 0.5, 'navy.s': 0.22 };
const LEATHER_DK = { pink: 0.9, 'yellow.s': 0.6, 'navy.s': 0.82 };
const GOLD = { yellow: 1, 'pink.s': 0.18 };
const SKIN = Cast.SKIN, SKIN_SH = Cast.SKIN_SH;
const SKIN_DK = { 'yellow.s': 0.36, 'pink.s': 0.5, 'navy.s': 0.2 };
const CHEEK = { 'pink.s': 0.3, 'yellow.s': 0.1 };
const LINE = { 'pink.s': 0.55, 'navy.s': 0.4 };
const INK = { navy: 1 };
const COAT = Cast.COAT, COAT_LIT = Cast.COAT_LIT;
const COAT_DK = { navy: 1, yellow: 1, pink: 0.7 };
const LINEN = Cast.LINEN, LINEN_SH = Cast.LINEN_SH;
const HAIR = { 'pink.s': 0.45, yellow: 0.9, 'navy.s': 0.74 };
const HAIR_LT = { 'pink.s': 0.35, yellow: 0.75, 'navy.s': 0.32 };
const HAIR_DK = { 'pink.s': 0.5, yellow: 1, navy: 1 };
const WOOD = { 'yellow.s': 0.85, 'pink.s': 0.6, 'navy.s': 0.45 };
const WOOD_LT = { 'yellow.s': 0.7, 'pink.s': 0.42, 'navy.s': 0.2 };
const WOOD_DK = { 'yellow.s': 0.8, 'pink.s': 0.65, 'navy.s': 0.72 };
const PAPER = { 'yellow.s': 0.16, 'pink.s': 0.05 };
const PENCIL = { navy: 0.9, 'pink.s': 0.35 };
const SKY = { navy: 1, 'blue.s': 0.35 };

// ── geometry (world = screen when the wide camera rests) ──────────────────────────────────
const NS = 1.18;                        // the portrait's scale (as Newton's and Faraday's)
const H0 = [410, 340], H1 = [428, 331]; // head centre sitting back / leaning into the eyepiece
const E = [504, 297];                   // the eyepiece's face
const JW = [1180, 140];                 // Jupiter in the window (the tube points at it)
const D = (() => { const dx = JW[0] - E[0], dy = JW[1] - E[1], l = Math.hypot(dx, dy); return [dx / l, dy / l]; })();
const N = [-D[1], D[0]];                // the tube's normal, pointing down
const ANG = Math.atan2(D[1], D[0]);
const TUBE_L = 560, FORK_S = 380, GRIP_S = 57;
const at = (s, n = 0) => [E[0] + D[0] * s + N[0] * n, E[1] + D[1] * s + N[1] * n];
const TOP = 610;                        // the table top
const FOV = { c: [1175, 330], r: 292 }; // the telescope's field (screen), Jupiter at its centre
const RJ = 30;                          // Jupiter's disc in the field
// the Galilean moons: orbit radii in the field (Io, Europa, Ganymede, Callisto keep their real
// ratios 5.9 : 9.4 : 15 : 26.4 Jupiter radii), periods in days, phases on the first night
const MOONS = { a: [60, 96, 153, 265], P: [1.769, 3.551, 7.155, 16.69], th: [3.976, 4.022, 1.077, 1.224], tilt: -0.05, flat: 0.075 };
const RING = { r0: 72, w: 9, t0: 83 / 12, t1: 95 / 12, r1: 1180 };
const M = { lens: [400, 450], eye: [-190, 408] }; // the macro's layers (FIS-01)

// ── small helpers ─────────────────────────────────────────────────────────────────────────
const rot = (p, a) => [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a)];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
function ik(s, w, a, b, bend) {
    const dx = w[0] - s[0], dy = w[1] - s[1], d = Math.min(Math.hypot(dx, dy), a + b - 0.01);
    const ang = Math.atan2(dy, dx), c = Math.acos(Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d))));
    return [s[0] + Math.cos(ang + bend * c) * a, s[1] + Math.sin(ang + bend * c) * a];
}
// an annulus between two ellipses (the outer clockwise, the inner anticlockwise)
const annulus = (c, rx0, ry0, rx1, ry1, r = 0) => (g) => {
    g.ellipse(c[0], c[1], rx0, ry0, r, 0, Math.PI * 2);
    g.moveTo(c[0] + Math.cos(r) * rx1, c[1] + Math.sin(r) * rx1);
    g.ellipse(c[0], c[1], rx1, ry1, r, 0, Math.PI * 2, true);
};
// a knocked-out glint (a paper stroke)
const glint = (press, pts, w) => press.knockout((g) => { poly(g, Ph.outline(pts, taper(w, 0.3, 0.3))); g.fill(); });
// a lock of hair: a tapered stroke with a lit strand and a dark crease (as in cast.js)
function lock(press, pts, w, base, lit, dark, o = {}) {
    line(press, pts, taper(w, o.a ?? 0.25, o.b ?? 0.35), base);
    const off = (d) => pts.map(([x, y], i) => {
        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
        const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
        return [x - (dy / l) * d, y + (dx / l) * d];
    });
    line(press, off(-w * 0.18).slice(0, -1), taper(w * 0.22, 0.3, 0.3), lit);
    line(press, off(w * 0.3).slice(1), taper(w * 0.12, 0.3, 0.4), dark);
}

// ══ FIS-01 · the macro ════════════════════════════════════════════════════════════════════
function macroCam(tq) {
    return {
        pan: 640 * Ease.inOut(seg(tq, TM.pan[0], TM.pan[1])),
        trav: -3600 * Math.pow(seg(tq, TM.travel[0], TM.travel[1]), 1.4),
        z: 1 + 0.05 * Ease.inOut(seg(tq, 0, TM.travel[0])),
    };
}
function lensState(tq) {
    const u = seg(tq, TM.adjust[0], TM.adjust[1]), a = Ease.inOut(u);
    return { c: [M.lens[0] + 4 * a, M.lens[1] - 10 * a], rx: lerp(176, 196, a), ry: 272, rot: lerp(-0.32, -0.17, a) + Math.sin(u * Math.PI) * 0.025, a };
}
// lens-normalised coordinates → layer coordinates
const lensPt = (L, u, v) => add(L.c, rot([u * L.rx, v * L.ry], L.rot));
const TUNNEL = [0.26, -0.02]; // where the tube's far end (and the point of light) sits in the glass
// the point of light on screen once the rim is turned (it stays there through the travel)
function pointScreen() {
    const cm = macroCam(TM.travel[0]), L = lensState(TM.travel[0]);
    const p = lensPt(L, TUNNEL[0], TUNNEL[1]);
    return [800 + (p[0] + cm.pan - 800) * cm.z, 450 + (p[1] - 450) * cm.z];
}

function macro(press, tq) {
    const cm = macroCam(tq), L = lensState(tq), d = Math.round(tq * 12);
    const layer = (f, fn) => {
        press.save();
        press.each((g) => { g.translate(800, 450); g.scale(cm.z, cm.z); g.translate(-800 + (cm.pan + cm.trav) * f, -450); });
        fn();
        press.restore();
    };
    // the room far behind, out of focus: the candle and the window as soft discs
    layer(0.45, () => bokeh(press, tq));
    // Galileo's face, a little behind the eyepiece
    layer(0.85, () => {
        const blink = Ease.bump(tq, TM.blink, 0.25);
        eyeMacro(press, M.eye, { look: 0.55 + 0.25 * seg(tq, 0.4, 1.0), lid: blink, pupil: 1 + 0.18 * Ease.inOut(seg(tq, 1.1, 1.5)), brow: -8 * Ease.inOut(seg(tq, 1.0, 1.4)) });
    });
    // the tube and the eyepiece
    const prev = macroCam(tq - 1 / 12);
    layer(1, () => {
        macroTube(press, L, tq, (cm.trav - prev.trav));
        lensMacro(press, L, tq);
    });
    // dust drifting in the air, nearest of all
    layer(1.25, () => {
        const r = Motion.rng('air-dust');
        for (let i = 0; i < 18; i++) {
            const x = r() * 1900 - 300, y = r() * 900, s = 1.6 + r() * 2.6, ph = r() * 6.3;
            put(press, circle(x + Math.sin(tq * 0.7 + ph) * 16, y - tq * 10 + Math.cos(tq * 0.9 + ph) * 8, s), { 'yellow.s': 0.3, 'blue.s': 0.1 });
        }
    });
    // the point of light: once gathered it belongs to the sky, so the travel doesn't move it
    const g = Ease.out(seg(tq, TM.adjust[0] + 0.2, TM.adjust[1]));
    if (g > 0) {
        const p = tq >= TM.travel[0] ? pointScreen() : (() => { const q = lensPt(L, TUNNEL[0], TUNNEL[1]); return [800 + (q[0] + cm.pan - 800) * cm.z, 450 + (q[1] - 450) * cm.z]; })();
        lightPoint(press, p, g, d);
    }
}

function lightPoint(press, p, g, d) {
    const tw = 1 + 0.08 * Motion.noise1('lp', d * 0.9), R = 64 * g * tw;
    press.knockout((c) => { c.fillStyle = Riso.radial(c, p[0], p[1], 3, R, 0.95, 0); c.beginPath(); c.arc(p[0], p[1], R, 0, Math.PI * 2); c.fill(); });
    ink(press, circle(p[0], p[1], R), { 'yellow.s': (c) => Riso.radial(c, p[0], p[1], 4, R, 0.95, 0) });
    // four faint rays
    for (const a of [0.3, 0.3 + Math.PI / 2]) line(press, [[p[0] - Math.cos(a) * R * 0.9, p[1] - Math.sin(a) * R * 0.9], [p[0] + Math.cos(a) * R * 0.9, p[1] + Math.sin(a) * R * 0.9]], taper(4 * g, 0.5, 0.5), { 'yellow.s': 0.7 });
    put(press, circle(p[0], p[1], 11 * g), { yellow: 1 });
    press.knockout(circle(p[0], p[1], 5 * g));
}

function bokeh(press, tq) {
    const d = Math.round(tq * 12);
    const DISCS = [[1250, 150, 130, 'w'], [1520, 760, 100, 'w'], [640, 840, 80, 'b'], [180, 110, 70, 'w'], [980, 90, 60, 'b'], [1880, 300, 120, 'b'], [2100, 820, 110, 'w']];
    DISCS.forEach(([x, y, r, k], i) => {
        const fl = k === 'w' ? 1 + 0.06 * Motion.noise1('bk' + i, d * 0.6) : 1, R = r * fl;
        press.knockout((g) => { g.fillStyle = Riso.radial(g, x, y, R * 0.3, R, k === 'w' ? 0.3 : 0.18, 0); g.beginPath(); g.arc(x, y, R, 0, Math.PI * 2); g.fill(); });
        ink(press, circle(x, y, R), k === 'w' ? { 'yellow.s': (g) => Riso.radial(g, x, y, R * 0.2, R, 0.45, 0), 'pink.s': (g) => Riso.radial(g, x, y, R * 0.2, R, 0.2, 0) } : { 'blue.s': (g) => Riso.radial(g, x, y, R * 0.2, R, 0.35, 0) });
    });
}

// the eyepiece rim and its glass
function lensMacro(press, L, tq) {
    const { c, rx, ry, rot: r } = L, T = 46, depth = [Math.cos(r) * 38, Math.sin(r) * 38];
    // the rim's side (a short brass cylinder, seen past its face)
    const back = add(c, depth);
    put(press, (g) => { g.ellipse(back[0], back[1], rx + T, ry + T, r, 0, Math.PI * 2); }, BRASS_DK);
    put(press, (g) => { g.moveTo(...lensPt({ c, rx: rx + T, ry: ry + T, rot: r }, 0, -1)); poly(g, [lensPt({ c, rx: rx + T, ry: ry + T, rot: r }, 0, -1), add(lensPt({ c, rx: rx + T, ry: ry + T, rot: r }, 0, -1), depth), add(lensPt({ c, rx: rx + T, ry: ry + T, rot: r }, 0, 1), depth), lensPt({ c, rx: rx + T, ry: ry + T, rot: r }, 0, 1)]); }, BRASS_SH);
    // the face of the rim: brass, darker on the lower left, a bevel, a knurled edge
    put(press, annulus(c, rx + T, ry + T, rx, ry, r), BRASS);
    press.save();
    press.clip(annulus(c, rx + T, ry + T, rx, ry, r));
    const sh = lensPt(L, -0.9, 0.7);
    ink(press, (g) => g.rect(-2000, -2000, 6000, 6000), { 'navy.s': (g) => Riso.radial(g, sh[0], sh[1], 30, 420, 0.55, 0), 'pink.s': (g) => Riso.radial(g, sh[0], sh[1], 30, 420, 0.35, 0) });
    press.restore();
    // the bevel (inner lip) and the knurling: ticks round the outer edge
    const ringPts = (k, a0 = 0, a1 = Math.PI * 2, n = 90) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return add(c, rot([Math.cos(a) * (rx + k), Math.sin(a) * (ry + k)], r)); });
    line(press, ringPts(9), 7, BRASS_SH);
    line(press, ringPts(T - 4), 3, BRASS_SH);
    for (let i = 0; i < 120; i++) {
        const a = i / 120 * Math.PI * 2;
        const p0 = add(c, rot([Math.cos(a) * (rx + T - 9), Math.sin(a) * (ry + T - 9)], r)), p1 = add(c, rot([Math.cos(a) * (rx + T + 1), Math.sin(a) * (ry + T + 1)], r));
        line(press, [p0, p1], 2.6, { navy: 0.85, 'pink.s': 0.3 });
    }
    // highlights on the face: two paper arcs on the upper right, a hot yellow core
    glint(press, ringPts(24, -1.35, -0.35, 30), 9);
    glint(press, ringPts(34, -0.2, 0.25, 12), 5);
    glint(press, ringPts(18, 2.2, 2.6, 10), 4);
    // dust and grit on the rim: fluff, specks, a hair
    const rr = Motion.rng('rim-dust');
    for (let i = 0; i < 38; i++) {
        const a = rr() * Math.PI * 2, k = 12 + rr() * (T - 16), p = add(c, rot([Math.cos(a) * (rx + k), Math.sin(a) * (ry + k)], r)), s = 2.6 + rr() * 3.6;
        if (rr() < 0.55) put(press, ellipse(p[0], p[1], s, s * 0.7, rr() * 3), { 'blue.s': 0.12, 'yellow.s': 0.06 });
        else put(press, ellipse(p[0], p[1], s * 0.8, s * 0.6, rr() * 3), { navy: 0.8, 'pink.s': 0.4 });
    }
    for (const [a, len] of [[2.7, 60], [4.3, 44], [0.9, 30]]) {
        const p = add(c, rot([Math.cos(a) * (rx + 22), Math.sin(a) * (ry + 22)], r));
        line(press, [p, [p[0] + len * 0.5, p[1] - 8], [p[0] + len, p[1] + 6]], taper(3.6, 0.2, 0.3), { 'blue.s': 0.12, 'yellow.s': 0.06 });
    }
    // the glass
    glass(press, L, tq);
}

function glass(press, L, tq) {
    const { c, rx, ry, rot: r } = L;
    const shape = (g) => g.ellipse(c[0], c[1], rx, ry, r, 0, Math.PI * 2);
    put(press, shape, { blue: 0.62, 'navy.s': 0.5 });
    press.save();
    press.clip(shape);
    // looking down the tube: baffle rings receding towards its far end, lighter towards us
    for (let k = 0; k < 6; k++) {
        const f = 1 - k * 0.15, cu = TUNNEL[0] * (k / 5), cv = TUNNEL[1] * (k / 5);
        const cc = lensPt(L, cu, cv), pts = Array.from({ length: 61 }, (_, i) => { const a = i / 60 * Math.PI * 2; return add(cc, rot([Math.cos(a) * rx * f * 0.94, Math.sin(a) * ry * f * 0.94], r)); });
        line(press, pts, 7 - k * 0.8, k < 2 ? { 'blue.s': 0.45, 'navy.s': 0.35 } : { navy: 1, 'blue.s': 0.5 });
    }
    // the far end: a small disc of night sky with a darker rim
    const fe = lensPt(L, TUNNEL[0], TUNNEL[1]);
    put(press, ellipse(fe[0], fe[1], rx * 0.2, ry * 0.2, r), { navy: 1, yellow: 0.7 });
    put(press, ellipse(fe[0], fe[1], rx * 0.14, ry * 0.14, r), { blue: 0.8, 'navy.s': 0.6 });
    // the glass's own surface: a soft sheen on the upper right and the edge's thickness
    const sh = lensPt(L, 0.35, -0.45);
    press.knockout((g) => { g.fillStyle = Riso.radial(g, sh[0], sh[1], 10, rx * 0.9, 0.35, 0); shape(g); g.fill(); });
    ink(press, shape, { 'blue.s': (g) => Riso.radial(g, sh[0], sh[1], 10, rx * 0.9, 0.3, 0) });
    const edge = Array.from({ length: 40 }, (_, i) => { const a = 1.7 + i / 39 * 2.2; return add(c, rot([Math.cos(a) * (rx - 10), Math.sin(a) * (ry - 10)], r)); });
    put(press, (g) => poly(g, Ph.outline(edge, taper(16, 0.3, 0.3))), { 'blue.s': 0.4, 'yellow.s': 0.08 });
    // a window's reflection: two pale panes, bent by the curve of the glass
    const win = (u0, v0, w, h) => [lensPt(L, u0, v0), lensPt(L, u0 + w, v0 - 0.03), lensPt(L, u0 + w + 0.02, v0 + h), lensPt(L, u0 + 0.03, v0 + h + 0.02)];
    for (const [u0, v0] of [[-0.62, -0.62], [-0.44, -0.64]]) {
        const q = win(u0, v0, 0.14, 0.24);
        press.knockout((g) => { g.fillStyle = 'rgba(0,0,0,0.4)'; poly(g, q); g.fill(); });
        ink(press, (g) => poly(g, q), { 'blue.s': 0.25 });
    }
    // the amber reflection sweeping across, then gathering into the point
    const s = Ease.inOut(seg(tq, TM.sweep[0], TM.sweep[1])), a = L.a;
    if (s > 0 && a < 0.98) {
        // a curved band of candlelight: a broad warm screen, a hot core, a paper glint
        const uc = lerp(lerp(-1.3, 0.5, s), TUNNEL[0], a), span = 0.9 * (1 - a), w = 0.36 * rx * (1 - a * 0.8);
        const pts = [];
        for (let i = 0; i <= 16; i++) {
            const v = -span + 2 * span * (i / 16);
            pts.push(lensPt(L, uc + 0.32 * v * v - 0.12 * span, v + TUNNEL[1] * a));
        }
        line(press, pts, taper(w, 0.45, 0.45), { 'yellow.s': 0.75, 'pink.s': 0.4 });
        line(press, pts, taper(w * 0.42, 0.4, 0.4), { yellow: 1, 'pink.s': 0.5 }, { knock: false });
        glint(press, pts.slice(4, 13), w * 0.12);
        // a thin echo from the glass's back surface
        line(press, pts.map(([x, y]) => [x + 34, y + 8]), taper(w * 0.12, 0.4, 0.4), { 'yellow.s': 0.6, 'pink.s': 0.3 });
    }
    // dust on the glass, catching the light
    const rr = Motion.rng('glass-dust');
    for (let i = 0; i < 9; i++) {
        const p = lensPt(L, rr() * 1.4 - 0.7, rr() * 1.4 - 0.7);
        put(press, circle(p[0], p[1], 1.6 + rr() * 2), { 'yellow.s': 0.2 });
    }
    line(press, [lensPt(L, -0.3, 0.5), lensPt(L, -0.22, 0.46), lensPt(L, -0.16, 0.52)], 1.8, { 'blue.s': 0.15 });
    press.restore();
}

// the leather tube behind the rim, running right and away; tooled in gold
function macroTube(press, L, tq, dv) {
    const dir = [Math.cos(-0.04), Math.sin(-0.04)], nr = [-dir[1], dir[0]];
    const ax = (s) => add(L.c, [dir[0] * s, dir[1] * s]);
    const S1 = 4200, h = (s) => lerp(236, 150, Math.min(1, s / S1));
    const edge = (s, k) => add(ax(s), [nr[0] * h(s) * k, nr[1] * h(s) * k]);
    const body = (s0, s1, spec) => {
        const pts = [];
        for (let s = s0; s <= s1; s += 100) pts.push(edge(s, -1));
        for (let s = s1; s >= s0; s -= 100) pts.push(edge(s, 1));
        put(press, (g) => poly(g, pts), spec);
    };
    // the brass draw tube behind the rim, then the leather
    body(0, 170, BRASS_SH);
    body(170, S1, LEATHER);
    // cylinder shading: a lit band along the top, a dark one underneath
    const band = (k0, k1, spec, s0 = 170, s1 = S1) => {
        const pts = [];
        for (let s = s0; s <= s1; s += Math.min(100, (s1 - s0) / 2)) pts.push(add(ax(s), [nr[0] * h(s) * k0, nr[1] * h(s) * k0]));
        for (let s = s1; s >= s0; s -= Math.min(100, (s1 - s0) / 2)) pts.push(add(ax(s), [nr[0] * h(s) * k1, nr[1] * h(s) * k1]));
        put(press, (g) => poly(g, pts), spec);
    };
    band(-0.92, -0.55, LEATHER_LT);
    band(0.5, 1, LEATHER_DK);
    band(-0.86, -0.7, { 'yellow.s': 0.5, 'pink.s': 0.2 }, 0, 150);
    // leather grain and scuffs
    const r = Motion.rng('leather');
    for (let i = 0; i < 90; i++) {
        const s = 200 + r() * (S1 - 260), k = r() * 1.7 - 0.85, p = add(ax(s), [nr[0] * h(s) * k, nr[1] * h(s) * k]), len = 12 + r() * 40;
        line(press, [p, [p[0] + len, p[1] + (r() - 0.5) * 6]], 1.6 + r() * 1.4, r() < 0.5 ? { pink: 0.9, 'navy.s': 0.9, 'yellow.s': 0.6 } : { pink: 0.6, 'yellow.s': 0.45, 'navy.s': 0.1 });
    }
    // the brass collar between draw tube and leather
    body(150, 196, BRASS);
    band(-0.9, -0.6, { yellow: 1 }, 150, 196);
    band(0.4, 1, BRASS_SH, 150, 196);
    // gold tooling: pairs of fillets round the tube with a row of dots between, and a small
    // stamped flower in each panel
    const arc = (s, k0 = -1, k1 = 1) => Array.from({ length: 13 }, (_, i) => { const ph = lerp(Math.asin(k0), Math.asin(k1), i / 12); return add(ax(s - 0.2 * h(s) * Math.cos(ph)), [nr[0] * h(s) * Math.sin(ph), nr[1] * h(s) * Math.sin(ph)]); });
    const smear = Math.min(0, dv); // the travel moves everything left: trails to the right
    for (let s = 330; s < S1 - 100; s += 340) {
        for (const ds of [0, 16, 58, 74]) {
            const a = arc(s + ds, -0.97, 0.97);
            line(press, a, 4, GOLD);
            if (smear < -40) ink(press, (g) => poly(g, a.concat(a.slice().reverse().map(([x, y]) => [x + Math.min(90, -smear * 0.25), y]))), { 'yellow.s': 0.3 });
        }
        for (let i = 1; i < 12; i++) { const p = arc(s + 37, -0.9, 0.9)[i]; put(press, circle(p[0], p[1], 4.2), GOLD); }
        // the panel's stamp: a four-petalled flower of gold dots
        const m = add(ax(s + 200), [0, 0]);
        for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.785; put(press, ellipse(m[0] + Math.cos(a) * 13, m[1] + Math.sin(a) * 13, 8, 4.5, a), GOLD); }
        put(press, circle(m[0], m[1], 4), GOLD);
    }
}

// the eye in macro: 3/4, looking right into the eyepiece. c = its centre; the eye is ≈ 350 wide
function eyeMacro(press, c, o) {
    press.save();
    press.each((g) => g.translate(c[0], c[1]));
    const lid = o.lid ?? 0;
    // skin: the brow ridge, the temple, the bridge and side of the nose, the cheek
    const contour = [[-1100, -800], [250, -800], [300, -560], [340, -360], [322, -200], [276, -70], [292, 60], [350, 240], [430, 440], [476, 640], [490, 900], [-1100, 900]];
    // (bare: the eye sits in a whole head that draws its own skin and the temple's shade)
    if (!o.bare) put(press, (g) => smooth(g, contour), SKIN);
    press.save();
    press.clip((g) => smooth(g, contour));
    // the nose's side turned from the light: a soft ramp towards the contour, a shadow shape
    ink(press, (g) => g.rect(-100, -800, 700, 1700), { 'pink.s': (g) => Riso.ramp(g, 170, 0, 330, 0, 0, 0.24), 'yellow.s': (g) => Riso.ramp(g, 170, 0, 330, 0, 0, 0.16) });
    ink(press, (g) => smooth(g, [[250, -60], [292, 60], [350, 240], [430, 440], [476, 640], [400, 700], [330, 420], [262, 200], [224, 40]]), { 'pink.s': 0.2, 'navy.s': 0.1 });
    // the temple and the far side of the brow in shade
    if (!o.bare) ink(press, (g) => g.rect(-1100, -800, 800, 1700), { 'pink.s': (g) => Riso.ramp(g, -700, 0, -330, 0, 0.26, 0), 'navy.s': (g) => Riso.ramp(g, -700, 0, -330, 0, 0.1, 0) });
    // the socket: the lid's skin under the brow, the hollow by the nose
    ink(press, (g) => smooth(g, [[-250, -110], [-110, -200], [110, -196], [262, -110], [230, -40], [120, -128], [-60, -140], [-190, -92]]), { 'pink.s': 0.14, 'yellow.s': 0.12, 'navy.s': 0.04 });
    ink(press, ellipse(230, -10, 70, 110), { 'pink.s': (g) => Riso.radial(g, 230, -10, 10, 110, 0.3, 0), 'navy.s': (g) => Riso.radial(g, 230, -10, 10, 110, 0.12, 0) });
    // under the eye: a soft bag and its crease; the cheek's warmth
    ink(press, (g) => smooth(g, [[-170, 70], [0, 100], [170, 60], [150, 130], [0, 160], [-150, 124]]), { 'pink.s': 0.16, 'navy.s': 0.05 });
    ink(press, ellipse(20, 300, 280, 160), { 'pink.s': (g) => Riso.radial(g, 20, 300, 20, 280, 0.24, 0) });
    // the brow ridge catching the light
    press.knockout((g) => { g.fillStyle = Riso.radial(g, 120, -300, 10, 200, 0.5, 0); g.beginPath(); g.ellipse(120, -300, 220, 80, -0.1, 0, Math.PI * 2); g.fill(); });
    press.restore();
    // pores and freckles: a light speckle of the skin's own inks
    const r = Motion.rng('pores');
    for (let i = 0; i < 110; i++) {
        const x = r() * 1300 - 900, y = r() * 1100 - 600;
        if (Math.abs(x) < 240 && Math.abs(y) < 150) continue;
        ink(press, circle(x, y, 1.8 + r() * 3), r() < 0.5 ? { 'pink.s': 0.35 } : { 'yellow.s': 0.45, 'pink.s': 0.2 });
    }
    // forehead lines, the crease under the eye and crow's feet
    for (const [y, x0, x1] of [[-460, -420, 160], [-520, -330, 100]]) line(press, [[x0, y], [(x0 + x1) / 2, y - 16], [x1, y + 4]], taper(5), { 'pink.s': 0.4, 'navy.s': 0.12 });
    line(press, [[-160, 124], [-20, 156], [140, 120]], taper(5), LINE);
    line(press, [[-100, 190], [20, 206], [120, 186]], taper(3.4), { 'pink.s': 0.4, 'navy.s': 0.1 });
    for (const [a, l] of [[-0.35, 120], [0.02, 150], [0.36, 120], [0.62, 90]]) line(press, [[-205, 12 + a * 60], [-205 - l * 0.5 * Math.cos(a), 12 + a * 60 + l * 0.5 * Math.sin(a) - 6], [-205 - l * Math.cos(a), 12 + l * Math.sin(a) + a * 40]], taper(4.4), { 'pink.s': 0.45, 'navy.s': 0.22 });
    // the opening between the lids (the upper lid comes down to blink)
    const up = [[-110, -78], [0, -104], [112, -72]], lo = [[112, 54], [0, 74], [-110, 56]];
    const upL = up.map(([x, y], i) => [x, lerp(y, lo[2 - i][1] - 6, lid)]);
    const open = [[-178, 12], ...upL, [174, 2], ...lo];
    put(press, (g) => smooth(g, open), { 'blue.s': 0.07, 'yellow.s': 0.05 });
    press.save();
    press.clip((g) => smooth(g, open));
    ink(press, ellipse(-150, 20, 60, 60), { 'navy.s': 0.08, 'pink.s': 0.08 });
    // the iris: hazel-brown, lighter round the pupil, striations, a dark limbal ring
    const ix = 30 + (o.look ?? 0.6) * 44, iy = -8, IR = 80;
    put(press, circle(ix, iy, IR), { 'yellow.s': 0.72, 'pink.s': 0.55, 'navy.s': 0.52 });
    put(press, circle(ix, iy, IR * 0.66), { 'yellow.s': 0.8, 'pink.s': 0.38, 'navy.s': 0.22 }, { knock: false });
    const rs = Motion.rng('iris');
    for (let i = 0; i < 44; i++) {
        const a = i / 44 * Math.PI * 2 + rs() * 0.06, r0 = 36 + rs() * 10, r1 = IR - 4 - rs() * 12, bend = (rs() - 0.5) * 0.12;
        const p = (rr, b = 0) => [ix + Math.cos(a + b) * rr, iy + Math.sin(a + b) * rr];
        line(press, [p(r0), p((r0 + r1) / 2, bend), p(r1)], taper(i % 2 ? 3 : 4.4, 0.3, 0.3), i % 2 ? { 'yellow.s': 0.7, 'pink.s': 0.2 } : { 'navy.s': 0.75, 'pink.s': 0.5 });
    }
    line(press, Array.from({ length: 61 }, (_, i) => [ix + Math.cos(i / 60 * 6.2832) * (IR - 3), iy + Math.sin(i / 60 * 6.2832) * (IR - 3)]), 9, { navy: 1, 'pink.s': 0.4 });
    put(press, circle(ix, iy, 32 * (o.pupil ?? 1)), { navy: 1, yellow: 0.9 });
    // the upper lid's shadow over the top of the eye
    ink(press, (g) => smooth(g, [[-190, -10], ...upL.map(([x, y]) => [x, y - 20]), [190, -10], ...upL.slice().reverse().map(([x, y]) => [x, y + 26])]), { 'navy.s': 0.5 });
    // a few fine vessels in the white, towards the corners
    for (const [x0, y0, x1, y1] of [[-150, 8, -100, -4], [-140, 30, -96, 22], [150, 0, 120, 16], [140, -14, 112, -8]]) line(press, [[x0, y0], [(x0 + x1) / 2, (y0 + y1) / 2 + 3], [x1, y1]], taper(2.2, 0.1, 0.8), { 'pink.s': 0.5 });
    // catch lights: the candle and the window
    press.knockout((g) => { g.beginPath(); g.roundRect(ix + 8, iy - 50, 28, 22, 6); g.fill(); });
    press.knockout(circle(ix - 30, iy + 26, 6));
    press.restore();
    // the caruncle at the inner corner, the waterline, the lids
    put(press, ellipse(150, 6, 20, 15, 0.2), { 'pink.s': 0.5, 'yellow.s': 0.15 });
    line(press, [[-170, 18], ...lo.slice().reverse().map(([x, y]) => [x, y - 5]), [168, 8]], taper(8, 0.3, 0.3), { 'pink.s': 0.5, 'yellow.s': 0.1 });
    line(press, [[-176, 16], ...lo.slice().reverse(), [172, 6]], taper(4.4, 0.3, 0.2), LINE);
    // the lid fold above, then the lash line and lashes
    const fold = up.map(([x, y]) => [x * 1.02, lerp(y - 42, y - 10, lid)]);
    line(press, [[-200, -24], ...fold, [196, -30]], taper(6, 0.2, 0.3), LINE);
    const lashLine = [[-184, 12], ...upL, [176, 2]];
    const LASH = { navy: 1, yellow: 0.85 };
    line(press, lashLine, taper(16, 0.15, 0.35), LASH);
    const S = Ph.sample(lashLine, false, 6), rl = Motion.rng('lashes');
    for (let i = 2; i < S.length - 3; i += 1 + Math.floor(rl() * 2)) {
        const u = i / S.length, [x, y] = S[i], len = lerp(38, 18, u) * (0.7 + rl() * 0.5), out = lerp(-0.9, 0.2, u) + (rl() - 0.5) * 0.4;
        const dirn = [Math.sin(out) * 0.6 - 0.4 * (1 - u), -1];
        const tip = [x + dirn[0] * len, y + dirn[1] * len * (1 - lid * 1.6)];
        line(press, [[x, y], [(x + tip[0]) / 2 - 6, (y + tip[1]) / 2], tip], taper(5, 0.05, 0.9), LASH);
    }
    for (let i = 0; i < 7; i++) { const x = -150 + i * 34, y = 60 + Math.sin(i / 6 * Math.PI) * 14; line(press, [[x, y], [x - 8, y + 20]], taper(2.6, 0.1, 0.9), LINE); }
    // the brow: many short hairs along an arch; at its head they rise, along it they lie outwards
    const rb = Motion.rng('brow'), by = o.brow ?? 0;
    // the brow's body under the hairs: a soft brown arch, thicker at its head
    ink(press, (g) => smooth(g, [[-360, -150 + by], [-200, -236 + by], [0, -262 + by], [180, -250 + by], [290, -200 + by], [280, -150 + by], [160, -198 + by], [0, -214 + by], [-200, -192 + by]]), { 'pink.s': 0.3, 'yellow.s': 0.4, 'navy.s': 0.32 });
    for (let i = 0; i < 150; i++) {
        const u = rb(), x = lerp(-340, 270, u), arch = -200 - 58 * Math.sin(Math.min(1, u * 1.25) * Math.PI * 0.85 + 0.1) + (u > 0.8 ? (u - 0.8) * 120 : 0);
        const y = arch + (rb() - 0.5) * lerp(30, 60, u) + by;
        const a = u > 0.82 ? -1.9 + (rb() - 0.5) * 0.5 : Math.PI + 0.25 - 0.5 * u + (rb() - 0.5) * 0.35, l = 30 + rb() * 34;
        const c = rb();
        line(press, [[x, y], [x + Math.cos(a) * l * 0.5, y + Math.sin(a) * l * 0.5 - 3], [x + Math.cos(a) * l, y + Math.sin(a) * l]], taper(5 + rb() * 3, 0.1, 0.8), c < 0.2 ? HAIR_LT : c < 0.55 ? HAIR : HAIR_DK);
    }
    // the temple's hair, far left: locks going back, a grey strand (the whole head draws its own)
    if (o.temple !== false) for (let k = 0; k < 5; k++) {
        const x = -760 + k * 60;
        lock(press, [[x + 60, -700], [x + 10, -400], [x - 10, -100], [x - 40, 200]], 70, HAIR, k === 2 ? { 'yellow.s': 0.3, 'blue.s': 0.2 } : HAIR_LT, HAIR_DK);
    }
    press.restore();
}

// ══ FIS-02 · the observatory (world units) ═══════════════════════════════════════════════
function lean(tq) { return Ease.inOut(seg(tq, TM.lean[0], TM.lean[1])); }
function focusTurn(tq) {
    // three little turns of the collar, the last settling
    const u = seg(tq, TM.focus[0], TM.focus[1]);
    return Math.sin(u * Math.PI * 3) * (1 - u) * 0.6 + u;
}

function room(press, tq) {
    const d = Math.round(tq * 12);
    // the plaster wall: a darker wash in patches, hairline cracks, a beam across the ceiling
    const r = Motion.rng('plaster');
    for (let i = 0; i < 9; i++) {
        const x = r() * 1700 - 50, y = r() * 520, rx = 90 + r() * 180, ry = 50 + r() * 90;
        ink(press, ellipse(x, y, rx, ry, r() * 3), { 'navy.s': 0.18 + r() * 0.12 });
    }
    for (let i = 0; i < 5; i++) {
        const x = r() * 1500, y = 60 + r() * 420, pts = [[x, y]];
        for (let k = 0; k < 4; k++) pts.push([pts[k][0] + 10 + r() * 22, pts[k][1] + 12 + r() * 18]);
        line(press, pts, taper(2), { navy: 0.9 });
    }
    put(press, (g) => g.rect(-400, -200, 2400, 222), WOOD_DK);
    put(press, (g) => g.rect(-400, 14, 2400, 10), { 'yellow.s': 0.55, 'pink.s': 0.4, 'navy.s': 0.4 });
    for (let x = -300; x < 2000; x += 260) put(press, (g) => poly(g, [[x, -200], [x + 60, -200], [x + 64, 16], [x - 4, 16]]), WOOD);
    // the floor: terracotta tiles in perspective
    const fl = 850;
    put(press, (g) => g.rect(-400, fl, 2400, 400), { 'pink.s': 0.62, 'yellow.s': 0.72, 'navy.s': 0.55 });
    put(press, (g) => g.rect(-400, fl - 6, 2400, 8), { 'pink.s': 0.5, 'yellow.s': 0.6, 'navy.s': 0.75 });
    for (const y of [fl + 16, fl + 38, fl + 70, fl + 110]) line(press, [[-400, y], [2000, y]], 2.4, { navy: 0.9, 'pink.s': 0.4 });
    for (let i = -8; i < 24; i++) { const x = i * 110; line(press, [[x, fl], [x + (x - 800) * 0.25, fl + 60]], 2.2, { navy: 0.9, 'pink.s': 0.4 }); }
    shelf(press, tq);
    moonSheet(press, tq);
    windowArch(press, tq, d);
}

// a wall shelf: books, a rolled chart, a small armillary sphere turning slowly
function shelf(press, tq) {
    const y = 176, x0 = -60, x1 = 330;
    const r = Motion.rng('gal-books');
    const COVERS = [{ pink: 0.9, 'yellow.s': 0.5, 'navy.s': 0.55 }, { 'yellow.s': 0.8, 'pink.s': 0.6, 'navy.s': 0.3 }, { navy: 1, 'pink.s': 0.5 }, { 'blue.s': 0.7, yellow: 0.8, 'navy.s': 0.5 }, PAPER];
    let bx = x0 + 20;
    for (let i = 0; i < 8; i++) {
        const bw = 16 + r() * 16, bh = 64 + r() * 44, c = COVERS[i % COVERS.length], tilt = i === 7 ? 0.3 : 0;
        press.save();
        press.each((g) => { g.translate(bx, y); g.rotate(tilt); });
        put(press, (g) => g.rect(0, -bh, bw, bh), c);
        for (const yy of [-bh + 10, -bh + 18, -16]) line(press, [[2, yy], [bw - 2, yy]], 2, { yellow: 1, 'pink.s': 0.25 });
        press.restore();
        bx += bw + 2;
    }
    // a rolled chart lying on the shelf
    put(press, (g) => g.rect(bx + 30, y - 22, 80, 22), PAPER);
    put(press, ellipse(bx + 110, y - 11, 5, 11), { 'yellow.s': 0.3, 'pink.s': 0.2, 'navy.s': 0.2 });
    line(press, [[bx + 64, y - 22], [bx + 64, y]], 2.4, { pink: 0.8, 'navy.s': 0.4 });
    // the armillary: rings round a small ball on a turned foot
    const ax = x1 - 44, ay = y - 70, rr = 38, t = tq * 0.35;
    put(press, (g) => poly(g, [[ax - 20, y], [ax + 20, y], [ax + 8, y - 16], [ax - 8, y - 16]]), WOOD);
    line(press, [[ax, y - 16], [ax, ay + rr]], 5, BRASS_SH);
    put(press, circle(ax, ay, 8), BRASS_SH);
    for (const [tilt, sq] of [[0, 1], [0.4, 0.35], [-0.5, Math.abs(Math.cos(t))], [1.2, Math.abs(Math.sin(t)) * 0.9 + 0.1]]) {
        const pts = Array.from({ length: 41 }, (_, i) => add([ax, ay], rot([Math.cos(i / 40 * 6.2832) * rr, Math.sin(i / 40 * 6.2832) * rr * sq], tilt)));
        line(press, pts, 3.4, BRASS);
    }
    // the plank and its brackets
    put(press, (g) => g.rect(x0, y, x1 - x0, 14), WOOD);
    put(press, (g) => g.rect(x0, y, x1 - x0, 4), WOOD_LT);
    for (const b of [x0 + 60, x1 - 40]) put(press, (g) => poly(g, [[b - 6, y + 14], [b + 6, y + 14], [b + 6, y + 50], [b - 22, y + 20]]), WOOD_DK);
}

// his wash drawings of the Moon (1609), pinned on the wall; the sheet's corner lifts in the draught
function moonSheet(press, tq) {
    const x = 610, y = 64, w = 170, h = 128, lift = 5 * Math.sin(tq * 2.1);
    put(press, (g) => poly(g, [[x, y], [x + w, y + 3], [x + w + 2, y + h - lift], [x + w - 18, y + h + 4 - lift * 0.5], [x + 2, y + h]]), { 'yellow.s': 0.22, 'pink.s': 0.1 });
    ink(press, (g) => poly(g, [[x + w - 18, y + h + 4 - lift * 0.5], [x + w + 2, y + h - lift], [x + w - 4, y + h + 4]]), { 'navy.s': 0.4 });
    // four phases in sepia wash: the lit part paper, the dark part a brown screen, a ragged terminator
    for (let i = 0; i < 4; i++) {
        const cx = x + 26 + (i % 2) * 70 + 20, cy = y + 34 + Math.floor(i / 2) * 60, R = 22, ph = [0.55, 0.15, -0.2, -0.6][i];
        put(press, circle(cx, cy, R), { 'yellow.s': 0.2, 'pink.s': 0.1 });
        press.save();
        press.clip(circle(cx, cy, R));
        ink(press, (g) => { g.beginPath(); g.moveTo(cx + ph * R, cy - R); for (let k = 0; k <= 8; k++) g.lineTo(cx + ph * R + Math.sin(k * 2.1) * 2.5, cy - R + k * R / 4); g.lineTo(cx - R - 2, cy + R); g.lineTo(cx - R - 2, cy - R); g.closePath(); }, { 'pink.s': 0.5, 'yellow.s': 0.6, 'navy.s': 0.4 });
        press.restore();
        line(press, Array.from({ length: 25 }, (_, k) => [cx + Math.cos(k / 24 * 6.2832) * R, cy + Math.sin(k / 24 * 6.2832) * R]), 1.4, { 'pink.s': 0.5, 'navy.s': 0.4 });
    }
    put(press, circle(x + w / 2, y + 6, 4), BRASS_SH);
}

// an arched window in a stone surround, shutters folded open, the night outside
function windowArch(press, tq, d) {
    const x0 = 960, x1 = 1400, top = 36, sill = 560, cx = (x0 + x1) / 2, rw = (x1 - x0) / 2;
    const archPath = (g, i = 0) => { g.moveTo(x0 + i, sill); g.lineTo(x0 + i, top + rw); g.arc(cx, top + rw, rw - i, Math.PI, 0); g.lineTo(x1 - i, sill); g.closePath(); };
    const STONE = { 'blue.s': 0.3, 'yellow.s': 0.18, 'navy.s': 0.3 };
    put(press, (g) => archPath(g, -34), STONE);
    // the voussoirs' joints round the arch
    for (let k = 0; k <= 10; k++) { const a = Math.PI + k * Math.PI / 10; line(press, [[cx + Math.cos(a) * rw, top + rw + Math.sin(a) * rw], [cx + Math.cos(a) * (rw + 34), top + rw + Math.sin(a) * (rw + 34)]], 2.2, { 'navy.s': 0.6 }); }
    put(press, (g) => archPath(g, 0), SKY);
    press.save();
    press.clip((g) => archPath(g, 0));
    ink(press, (g) => g.rect(x0, top, x1 - x0, sill - top), { 'blue.s': (g) => Riso.ramp(g, 0, sill, 0, top, 0.55, 0) });
    // stars, twinkling; the hills of Padua's roofs low on the horizon
    const r = Motion.rng('gal-stars');
    for (let i = 0; i < 26; i++) {
        const sx = x0 + 10 + r() * (x1 - x0 - 20), sy = top + 10 + r() * (sill - top - 120), tw = Motion.noise1('gtw' + i, d * 0.35), big = r() > 0.8;
        put(press, circle(sx, sy, (big ? 3.4 : 2) + tw * 0.9), { 'yellow.s': 0.35 + 0.25 * r() });
    }
    put(press, (g) => smooth(g, [[x0 - 20, sill + 10], [x0 - 20, 470], [1030, 480], [1060, 450], [1080, 468], [1140, 470], [1150, 440], [1162, 436], [1170, 470], [1240, 478], [1290, 462], [1340, 474], [x1 + 20, 466], [x1 + 20, sill + 10]], false), { navy: 1, yellow: 0.7, 'blue.s': 0.4 });
    for (const [wx, wy] of [[1090, 480], [1270, 482]]) put(press, (g) => g.rect(wx, wy, 8, 10), { 'yellow.s': 0.6, 'pink.s': 0.3 });
    press.restore();
    // Jupiter, the brightest point in the window
    const tw = 1 + 0.1 * Motion.noise1('jw', d * 0.5);
    press.knockout((g) => { g.fillStyle = Riso.radial(g, JW[0], JW[1], 2, 34 * tw, 0.8, 0); g.beginPath(); g.arc(JW[0], JW[1], 34 * tw, 0, Math.PI * 2); g.fill(); });
    ink(press, circle(JW[0], JW[1], 34 * tw), { 'yellow.s': (g) => Riso.radial(g, JW[0], JW[1], 2, 34 * tw, 0.9, 0) });
    put(press, circle(JW[0], JW[1], 5.5), { yellow: 0.8 });
    press.knockout(circle(JW[0], JW[1], 2.6));
    // mullion and transom of the casement, lead-light frame
    const FR = { 'yellow.s': 0.8, 'pink.s': 0.6, 'navy.s': 0.55 };
    put(press, (g) => archPath(g, 0), {}, { knock: false });
    // the sill and the shutters folded back into the room, the right one ajar and swaying
    put(press, (g) => g.rect(x0 - 50, sill, x1 - x0 + 100, 22), STONE);
    put(press, (g) => g.rect(x0 - 50, sill, x1 - x0 + 100, 5), { 'blue.s': 0.12, 'yellow.s': 0.08 });
    ink(press, (g) => g.rect(x0 - 50, sill + 18, x1 - x0 + 100, 4), { 'navy.s': 0.7 });
    const sw = 6 * Math.sin(tq * 1.3 + 0.5);
    for (const [ex, dir, w] of [[x0 - 34, -1, 60], [x1 + 34, 1, 58 + sw]]) {
        const pts = [[ex, top + rw - 20], [ex + dir * w, top + rw - 8], [ex + dir * w, sill + 16], [ex, sill - 6]];
        put(press, (g) => poly(g, pts), FR);
        for (const f of [0.28, 0.72]) {
            const a = [lerp(pts[0][0], pts[3][0], f), lerp(pts[0][1], pts[3][1], f) - 60], b = [lerp(pts[1][0], pts[2][0], f), lerp(pts[1][1], pts[2][1], f) - 60];
            put(press, (g) => poly(g, [[a[0] + dir * 8, a[1] - 60], [b[0] - dir * 8, b[1] - 60], [b[0] - dir * 8, b[1] + 60], [a[0] + dir * 8, a[1] + 60]]), WOOD_DK);
        }
        line(press, [pts[0], pts[3]], 3, { navy: 1 });
        put(press, circle(ex + dir * w * 0.8, (top + rw + sill) / 2, 4), BRASS_SH);
    }
}

// the table: a lit top, a thick front edge, a recessed apron in shadow and square legs
function table(press, x0, x1, top, legs) {
    const W_EDGE = { 'yellow.s': 0.85, 'pink.s': 0.62, 'navy.s': 0.4 };
    const W_TOP = { 'yellow.s': 0.72, 'pink.s': 0.4, 'navy.s': 0.12 };
    const W_DARK = { 'yellow.s': 0.9, 'pink.s': 0.75, 'navy.s': 0.8 };
    for (const lx of legs) put(press, (g) => g.rect(lx - 22, top + 60, 44, 900), W_DARK);
    put(press, (g) => g.rect(x0 + 30, top + 50, x1 - x0 - 60, 60), W_DARK);
    put(press, (g) => g.rect(x0, top + 18, x1 - x0, 36), W_EDGE);
    put(press, (g) => g.rect(x0, top, x1 - x0, 20), W_TOP);
    put(press, (g) => g.rect(x0, top + 18, x1 - x0, 4), { 'yellow.s': 0.5, 'pink.s': 0.25 });
    ink(press, (g) => g.rect(x0 + 30, top + 54, x1 - x0 - 60, 14), { 'navy.s': 0.7 });
    const r = Motion.rng('ggrain' + x0);
    for (let i = 0; i < Math.round((x1 - x0) / 100); i++) {
        const y = top + (r() < 0.35 ? 4 + r() * 12 : 24 + r() * 26), xa = x0 + r() * (x1 - x0), len = Math.min(80 + r() * 260, x1 - 8 - xa);
        if (len < 20) continue;
        line(press, [[xa, y], [xa + len * 0.5, y + (r() - 0.5) * 3], [xa + len, y + (r() - 0.5) * 4]], taper(1.6 + r() * 2.2), { 'pink.s': 0.8, 'navy.s': 0.65, 'yellow.s': 0.9 });
    }
}

// a candle in a brass stick: the flame flickers per drawing and throws a soft glow
function candle(press, x, y, tq) {
    const d = Math.floor(tq * 12), fl = Motion.noise1('gflame', d * 0.7), fh = 1 + 0.12 * fl, top = y - 110;
    press.knockout((g) => { g.fillStyle = Riso.radial(g, x, top - 30, 10, 190, 0.55, 0); g.beginPath(); g.arc(x, top - 30, 190, 0, Math.PI * 2); g.fill(); });
    ink(press, circle(x, top - 30, 190), { 'yellow.s': (g) => Riso.radial(g, x, top - 30, 10, 190, 0.5, 0) });
    put(press, ellipse(x, y - 4, 50, 11), BRASS_SH);
    put(press, (g) => poly(g, [[x - 11, y - 8], [x + 11, y - 8], [x + 7, y - 50], [x - 7, y - 50]]), BRASS);
    put(press, ellipse(x, y - 52, 24, 6), BRASS);
    put(press, (g) => g.rect(x - 13, top, 26, y - 54 - top), { 'yellow.s': 0.2, 'pink.s': 0.08 });
    put(press, (g) => g.rect(x - 13, top, 7, y - 54 - top), { 'yellow.s': 0.3, 'pink.s': 0.2, 'navy.s': 0.12 });
    put(press, (g) => smooth(g, [[x + 5, top], [x + 12, top + 2], [x + 11, top + 30], [x + 7, top + 36], [x + 4, top + 16]]), { 'yellow.s': 0.12 });
    line(press, [[x, top], [x + 1, top - 11]], 3, INK);
    const fx = x + fl * 2;
    put(press, (g) => smooth(g, [[fx, top - 54 * fh], [fx + 11, top - 20], [fx + 7, top - 5], [fx - 7, top - 5], [fx - 11, top - 20]]), { yellow: 1, 'pink.s': 0.3 });
    put(press, (g) => smooth(g, [[fx, top - 33 * fh], [fx + 5, top - 15], [fx, top - 8], [fx - 5, top - 15]]), { 'yellow.s': 0.25 });
    put(press, ellipse(fx, top - 8, 4, 5), { 'blue.s': 0.6 });
}

// a terrestrial globe on a turned stand, a brass meridian round it, turning slowly
function deskGlobe(press, x, y, tq) {
    const r = 56, C = [x, y - 150];
    put(press, (g) => poly(g, [[x - 50, y], [x + 50, y], [x + 36, y - 14], [x - 36, y - 14]]), WOOD);
    put(press, (g) => smooth(g, [[x - 8, y - 14], [x + 8, y - 14], [x + 14, y - 40], [x + 6, y - 60], [x + 10, y - 80], [x - 10, y - 80], [x - 6, y - 60], [x - 14, y - 40]]), WOOD_LT);
    put(press, circle(C[0], C[1], r), { 'yellow.s': 0.34, 'pink.s': 0.14, 'navy.s': 0.08 });
    press.save();
    press.clip(circle(C[0], C[1], r));
    const lon0 = -20 + tq * 22, lat0 = 20, RAD = Math.PI / 180, s0 = Math.sin(lat0 * RAD), c0 = Math.cos(lat0 * RAD);
    const P = ([lon, lat]) => { const l = (lon - lon0) * RAD, p = lat * RAD; const X = Math.cos(p) * Math.sin(l), Y = c0 * Math.sin(p) - s0 * Math.cos(p) * Math.cos(l), Z = s0 * Math.sin(p) + c0 * Math.cos(p) * Math.cos(l); return [C[0] + X * r, C[1] - Y * r, Z]; };
    for (const [k, pts] of Object.entries(Globe.LAND)) {
        if (k === 'australia') continue; // not on a globe of 1610
        const q = pts.map(P);
        if (!q.some((p) => p[2] > 0)) continue;
        const qq = q.map(([px, py, z]) => (z >= 0 ? [px, py] : [C[0] + (px - C[0]) / Math.hypot(px - C[0], py - C[1] || 1) * r, C[1] + (py - C[1]) / Math.hypot(px - C[0], py - C[1] || 1) * r]));
        put(press, (g) => poly(g, qq), { 'yellow.s': 0.6, 'pink.s': 0.35, 'navy.s': 0.2 });
        line(press, qq.concat([qq[0]]), 1.4, { 'navy.s': 0.7, 'pink.s': 0.3 });
    }
    // meridians and the equator, inked
    for (let lon = -180; lon < 180; lon += 30) {
        const q = []; for (let lat = -80; lat <= 80; lat += 10) { const p = P([lon, lat]); if (p[2] > 0) q.push([p[0], p[1]]); }
        if (q.length > 2) line(press, q, 1.2, { 'navy.s': 0.5, 'pink.s': 0.2 });
    }
    const eq = []; for (let lon = -180; lon <= 180; lon += 8) { const p = P([lon, 0]); if (p[2] > 0) eq.push([p[0], p[1]]); }
    if (eq.length > 2) line(press, eq, 1.6, { 'pink.s': 0.6, 'navy.s': 0.3 });
    ink(press, circle(C[0], C[1], r), { 'navy.s': (g) => Riso.radial(g, C[0] + r * 0.4, C[1] - r * 0.35, r * 0.3, r * 1.3, 0, 0.6) });
    press.restore();
    glint(press, Array.from({ length: 10 }, (_, i) => [C[0] + Math.cos(-1.2 + i * 0.08) * (r - 8), C[1] + Math.sin(-1.2 + i * 0.08) * (r - 8)]), 4);
    // the brass meridian ring on its axis, the horizon band
    const mer = Array.from({ length: 49 }, (_, i) => add(C, rot([Math.cos(i / 48 * 6.2832) * (r + 8), Math.sin(i / 48 * 6.2832) * (r + 8)], 0)));
    line(press, mer.slice(12, 38), 6, BRASS);
    line(press, [[C[0] - 6, C[1] - r - 14], [C[0] + 6, C[1] + r + 14]], 3, BRASS_SH);
    put(press, (g) => g.rect(x - 6, y - 90, 12, 24), WOOD);
    line(press, Array.from({ length: 21 }, (_, i) => [C[0] + Math.cos(i / 20 * Math.PI) * (r + 12), C[1] + 16 + Math.sin(i / 20 * Math.PI) * 10]), 7, WOOD_LT);
}

// books lying on the table and an inkwell
function tableThings(press, tq) {
    const book = (bx, by, w, h, cover) => {
        put(press, (g) => g.rect(bx, by - h, w, h), cover);
        put(press, (g) => g.rect(bx + 8, by - h + 5, w - 8, h - 10), { 'yellow.s': 0.25, 'pink.s': 0.08 });
        for (let i = 1; i < 4; i++) line(press, [[bx + 10, by - h + 5 + i * (h - 10) / 4], [bx + w - 2, by - h + 5 + i * (h - 10) / 4]], 1.4, { 'navy.s': 0.4, 'pink.s': 0.2 });
        put(press, (g) => g.rect(bx, by - h, 9, h), cover);
        line(press, [[bx + 1, by - h + 6], [bx + 8, by - h + 6]], 2, GOLD);
    };
    book(20, TOP + 6, 190, 30, { pink: 0.9, 'yellow.s': 0.5, 'navy.s': 0.55 });
    book(36, TOP - 24, 150, 26, { 'yellow.s': 0.85, 'pink.s': 0.6, 'navy.s': 0.35 });
    book(50, TOP - 50, 120, 22, { navy: 1, 'pink.s': 0.5 });
    // inkwell: a squat pewter pot
    const x = 612, y = TOP + 6;
    put(press, (g) => smooth(g, [[x - 24, y], [x - 22, y - 26], [x - 10, y - 34], [x + 10, y - 34], [x + 22, y - 26], [x + 24, y]]), { navy: 1, 'blue.s': 0.4 });
    put(press, ellipse(x, y - 34, 11, 4), { navy: 1, yellow: 0.8 });
    glint(press, [[x - 14, y - 26], [x - 18, y - 6]], 4);
}

// the open notebook on a writing slope; each night he adds a row: Jupiter (a circle) and the
// moons (dots) on a line, as in the Sidereus nuncius. rows: 0..3 (fractional = being drawn)
const NB = { tl: [646, 496], tr: [872, 506], br: [866, 602], bl: [640, 594] };
const nbMap = (u, v) => {
    const top = [lerp(NB.tl[0], NB.tr[0], u), lerp(NB.tl[1], NB.tr[1], u)], bot = [lerp(NB.bl[0], NB.br[0], u), lerp(NB.bl[1], NB.br[1], u)];
    return [lerp(top[0], bot[0], v), lerp(top[1], bot[1], v)];
};
function notebook(press, rows, tq) {
    // the slope: a wooden wedge under the book
    put(press, (g) => poly(g, [[NB.bl[0] - 6, TOP + 8], [NB.br[0] + 8, TOP + 8], [NB.br[0] + 14, NB.tr[1] + 10], [NB.br[0] + 4, NB.tr[1] + 6]]), WOOD_DK);
    put(press, (g) => poly(g, [[NB.bl[0] - 8, NB.bl[1] + 4], [NB.br[0] + 6, NB.br[1] + 4], [NB.br[0] + 8, TOP + 10], [NB.bl[0] - 8, TOP + 10]]), WOOD);
    // the cover's edge, then the two pages with a sag towards the spine
    put(press, (g) => poly(g, [add(nbMap(0, 0), [-5, -3]), add(nbMap(1, 0), [5, -2]), add(nbMap(1, 1), [5, 4]), add(nbMap(0, 1), [-5, 4])]), { pink: 0.8, 'yellow.s': 0.5, 'navy.s': 0.6 });
    for (const [u0, u1] of [[0, 0.5], [0.5, 1]]) {
        const pts = [nbMap(u0, 0), nbMap((u0 + u1) / 2, -0.03), nbMap(u1, 0), nbMap(u1, 1), nbMap((u0 + u1) / 2, 1.02), nbMap(u0, 1)];
        put(press, (g) => smooth(g, pts), { 'yellow.s': 0.3, 'pink.s': 0.12, 'navy.s': 0.04 });
        // the page's curl: a shade towards the spine
        ink(press, (g) => smooth(g, pts), { 'navy.s': (g) => Riso.ramp(g, nbMap(u0 === 0 ? 0.3 : 0.7, 0.5)[0], 0, nbMap(0.5, 0.5)[0], 0, 0, 0.35) });
    }
    ink(press, (g) => poly(g, [nbMap(0.44, 0), nbMap(0.5, 0), nbMap(0.5, 1), nbMap(0.44, 1)]), { 'navy.s': 0.25 });
    line(press, [nbMap(0.5, 0), nbMap(0.5, 1)], 1.8, { 'navy.s': 0.6 });
    // the right page: earlier nights, and lines of wavy marks (no letters)
    for (let i = 0; i < 3; i++) sketchRow(press, 0.56, 0.94, 0.14 + i * 0.3, MOONS_OLD[i], 1, { navy: 0.55, 'pink.s': 0.3 });
    for (let i = 0; i < 3; i++) {
        const v = 0.27 + i * 0.3, pts = [];
        for (let k = 0; k <= 10; k++) pts.push(nbMap(0.58 + k * 0.034, v + Math.sin(k * 2.3 + i) * 0.012));
        line(press, pts, 1.8, { navy: 0.45 });
    }
    // the left page: this week's rows, drawn on as each night comes (right to left, the
    // way his hand moves here)
    for (let i = 0; i < 3; i++) {
        const p = Math.max(0, Math.min(1, rows - i));
        if (p > 0) sketchRow(press, 0.06, 0.46, 0.16 + i * 0.3, configX(i), p, PENCIL);
    }
}
// earlier nights on the left page (made-up but plausible)
const MOONS_OLD = [[-120, -40, 70], [-90, 60, 160, 240], [50, -150, -230]];
function sketchRow(press, u0, u1, v, xs, p, spec) {
    const um = (u0 + u1) / 2, k = (u1 - u0) / 2 / 300;
    const c = nbMap(um, v), R = 6;
    // the circle drawn on first, then the dots from left to right
    const cp = Math.min(1, p * 2.2), n = Math.max(2, Math.round(16 * cp));
    line(press, Array.from({ length: n }, (_, i) => [c[0] + Math.cos(-1.2 + i / 15 * 6.2832) * R, c[1] + Math.sin(-1.2 + i / 15 * 6.2832) * R * 0.9]), 2.4, spec);
    const sorted = xs.slice().sort((a, b) => a - b);
    sorted.reverse().forEach((x, i) => {
        if (p < 0.45 + 0.55 * (i + 1) / (sorted.length + 1)) return;
        const q = nbMap(um + x * k, v);
        put(press, circle(q[0], q[1], 3), spec);
    });
}

// ── the telescope: eyepiece, focusing collar, leather tube, objective; on a pillar stand ──
function telescope(press, tq, turn) {
    const slide = turn * 3; // the draw tube comes out as the collar turns
    const quad = (s0, s1, h0, h1, spec) => put(press, (g) => poly(g, [at(s0, -h0), at(s1, -h1), at(s1, h1), at(s0, h0)]), spec);
    const strip = (s0, s1, k0, k1, h0, h1, spec) => put(press, (g) => poly(g, [at(s0, h0 * k0), at(s1, h1 * k0), at(s1, h1 * k1), at(s0, h0 * k1)]), spec);
    // the stand: a turned wooden pillar on three feet, a brass fork holding the tube
    const fk = at(FORK_S, 30), px = fk[0];
    put(press, (g) => poly(g, [[px - 70, TOP + 12], [px - 30, TOP - 6], [px + 30, TOP - 6], [px + 70, TOP + 12], [px + 60, TOP + 16], [px - 60, TOP + 16]]), WOOD_DK);
    put(press, (g) => smooth(g, [[px - 26, TOP - 4], [px + 26, TOP - 4], [px + 18, TOP - 30], [px + 10, TOP - 40], [px - 10, TOP - 40], [px - 18, TOP - 30]]), WOOD);
    put(press, (g) => g.rect(px - 9, fk[1], 18, TOP - 40 - fk[1]), WOOD);
    put(press, (g) => g.rect(px - 9, fk[1], 6, TOP - 40 - fk[1]), WOOD_LT);
    for (const yy of [fk[1] + 60, fk[1] + 150, TOP - 90]) put(press, ellipse(px, yy, 14, 9), WOOD);
    line(press, [[px + 7, fk[1] + 10], [px + 7, TOP - 44]], 2.4, { navy: 0.8 });
    // the tube (behind the fork's near prong)
    quad(-4, 14, 13, 13, BRASS);                  // eyepiece cup
    quad(14, 44 + slide, 9, 9, BRASS_SH);         // draw tube
    quad(44 + slide, 70 + slide, 15, 15, BRASS);  // focusing collar
    quad(70, TUBE_L - 26, 17, 23, LEATHER);       // the leather tube
    strip(70, TUBE_L - 26, -1, -0.5, 17, 23, LEATHER_LT);
    strip(70, TUBE_L - 26, 0.55, 1, 17, 23, LEATHER_DK);
    quad(TUBE_L - 26, TUBE_L, 26, 27, BRASS);      // the objective's cell
    strip(TUBE_L - 26, TUBE_L, 0.4, 1, 26, 27, BRASS_SH);
    // the objective lens's face, glinting
    const ob = at(TUBE_L, 0);
    put(press, ellipse(ob[0], ob[1], 6, 24, ANG), { navy: 1, 'blue.s': 0.5 });
    glint(press, [at(TUBE_L + 1, -16), at(TUBE_L + 1, -6)], 3);
    // gold tooling: fillets round the tube and dots
    for (let s = 110; s < TUBE_L - 40; s += 92) {
        const h = lerp(17, 23, (s - 70) / (TUBE_L - 96));
        for (const ds of [0, 9]) line(press, [at(s + ds, -h + 1), at(s + ds - 2, 0), at(s + ds, h - 1)], 3, GOLD);
        for (let k = -2; k <= 2; k++) put(press, circle(...at(s + 44, k * h * 0.35), 2.6), GOLD);
    }
    // knurls on the collar, moving as it turns; the cup's rim
    for (let k = 0; k < 7; k++) {
        const u = ((k / 7 + turn * 0.9) % 1 + 1) % 1, n = Math.sin((u - 0.5) * Math.PI) * 14;
        line(press, [at(46 + slide, n), at(68 + slide, n)], 1.8, { navy: 0.9, 'pink.s': 0.3 });
    }
    line(press, [at(0, -13), at(0, 13)], 2, BRASS_SH);
    glint(press, [at(47 + slide, -12), at(67 + slide, -12)], 2.6);
    glint(press, [at(100, -15), at(TUBE_L - 40, -20)], 2.8);
    // the fork: a brass strap under the tube and a wing screw
    put(press, (g) => poly(g, [at(FORK_S - 12, 17), at(FORK_S + 12, 17), at(FORK_S + 8, 32), at(FORK_S - 8, 32)]), BRASS_SH);
    line(press, [at(FORK_S - 10, -22), at(FORK_S - 12, 20)], 5, BRASS);
    line(press, [at(FORK_S + 10, -22), at(FORK_S + 8, 20)], 5, BRASS);
    put(press, circle(...at(FORK_S, 24), 7), BRASS);
}

// the right hand round the focusing collar, seen from the back: origin on the tube's axis,
// x along the tube, y down; r = the collar's half-width. roll shifts the fingers as it turns
function gripHand(press, r, roll, part) {
    if (part === 'thumb') {
        put(press, (g) => smooth(g, [[-26, -r + 4], [-20, -r - 8], [-6, -r - 9], [0, -r + 2]]), SKIN_SH);
        return;
    }
    // back of the hand below the collar, the wrist going down
    put(press, (g) => smooth(g, [[-30, r + 4], [28, r + 4], [34, r + 24], [22, r + 50], [-18, r + 56], [-34, r + 30]]), SKIN);
    ink(press, (g) => smooth(g, [[-34, r + 30], [-18, r + 56], [4, r + 56], [-10, r + 36], [-22, r + 16]]), SKIN_SH);
    line(press, [[-8, r + 50], [-4, r + 30], [6, r + 18]], taper(2.2), { 'blue.s': 0.3, 'pink.s': 0.2 });
    // four fingers wrapping the collar's near face, the tips curling over the top
    for (let i = 0; i < 4; i++) {
        const x = -21 + i * 13.5 + roll * 2;
        const band = [[x - 7, r + 8], [x + 7, r + 8], [x + 7.5, -r * 0.2], [x + 6, -r + 1], [x, -r - 3], [x - 6, -r + 1], [x - 7, -r * 0.2]];
        put(press, (g) => smooth(g, band), i % 2 ? SKIN : { 'yellow.s': 0.16, 'pink.s': 0.14 });
        put(press, ellipse(x, r + 8, 7, 4), SKIN_SH);
    }
    // the gaps between the fingers and their middle joints, over all four
    for (let i = 0; i < 4; i++) {
        const x = -21 + i * 13.5 + roll * 2;
        if (i < 3) line(press, [[x + 6.8, r + 6], [x + 6.8, -r + 1]], taper(2.6), { pink: 0.55, navy: 0.5 });
        line(press, [[x - 4, r * 0.3], [x + 4, r * 0.28]], taper(2.4), { pink: 0.5, navy: 0.35 });
    }
    line(press, [[-28, r + 12], [30, r + 12]], taper(1.6), { 'pink.s': 0.4 });
}

// sleeve along shoulder → elbow → wrist, with a dark rim and a sheen (as in the Newton test)
function sleeve(press, s, e, w, width) {
    const RIM = { navy: 1, yellow: 1, pink: 0.8 };
    line(press, [s, e], (u) => width * (1 - 0.12 * u) + 8, RIM);
    line(press, [e, w], (u) => width * (0.88 - 0.22 * u) + 8, RIM);
    line(press, [s, e], (u) => width * (1 - 0.12 * u), COAT);
    line(press, [e, w], (u) => width * (0.88 - 0.22 * u), COAT);
    for (const k of [-1, 0, 1]) line(press, [[e[0] - 10 + k * 8, e[1] - width * 0.25 + k * 6], [e[0] + 8 + k * 8, e[1] + width * 0.1 + k * 6]], taper(3), RIM);
    const SHEEN = { 'navy.s': 0.7, 'yellow.s': 0.7, 'pink.s': 0.35 };
    const nrm = (a, b, d) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [dy / l * d, -dx / l * d]; };
    const n2 = nrm(e, w, width * 0.26), u2 = n2[0] > 0 ? n2 : [-n2[0], -n2[1]];
    line(press, [[e[0] + u2[0], e[1] + u2[1] - 10], [w[0] + u2[0], w[1] + u2[1] + 16]], taper(width * 0.18), SHEEN);
}

// seated under the table: the gown's skirts over the thigh, the shin, the shoe (cast.js)
function seated(press) {
    const fl = 452;
    put(press, (g) => smooth(g, [[-110, 280], [150, 280], [176, 380], [150, 430], [-100, 430], [-126, 360]]), COAT_DK);
    put(press, (g) => smooth(g, [[40, 330], [230, 322], [280, 340], [284, 392], [200, 404], [40, 412]]), { navy: 1, yellow: 0.9, 'pink.s': 0.5 });
    put(press, (g) => smooth(g, [[232, 352], [284, 360], [282, 420], [272, fl - 26], [244, fl - 26], [232, 420], [226, 380]]), { navy: 1, 'blue.s': 0.45, 'yellow.s': 0.3 });
    line(press, [[280, 376], [276, 420], [272, fl - 30]], taper(4), { 'navy.s': 0.6 });
    put(press, (g) => smooth(g, [[236, fl - 30], [276, fl - 32], [300, fl - 20], [326, fl - 12], [328, fl], [236, fl]]), { navy: 1, yellow: 0.9, 'pink.s': 0.4 });
    line(press, [[244, fl - 6], [322, fl - 6]], 2.5, { 'yellow.s': 0.4, 'navy.s': 0.3 });
}

// a three-quarter eye facing right (the inner corner towards the nose on the right).
// lid: 0 open .. 1 closed
function eye34(press, x, y, w, look, lid) {
    const h = w * 0.46;
    const up = [[x - w * 0.25, y - h * 0.5], [x + w * 0.12, y - h * 0.6]], lo = [[x + w * 0.14, y + h * 0.34], [x - w * 0.2, y + h * 0.3]];
    const upL = up.map(([px, py], i) => [px, lerp(py, lo[1 - i][1] - 1, lid)]);
    const shape = [[x - w * 0.5, y + h * 0.02], ...upL, [x + w * 0.46, y - h * 0.02], ...lo];
    if (lid < 0.9) {
        put(press, (g) => smooth(g, shape), { 'blue.s': 0.05 });
        press.save();
        press.clip((g) => smooth(g, shape));
        const px = x + w * 0.08 + look[0] * w * 0.14, py = y - h * 0.06 + look[1] * h * 0.2;
        put(press, circle(px, py, h * 0.56), { navy: 1, 'pink.s': 0.4, 'yellow.s': 0.3 });
        press.knockout(circle(px + h * 0.2, py - h * 0.2, h * 0.14));
        ink(press, (g) => smooth(g, [[x - w, y - h * 2], [x + w, y - h * 2], ...upL.slice().reverse().map(([a, b]) => [a, b + h * 0.3])]), { 'navy.s': 0.3 });
        press.restore();
    }
    line(press, [[x - w * 0.56, y + h * 0.05], ...upL, [x + w * 0.5, y - h * 0.02]], taper(w * (0.12 + lid * 0.02), 0.25, 0.2), INK);
    if (lid > 0.5) for (let i = 0; i < 4; i++) { const px = x - w * 0.35 + i * w * 0.2; line(press, [[px, y + h * 0.28], [px - 2, y + h * 0.55]], taper(1.8), INK); }
    line(press, [[x - w * 0.36, y - h * 1.05], [x + w * 0.05, y - h * 1.2], [x + w * 0.38, y - h * 0.9]], taper(w * 0.05), LINE);
    line(press, [[x - w * 0.4, y + h * 0.4], [x + w * 0.05, y + h * 0.46], [x + w * 0.4, y + h * 0.18]], taper(w * 0.05), LINE);
}

// Galileo at 46 (after Santi di Tito's portrait, c. 1601, and the 1612 Passignani): high
// forehead, the hair receding from it, reddish-dark hair short at the back, a short dark
// beard and moustache, a dark scholar's gown with a plain white collar. Local units as
// cast.js: head centre at (0, 0), facing right, in three-quarter view. o: { look, lidNear,
// lidFar, breath }
function galileo(press, o = {}) {
    const look = o.look ?? [1, 0.2], br = o.breath ?? 0;
    if (!o.noSeat) seated(press);
    // gown: shoulders and chest, the front lit by the candle on the right, a centre seam
    put(press, (g) => smooth(g, [[-150, 160 - br], [-110, 122 - br], [-40, 108 - br], [44, 104 - br], [112, 118 - br], [150, 172], [166, 300], [150, 390], [-120, 390], [-156, 300]]), COAT);
    put(press, (g) => smooth(g, [[34, 110 - br], [108, 122 - br], [146, 176], [160, 300], [150, 390], [84, 390], [56, 200]]), COAT_LIT);
    line(press, [[44, 116], [60, 220], [70, 390]], taper(5), COAT_DK);
    for (const [a, b] of [[[-120, 200], [-100, 380]], [[-70, 170], [-60, 380]], [[110, 200], [120, 380]]]) line(press, [a, [(a[0] + b[0]) / 2 + 6, (a[1] + b[1]) / 2], b], taper(4), COAT_DK);
    // neck and the plain white collar lying flat over the gown
    put(press, (g) => smooth(g, [[-14, 60], [40, 56], [48, 104], [-20, 108]]), SKIN_SH);
    put(press, (g) => smooth(g, [[-50, 98 - br], [-12, 90 - br], [30, 88 - br], [66, 96 - br], [84, 110 - br], [70, 132 - br], [30, 138 - br], [-10, 130 - br], [-44, 116 - br]]), LINEN);
    line(press, [[-40, 112 - br], [0, 124 - br], [40, 126 - br], [74, 116 - br]], taper(3), LINEN_SH);
    line(press, [[30, 94 - br], [34, 134 - br]], taper(2.4), LINEN_SH);
    // the back of the head: hair short, reddish-dark, behind the ear
    put(press, (g) => smooth(g, [[-24, -96], [-54, -86], [-76, -58], [-86, -20], [-82, 20], [-66, 44], [-44, 40], [-40, 0], [-38, -40], [-22, -76]]), HAIR);
    // the face and the high bald crown in one skin shape
    const face = [[-58, -52], [-50, -84], [-22, -104], [14, -108], [44, -96], [60, -74], [64, -50], [62, -34], [58, -24], [64, -12], [68, 2], [66, 20], [60, 40], [48, 62], [26, 80], [4, 84], [-18, 76], [-38, 56], [-48, 30], [-52, 0], [-56, -26]];
    put(press, (g) => smooth(g, face), SKIN);
    press.save();
    press.clip((g) => smooth(g, face));
    ink(press, (g) => smooth(g, [[-90, -70], [-34, -74], [-24, -30], [-28, 10], [-14, 50], [0, 90], [-90, 100]]), SKIN_SH);
    ink(press, (g) => smooth(g, [[-10, -42], [20, -44], [34, -30], [20, -20], [-6, -22]]), { 'pink.s': 0.2, 'yellow.s': 0.12 });
    ink(press, ellipse(24, 10, 17, 11), CHEEK);
    ink(press, ellipse(62, 2, 6, 10), CHEEK);
    // the dome's sheen and two forehead lines
    press.knockout(ellipse(18, -86, 20, 8, -0.2));
    press.restore();
    line(press, [[-4, -66], [16, -70], [40, -64]], taper(2.4), { 'pink.s': 0.4, 'navy.s': 0.12 });
    line(press, [[2, -56], [20, -58], [38, -54]], taper(2), { 'pink.s': 0.35, 'navy.s': 0.1 });
    // the ear, in the hair's shadow
    put(press, (g) => smooth(g, [[-38, -24], [-54, -30], [-64, -14], [-62, 8], [-52, 20], [-40, 14]]), SKIN_SH);
    line(press, [[-44, -18], [-54, -18], [-56, -2], [-48, 8]], taper(2.6), LINE);
    // brows, eyes, the nose with its shaded side
    line(press, [[-14, -40], [4, -47], [26, -43]], taper(7, 0.2, 0.3), HAIR_DK);
    line(press, [[40, -45], [52, -46], [63, -38]], taper(5, 0.2, 0.3), HAIR_DK);
    eye34(press, 8, -26, 28, look, o.lidNear ?? 0);
    eye34(press, 52, -25, 16, look, o.lidFar ?? 0);
    const nose = [[36, -34], [44, -16], [58, 0], [74, 10], [72, 17], [62, 19], [52, 17], [42, 12], [36, 2]];
    put(press, (g) => smooth(g, nose), SKIN);
    ink(press, (g) => smooth(g, [[36, -30], [42, -12], [48, 4], [44, 12], [36, 4]]), SKIN_SH);
    line(press, [[40, -30], [52, -12], [66, 4], [74, 12]], taper(3.4, 0.2, 0.2), LINE);
    line(press, [[60, 17], [52, 15], [48, 9]], taper(4), INK);
    // the beard: short and dark, from the sideburn round the jaw to the chin; the lower lip
    const beard = [[-44, -8], [-30, 12], [-10, 34], [14, 44], [32, 48], [48, 48], [60, 44], [68, 30], [70, 44], [64, 64], [48, 84], [28, 100], [12, 98], [-10, 86], [-30, 62], [-44, 36], [-50, 10]];
    put(press, (g) => smooth(g, beard), HAIR);
    put(press, (g) => smooth(g, [[34, 38], [46, 36], [58, 37], [54, 44], [40, 45]]), { 'pink.s': 0.5, 'yellow.s': 0.2 });
    const rb = Motion.rng('beard');
    for (let i = 0; i < 26; i++) {
        const u = rb(), p = [lerp(-40, 60, u) + (rb() - 0.5) * 10, lerp(20, 60, rb()) + Math.sin(u * Math.PI) * 30];
        line(press, [p, [p[0] + (rb() - 0.3) * 8, p[1] + 10 + rb() * 10]], taper(3 + rb() * 2), rb() < 0.4 ? HAIR_LT : HAIR_DK);
    }
    lock(press, [[18, 88], [24, 98], [28, 108]], 12, HAIR, HAIR_LT, HAIR_DK, { a: 0.1, b: 0.6 });
    // the moustache over the lip, its ends drooping into the beard
    lock(press, [[46, 27], [32, 30], [20, 38]], 10, HAIR, HAIR_LT, HAIR_DK, { a: 0.2, b: 0.5 });
    lock(press, [[46, 27], [60, 28], [68, 36]], 8, HAIR, HAIR_LT, HAIR_DK, { a: 0.2, b: 0.5 });
    line(press, [[38, 34], [50, 35], [60, 33]], taper(2.4), INK);
    // hair: locks at the back and over the ear, one grey strand; the receding hairline
    // thin hair over the back of the crown, combed back from a hairline far up the head
    put(press, (g) => smooth(g, [[-4, -106], [-30, -104], [-56, -88], [-66, -60], [-40, -64], [-20, -84]]), HAIR);
    for (const [x0, y0] of [[-2, -106], [-12, -104], [-22, -100]]) line(press, [[x0, y0], [x0 - 24, y0 + 4], [x0 - 48, y0 + 20]], taper(3.4, 0.1, 0.5), HAIR_LT);
    lock(press, [[-18, -96], [-50, -84], [-72, -54], [-80, -18]], 22, HAIR, HAIR_LT, HAIR_DK, { a: 0.1 });
    lock(press, [[-40, -74], [-62, -44], [-66, -6], [-58, 30]], 20, HAIR, HAIR_LT, HAIR_DK);
    lock(press, [[-30, -60], [-40, -34], [-40, -8]], 12, HAIR, { 'yellow.s': 0.4, 'blue.s': 0.2, 'pink.s': 0.1 }, HAIR_DK);
    lock(press, [[-76, -40], [-88, -4], [-80, 30], [-66, 44]], 16, HAIR, HAIR_LT, HAIR_DK);
    for (const [x, y, r] of [[-66, 44, 9], [-80, 30, 8], [-58, 32, 7]]) line(press, Ph.sample([[x + r, y - r], [x + r * 0.2, y], [x - r * 0.8, y - r * 0.2], [x - r * 0.2, y - r * 0.9]], false, 5), taper(3.6), HAIR_DK);
    line(press, [[-20, -98], [-10, -104], [4, -106]], taper(2.4), { 'pink.s': 0.4, 'yellow.s': 0.2 });
}

// the Galilean moons on night n (fractional between nights): [x, y, front]
function moonPos(n) {
    return MOONS.a.map((a, i) => {
        const th = MOONS.th[i] + 2 * Math.PI * n / MOONS.P[i];
        const p = rot([a * Math.sin(th), -a * MOONS.flat * Math.cos(th)], MOONS.tilt);
        return [p[0], p[1], Math.cos(th) > 0];
    });
}
const configX = (i) => moonPos(i).map((p) => p[0]);
// which night it is at local time tq (0, 1, 2 with glides between)
function night(tq) {
    const [a, b, c] = TM.nights;
    return Ease.inOut(seg(tq, b - TM.hop - 0.1, b)) + Ease.inOut(seg(tq, c - TM.hop - 0.1, c));
}

// the telescope's field: a disc of night with Jupiter and its moons
function fieldView(press, tq, k, o = {}) {
    const [cx, cy] = o.c ?? FOV.c, R = (o.r ?? FOV.r) * k, d = Math.round(tq * 12), sc = o.s ?? 1;
    if (R < 2) return;
    // the eyepiece's field stop: an olive-black ring with a brass lip
    put(press, circle(cx, cy, R + 30), { navy: 1, yellow: 0.9, 'pink.s': 0.35 });
    put(press, circle(cx, cy, R + 10), BRASS_SH);
    put(press, circle(cx, cy, R), { navy: 1, 'blue.s': 0.55 });
    press.save();
    press.clip(circle(cx, cy, R));
    ink(press, circle(cx, cy, R), { 'blue.s': (g) => Riso.radial(g, cx, cy, R * 0.2, R, 0.35, 0) });
    // faint field stars
    const r = Motion.rng('field-stars');
    for (let i = 0; i < 14; i++) {
        const a = r() * 6.28, rr = Math.sqrt(r()) * R * 0.95, tw = Motion.noise1('fs' + i, d * 0.4);
        put(press, circle(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 1.6 + tw * 0.6 + r()), { 'blue.s': 0.35, 'yellow.s': 0.2 });
    }
    const J = [cx, cy], n = o.n ?? night(tq), shown = o.n != null || tq >= TM.nights[0];
    // the moons' soft ellipses, dotted, appearing with the first glide
    const ef = o.n != null ? 1 : Ease.out(seg(tq, TM.nights[0] + 0.1, TM.nights[0] + 0.5));
    if (ef > 0) MOONS.a.forEach((a) => {
        const m = Math.round(a * sc / 9);
        for (let j = 0; j < m; j++) {
            const th = j / m * Math.PI * 2, p = add(J, rot([a * sc * Math.sin(th), -a * sc * MOONS.flat * Math.cos(th)], MOONS.tilt));
            put(press, circle(p[0], p[1], 2 * ef), { 'blue.s': 0.5, 'navy.s': 0.15 });
        }
    });
    // earlier nights: faint rings where the moons were
    for (let i = 0; i < (o.n != null ? 0 : 2); i++) {
        const left = i < 2 ? TM.nights[i + 1] - TM.hop - 0.1 : 99; // when the moons leave night i
        if (tq < left) continue;
        const age = Math.min(1, (tq - left) / 2);
        moonPos(i).forEach(([x, y]) => {
            const p = add(J, [x, y]);
            line(press, Array.from({ length: 17 }, (_, q) => [p[0] + Math.cos(q / 16 * 6.2832) * 10, p[1] + Math.sin(q / 16 * 6.2832) * 10]), 2.6, { 'yellow.s': 0.7 - 0.25 * age, 'pink.s': 0.45 });
        });
    }
    // Jupiter: a small cream disc with a soft halo, darker at the limb; no photographic bands
    const JR = RJ * Math.max(0.6, sc);
    press.knockout((g) => { g.fillStyle = Riso.radial(g, J[0], J[1], JR, JR * 2.6, 0.5, 0); g.beginPath(); g.arc(J[0], J[1], JR * 2.6, 0, Math.PI * 2); g.fill(); });
    ink(press, circle(J[0], J[1], JR * 2.6), { 'yellow.s': (g) => Riso.radial(g, J[0], J[1], JR, JR * 2.6, 0.45, 0) });
    const moons = moonPos(n);
    const drawMoon = ([x, y], pop) => {
        const p = add(J, [x * sc, y * sc]);
        press.knockout((g) => { g.fillStyle = Riso.radial(g, p[0], p[1], 2, 16, 0.6, 0); g.beginPath(); g.arc(p[0], p[1], 16, 0, Math.PI * 2); g.fill(); });
        put(press, circle(p[0], p[1], 6.2 * pop), { 'yellow.s': 0.3 });
    };
    const pop = o.n != null ? 1 : Ease.pop(tq, TM.nights[0] - 0.08, 0.3);
    if (shown || pop > 0) moons.forEach((m) => { if (!m[2]) drawMoon(m, pop); });
    put(press, circle(J[0], J[1], JR), { 'yellow.s': 0.32, 'pink.s': 0.1 });
    press.save();
    press.clip(circle(J[0], J[1], JR));
    ink(press, circle(J[0], J[1], JR), { 'navy.s': (g) => Riso.radial(g, J[0] - 6, J[1] - 6, JR * 0.4, JR * 1.1, 0, 0.45), 'pink.s': (g) => Riso.radial(g, J[0], J[1], JR * 0.5, JR, 0, 0.25) });
    press.restore();
    if (shown || pop > 0) moons.forEach((m) => { if (m[2]) drawMoon(m, pop); });
    press.restore();
    // the lip's glint
    glint(press, Array.from({ length: 12 }, (_, i) => [cx + Math.cos(-2.4 + i * 0.07) * (R + 20), cy + Math.sin(-2.4 + i * 0.07) * (R + 20)]), 4);
}

// the pencil ring round Jupiter (screen units), drawn on from p = 0 to 1
function ringPts(c, r) { return Array.from({ length: 73 }, (_, i) => [c[0] + Math.cos(i / 72 * 6.2832) * r, c[1] + Math.sin(i / 72 * 6.2832) * r]); }
function pencilRing(press, p) {
    const c = FOV.c, r = RING.r0;
    if (p >= 0.98) { line(press, ringPts(c, r), RING.w, AMBER); return; }
    const a0 = -2.2, n = Math.max(2, Math.round(72 * p)), pts = [];
    for (let i = 0; i <= n; i++) { const a = a0 + (i / 72) * 6.2832; pts.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]); }
    line(press, pts, taper(RING.w, 0.02, 0.2), AMBER);
    // the pencil's lead: a small bright point at the head of the stroke
    const h = pts[pts.length - 1];
    put(press, circle(h[0], h[1], RING.w * 0.6), { yellow: 1 });
}

// the push through the ring: its centre drifts to the frame's centre while it grows
function pushState(lt) {
    const u = seg(lt, RING.t0, RING.t1);
    return { Z: Math.exp(Math.log(RING.r1 / RING.r0) * Math.pow(u, 1.5)), c: Ease.lerpPt(FOV.c, [800, 450], Ease.inOut(u)) };
}

// the wide shot's camera: at the cut it is centred on Jupiter where the macro's point of
// light was, then it opens out to the room (fast at first, then settling), then slides slowly
function wideCam(tq) {
    const u = Ease.out(seg(tq, TM.pull[0], TM.pull[1])), S0 = pointScreen();
    const Z = Math.exp(lerp(Math.log(2.4), 0, u));
    const A = [lerp(S0[0], JW[0], u) - 22 * seg(tq, TM.pull[1], 8), lerp(S0[1], JW[1], u)];
    return { Z, A };
}

// the observatory, everything in world units; o: { tq, lean, turn, rows, look, lidNear, lidFar }
function observatory(press, o) {
    const { tq } = o, H = Ease.lerpPt(H0, H1, o.lean);
    const br = 2 * Math.sin(tq * 2.4);
    room(press, tq);
    // his chair and him, behind the table
    Ph.cam(press, H[0], H[1], NS, () => {
        Ph.cam(press, -178, 300, 1, () => Sets.chair(press, { depth: 330, floor: 160, back: 330, style: 'carved' }));
        galileo(press, { look: o.look, lidNear: o.lidNear, lidFar: o.lidFar, breath: br });
    });
    table(press, -120, 1560, TOP, [40, 1480]);
    tableThings(press, tq);
    candle(press, 1075, TOP + 6, tq);
    deskGlobe(press, 1250, TOP + 8, tq);
    notebook(press, o.rows, tq);
    // his left hand on the notebook, holding a quill; it moves as each row goes down
    leftHand(press, o, H);
    telescope(press, tq, o.turn);
    // the right arm up to the focusing collar
    Ph.cam(press, H[0], H[1], NS, () => {
        const gp = at(GRIP_S + o.turn * 3, 0), gl = [(gp[0] - H[0]) / NS, (gp[1] - H[1]) / NS];
        const wr = add(gl, [N[0] * 58, N[1] * 58]), sh = [-40, 132 - br];
        const el = ik(sh, wr, 150, 150, 1);
        sleeve(press, sh, el, add(wr, [N[0] * 6, N[1] * 6]), 60);
        const cuffA = add(wr, [-D[0] * 20 + N[0] * 4, -D[1] * 20 + N[1] * 4]), cuffB = add(wr, [D[0] * 20 + N[0] * 4, D[1] * 20 + N[1] * 4]);
        put(press, (g) => smooth(g, [add(cuffA, [0, -8]), add(cuffB, [0, -8]), add(cuffB, [2, 14]), add(cuffA, [-2, 14])]), LINEN);
        Ph.cam(press, gl[0], gl[1], 1, () => { press.each((g) => g.rotate(ANG)); press.each((g) => g.rotate(Math.sin(o.turn * 6) * 0.06)); gripHand(press, 15 / NS, Math.sin(o.turn * 6) * 2.2, 'front'); });
    });
}

function leftHand(press, o, H) {
    const nr = Math.max(0, Math.min(2.999, o.rows)), row = Math.floor(nr), p = nr - row;
    // the nib runs along the row being drawn (a small scratch), then waits at the next one
    const v = 0.16 + row * 0.3 + 0.03 + (p > 0 && p < 0.999 ? Math.sin(p * 40) * 0.012 : 0);
    const nib = add(nbMap(lerp(0.44, 0.12, p), v), o.scratch != null ? [Math.sin(o.scratch * 5) * 6, Math.sin(o.scratch * 13) * 1.5] : [0, 0]);
    const TH = -0.5, pl = rot([63 * NS, 41 * NS], TH);
    const pinch = add(nib, [-21, -13]), wrist = [pinch[0] - pl[0], pinch[1] - pl[1]];
    // the forearm lying along the table's edge, out of the gown; the cuff
    const el = [H[0] + 120, TOP - 2];
    const RIM = { navy: 1, yellow: 1, pink: 0.8 };
    line(press, [el, add(wrist, [-6, 4])], (u) => 50 - 10 * u + 8, RIM);
    line(press, [el, add(wrist, [-6, 4])], (u) => 50 - 10 * u, COAT);
    line(press, [add(el, [10, -18]), add(wrist, [-16, -14])], taper(8), { 'navy.s': 0.7, 'yellow.s': 0.7, 'pink.s': 0.35 });
    put(press, (g) => smooth(g, [add(wrist, [-16, -18]), add(wrist, [2, -24]), add(wrist, [10, 18]), add(wrist, [-8, 22])]), LINEN);
    const hand = (part) => Ph.cam(press, wrist[0], wrist[1], NS, () => { press.each((g) => g.rotate(TH)); Cast.pinchHand(press, 0, part); });
    // the hand's shadow on the page, so skin reads against paper
    Ph.cam(press, wrist[0] + 7, wrist[1] + 9, NS, () => { press.each((g) => g.rotate(TH)); ink(press, (g) => smooth(g, [[-4, -16], [30, -22], [58, -14], [74, 10], [66, 40], [30, 30], [0, 20]]), { 'navy.s': 0.45, 'pink.s': 0.25 }); });
    hand('thumb');
    // the quill: its nib on the page, the shaft rising back over the hand, a grey vane
    const u = [(pinch[0] - nib[0]) / 25, (pinch[1] - nib[1]) / 25], L = 140, nv = [-u[1], u[0]];
    line(press, [nib, add(nib, [u[0] * L, u[1] * L])], (w) => 1.4 + w * 2, { 'yellow.s': 0.35, 'navy.s': 0.3 });
    const vane = [];
    for (let i = 0; i <= 6; i++) { const f = 0.42 + i * 0.1; vane.push(add(nib, [u[0] * L * f + nv[0] * 13 * Math.sin(i / 6 * Math.PI), u[1] * L * f + nv[1] * 13 * Math.sin(i / 6 * Math.PI)])); }
    for (let i = 6; i >= 0; i--) { const f = 0.42 + i * 0.1; vane.push(add(nib, [u[0] * L * f - nv[0] * 5 * Math.sin(i / 6 * Math.PI), u[1] * L * f - nv[1] * 5 * Math.sin(i / 6 * Math.PI)])); }
    put(press, (g) => smooth(g, vane), { 'yellow.s': 0.12, 'blue.s': 0.1 });
    for (let i = 1; i < 6; i++) { const b = add(nib, [u[0] * L * (0.45 + i * 0.1), u[1] * L * (0.45 + i * 0.1)]); line(press, [b, add(b, [nv[0] * 11 - u[0] * 7, nv[1] * 11 - u[1] * 7])], 1.2, { 'blue.s': 0.45, 'navy.s': 0.2 }); }
    line(press, [nib, add(nib, [u[0] * 8, u[1] * 8])], 2.2, INK);
    hand('front');
}

// the whole FIS-02 frame at local time tq (screen units)
function wide(press, tq, o = {}) {
    const cam = o.cam ?? wideCam(tq);
    const turn = focusTurn(tq), le = o.lean ?? lean(tq);
    // the rows: one per night, drawn over 0.35 s from each note
    let rows = o.rows ?? 0;
    if (o.rows == null) TM.nights.forEach((t) => { rows += Ease.out(seg(tq, t, t + 0.36)); });
    // gaze: the collar while he turns it, then into the eyepiece
    const look = [1, lerp(0.9, 0.1, le)];
    const blink = tq > 2.55 && tq < 2.72 ? 1 : 0;
    press.save();
    press.each((g) => { g.translate(cam.A[0], cam.A[1]); g.scale(cam.Z, cam.Z); g.translate(-JW[0], -JW[1]); });
    observatory(press, { tq, lean: le, turn, rows, look, scratch: o.scratch, lidNear: Math.max(blink, o.lidNear ?? Ease.inOut(seg(tq, TM.lean[1] - 0.1, TM.lean[1] + 0.1)) * 0.95), lidFar: blink });
    press.restore();
}

Seg.galileo = {
    // parts reused by the v2 rooftop scene (segments/galileo-roof.js)
    parts: { galileo, gripHand, moonPos, lock, MOONS, eyeMacro, bokeh, M, TM },
    init() { return {}; },
    draw(press, tq, st) {
        if (tq < TM.pull[0]) { macro(press, tq); return; }
        const ps = pushState(tq), pushing = tq >= RING.t0;
        press.save();
        if (pushing) press.each((g) => { g.translate(ps.c[0], ps.c[1]); g.scale(ps.Z, ps.Z); g.translate(-FOV.c[0], -FOV.c[1]); });
        wide(press, tq);
        const k = Ease.out(seg(tq, TM.fov[0], TM.fov[1]));
        fieldView(press, tq, k);
        press.restore();
        // the pencil ring: drawn here until the scene takes it over (ring() non-null)
        const p = Ease.inOut(seg(tq, TM.pencil[0], TM.pencil[1]));
        if (p > 0 && !this.ring(tq)) pencilRing(press, p);
    },
    ring(lt) {
        if (lt < 6.9) return null;
        const ps = pushState(lt);
        return { c: ps.c, r: RING.r0 * ps.Z, w: RING.w * Math.sqrt(ps.Z) };
    },
    atlas(press, tq, st) {
        // Galileo at the eyepiece, his notebook, and the field of the telescope with Jupiter
        // and its four moons drifting along their line (all inside r 400 round the centre)
        const lt = 3.6 + (((tq - 8) % 4) + 4) % 4;
        // a full frame of its own: the night-blue wall behind everything
        ink(press, (g) => g.rect(0, 0, 1600, 900), { blue: 0.9 });
        ink(press, (g) => g.rect(0, 0, 1600, 900), { 'navy.s': (g) => Riso.radial(g, 820, 420, 120, 1000, 0.5, 0.95) });
        wide(press, lt, { cam: { Z: 1, A: [JW[0] + 132, JW[1] + 139] }, lean: 1, rows: 3, lidNear: 0.95, scratch: tq });
        fieldView(press, lt, 1, { c: [992, 352], r: 150, s: 0.5, n: 2 + (tq - 8) * 0.12 });
    },
};
})();
