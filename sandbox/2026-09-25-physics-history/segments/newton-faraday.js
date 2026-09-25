// Segment FIS-03 + FIS-04 of physics-history (8–20 s of the piece; local time 0–12), grown
// from the approved test sandbox/2026-09-25-physics-newton-faraday: Newton drops a ball, the
// fall becomes an orbit round the Earth, the orbit winds into a copper coil, and Faraday's
// magnet makes a galvanometer answer going in, nothing while held, the other way coming out;
// the needle's tip becomes a light mark on a scale (the link to Curie).
//
//   Seg.newtonFaraday.init(env) → state      once, in the scene's setup
//   Seg.newtonFaraday.draw(press, tq, st)    tq: local time (on twos), draws onto the plates
//   Seg.newtonFaraday.scale(press, tq, st)   the closing scale and light mark, for tq ≥ 11
//                                            (keeps running past 12: the Curie segment uses it)
var Seg = globalThis.Seg ?? (globalThis.Seg = {});
(() => {

// ── timings (scene seconds; the full piece is +8 s) ───────────────────────────────────────
const TM = {
    drop: 1.0, land: 1.42, pull: [1.5, 3.0], bend: [1.75, 3.0], earthFill: [2.5, 3.1],
    orbit: [3.0, 4.92], wind: [5.0, 6.35], pan: [5.35, 6.35], leads: [6.25, 6.75],
    magIn: [6.8, 8.0], magOut: [8.8, 10.0], push: [10.0, 11.0], spot: [11.0, 12.0],
};

// ── colours as separations (Ph.put specs) ─────────────────────────────────────────────────
const BG = { blue: 0.9, 'navy.s': 0.72 };
const WOOD = { 'yellow.s': 0.85, 'pink.s': 0.6, 'navy.s': 0.45 };
const WOOD_TOP = { 'yellow.s': 0.7, 'pink.s': 0.42, 'navy.s': 0.18 };
const AMBER = { yellow: 1, 'pink.s': 0.55 };
const COPPER = { 'yellow.s': 0.8, 'pink.s': 0.62, 'navy.s': 0.22 };
const COPPER_DK = { 'yellow.s': 0.85, 'pink.s': 0.75, 'navy.s': 0.6 };
const BRASS = { yellow: 1, 'pink.s': 0.22, 'navy.s': 0.08 };
const BRASS_SH = { yellow: 1, 'pink.s': 0.4, 'navy.s': 0.45 };
const FIELD = { 'blue.s': 0.5 };
const fade = (spec, f) => Object.fromEntries(Object.entries(spec).map(([k, v]) => [k.endsWith('.s') ? k : k + '.s', v * f]));

// ── geometry ──────────────────────────────────────────────────────────────────────────────
const NEWTON = [330, 330];          // head centre, world (shot 1 before the pull-back)
const NS = 1.18;                    // the portraits' scale
const HOLD = [330, 86];             // the held ball's centre in Newton's local units
const BALL_R = 19, DROP_H = 190;   // ball radius and fall height (model units)
const P = [NEWTON[0] + NS * HOLD[0], NEWTON[1] + NS * HOLD[1] + DROP_H + BALL_R]; // where it lands
const R = 383;                     // the Earth's radius in model units (≈ 230 on screen)
const ORB = R + 90;                // the orbit radius (model units)
const COIL = { x: 980, y: 566, r: 70, pitch: 40, turns: 7, beta: 0.3 }; // shot 2, screen
const TUBE_R = 60;
const MAG = { len: 270, h: 42, out: 800, depth: 150 }; // tip x when out; how far it goes in
const GALV = { x: 1390, y: 462, r: 134, pivot: [1390, 530], needle: 128, max: 0.62 };

const lerp = Ease.lerp, seg = Ease.seg;

// the model layer: P on screen, zoom
function modelCam(tq) {
    const u = Ease.inOut(seg(tq, TM.pull[0], TM.pull[1]));
    return { ps: [lerp(P[0], 1050, u), lerp(P[1], 250, u)], z: lerp(1, 0.6, u) };
}
// Newton's layer shrinks a little towards the lower left
function newtonCam(tq) {
    const u = Ease.inOut(seg(tq, TM.pull[0], TM.pull[1]));
    return { o: [60, 600], z: lerp(1, 0.84, u) };
}
// the magnet tip's x (screen, shot 2) and its velocity
function magnetX(t) {
    const a = Ease.inOut(seg(t, TM.magIn[0], TM.magIn[1])), b = Ease.inOut(seg(t, TM.magOut[0], TM.magOut[1]));
    return MAG.out + MAG.depth * (a - b);
}

// two-bone arm: shoulder → wrist with lengths a, b; the elbow bends to the side `bend` (±1)
function ik(s, w, a, b, bend) {
    const dx = w[0] - s[0], dy = w[1] - s[1], d = Math.min(Math.hypot(dx, dy), a + b - 0.01);
    const ang = Math.atan2(dy, dx), c = Math.acos(Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d))));
    return [s[0] + Math.cos(ang + bend * c) * a, s[1] + Math.sin(ang + bend * c) * a];
}
// a coat sleeve along shoulder → elbow → wrist, with a white cuff
function sleeve(press, s, e, w, width) {
    // a dark rim first, so the sleeve reads against a coat of the same cloth
    Ph.line(press, [s, e], (u) => width * (1 - 0.12 * u) + 8, { navy: 1, yellow: 1, pink: 0.8 });
    Ph.line(press, [e, w], (u) => width * (0.88 - 0.18 * u) + 8, { navy: 1, yellow: 1, pink: 0.8 });
    Ph.line(press, [s, e], (u) => width * (1 - 0.12 * u), Cast.COAT);
    Ph.line(press, [e, w], (u) => width * (0.88 - 0.18 * u), Cast.COAT);
    // cloth folds at the elbow
    for (const k of [-1, 0, 1]) Ph.line(press, [[e[0] - 14 + k * 10, e[1] - width * 0.3], [e[0] - 4 + k * 12, e[1] + width * 0.2]], Ph.taper(3), { navy: 1, yellow: 1, pink: 0.8 });
    // cloth sheen along the top of the forearm and upper arm (lighter: less navy)
    const SHEEN = { 'navy.s': 0.7, 'yellow.s': 0.7, 'pink.s': 0.35 };
    const nrm = (a, b, d) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [dy / l * d, -dx / l * d]; };
    const n1 = nrm(s, e, width * 0.28), n2 = nrm(e, w, width * 0.26);
    const up = (n) => (n[1] > 0 ? [-n[0], -n[1]] : n);
    const u1 = up(n1), u2 = up(n2);
    Ph.line(press, [[s[0] + u1[0] + (e[0] - s[0]) * 0.2, s[1] + u1[1] + (e[1] - s[1]) * 0.2], [e[0] + u1[0], e[1] + u1[1]]], Ph.taper(width * 0.2), SHEEN);
    Ph.line(press, [[e[0] + u2[0], e[1] + u2[1]], [w[0] + u2[0] - 12, w[1] + u2[1]]], Ph.taper(width * 0.2), SHEEN);
}

// ── shot 1: Newton ────────────────────────────────────────────────────────────────────────
// a wooden table seen a little from above: a lit top, a thick front edge, a recessed
// apron in shadow and square legs; below it the room's dark. f < 1 fades it (screen only, no
// knockout, so the dots thin out over the background).
function table(press, x0, x1, top, o = {}) {
    const f = o.f ?? 1, kn = { knock: f >= 1 };
    const W_EDGE = { 'yellow.s': 0.85, 'pink.s': 0.62, 'navy.s': 0.4 };
    const W_TOP = { 'yellow.s': 0.72, 'pink.s': 0.4, 'navy.s': 0.12 };
    const W_DARK = { 'yellow.s': 0.9, 'pink.s': 0.75, 'navy.s': 0.8 };
    for (const lx of o.legs ?? []) Ph.put(press, (g) => g.rect(lx - 22, top + 60, 44, 900), fade(W_DARK, f), kn);
    Ph.put(press, (g) => g.rect(x0 + 30, top + 50, x1 - x0 - 60, 60), fade(W_DARK, f), kn);
    Ph.put(press, (g) => g.rect(x0, top + 18, x1 - x0, 36), fade(W_EDGE, f), kn);
    Ph.put(press, (g) => g.rect(x0, top, x1 - x0, 20), fade(W_TOP, f), kn);
    // the edge's rounded lip catching the light, and the shadow under the top
    Ph.put(press, (g) => g.rect(x0, top + 18, x1 - x0, 4), fade({ 'yellow.s': 0.5, 'pink.s': 0.25 }, f), kn);
    Ph.ink(press, (g) => g.rect(x0 + 30, top + 54, x1 - x0 - 60, 14), fade({ 'navy.s': 0.7 }, f));
    // grain: long thin streaks along the edge and the top
    const r = Motion.rng('grain' + x0 + top);
    for (let i = 0; i < Math.round((x1 - x0) / 110); i++) {
        const y = top + (r() < 0.35 ? 4 + r() * 12 : 24 + r() * 26), xa = x0 + r() * (x1 - x0), len = Math.min(80 + r() * 260, x1 - 8 - xa);
        if (len < 20) continue;
        Ph.line(press, [[xa, y], [xa + len * 0.5, y + (r() - 0.5) * 3], [xa + len, y + (r() - 0.5) * 4]], Ph.taper(1.6 + r() * 2.2), fade({ 'pink.s': 0.8, 'navy.s': 0.65, 'yellow.s': 0.9 }, f));
    }
    // a knot on the edge
    const kx = x0 + (x1 - x0) * 0.62;
    Ph.line(press, Ph.sample([[kx - 14, top + 36], [kx, top + 28], [kx + 16, top + 36], [kx, top + 44]], true, 6), 2.2, fade({ 'pink.s': 0.8, 'navy.s': 0.7, 'yellow.s': 0.9 }, f));
}

// a sash window at night: wooden frame and bars, a dark sky with a few stars and the Moon
function studyWindow(press, x, y, w, h, S, K, tq) {
    const FR = { 'yellow.s': 0.8, 'pink.s': 0.6, 'navy.s': 0.55 };
    Ph.put(press, (g) => g.rect(x - 18, y - 18, w + 36, h + 36), S(FR), K);
    Ph.put(press, (g) => g.rect(x, y, w, h), S({ navy: 1, 'blue.s': 0.35 }), K);
    const r = Motion.rng('stars');
    for (let i = 0; i < 16; i++) {
        const sx = x + 10 + r() * (w - 20), sy = y + 10 + r() * (h - 20), tw = Motion.noise1('tw' + i, tq * 3);
        Ph.put(press, Ph.circle(sx, sy, 2.2 + r() * 2.5 + tw * 0.8), S({ 'yellow.s': 0.5 + 0.3 * r() }), K);
    }
    // the Moon: a crescent (a disc minus an offset disc), paper with a little yellow
    const mx = x + w * 0.68, my = y + h * 0.3, mr = 38;
    const crescent = (g) => { g.arc(mx, my, mr, 0, Math.PI * 2); g.moveTo(mx - 16 + mr, my - 8); g.arc(mx - 16, my - 8, mr * 0.92, 0, Math.PI * 2, true); };
    Ph.put(press, crescent, S({ 'yellow.s': 0.35 }), K);
    // glazing bars
    Ph.put(press, (g) => g.rect(x + w / 2 - 7, y, 14, h), S(FR), K);
    Ph.put(press, (g) => g.rect(x, y + h / 2 - 7, w, 14), S(FR), K);
    Ph.put(press, (g) => g.rect(x - 24, y + h + 12, w + 48, 16), S({ 'yellow.s': 0.7, 'pink.s': 0.45, 'navy.s': 0.3 }), K);
}

// two books lying flat, the upper one smaller
function books(press, x, y, S, K) {
    const book = (bx, by, w, h, cover) => {
        Ph.put(press, (g) => g.rect(bx, by - h, w, h), S(cover), K);
        Ph.put(press, (g) => g.rect(bx + 8, by - h + 6, w - 8, h - 12), S({ 'yellow.s': 0.25, 'pink.s': 0.08 }), K);
        for (let i = 1; i < 4; i++) Ph.line(press, [[bx + 10, by - h + 6 + i * (h - 12) / 4], [bx + w - 2, by - h + 6 + i * (h - 12) / 4]], 1.6, S({ 'navy.s': 0.4, 'pink.s': 0.2 }), K);
        Ph.put(press, (g) => g.rect(bx, by - h, 10, h), S(cover), K);
    };
    book(x, y, 200, 34, { pink: 1, 'navy.s': 0.7 });
    book(x + 20, y - 34, 150, 28, { 'blue.s': 0.8, yellow: 1, 'navy.s': 0.35 });
}

// a candle in a brass stick: the flame flickers per drawing and throws a soft glow
function candle(press, x, y, tq, S, K) {
    const d = Math.floor(tq * 12), fl = Motion.noise1('flame', d * 0.7), fh = 1 + 0.12 * fl;
    const top = y - 130;
    // glow: a soft partial knockout, then a yellow screen ramp
    if (K.knock) press.knockout((g) => { g.fillStyle = Riso.radial(g, x, top - 30, 10, 170, 0.55, 0); g.beginPath(); g.arc(x, top - 30, 170, 0, Math.PI * 2); g.fill(); });
    Ph.ink(press, Ph.circle(x, top - 30, 170), S({ 'yellow.s': (g) => Riso.radial(g, x, top - 30, 10, 170, 0.5, 0) }));
    // stick: dish, stem, drip tray
    Ph.put(press, Ph.ellipse(x, y - 4, 56, 12), S(BRASS_SH), K);
    Ph.put(press, (g) => Ph.poly(g, [[x - 12, y - 8], [x + 12, y - 8], [x + 8, y - 60], [x - 8, y - 60]]), S(BRASS), K);
    Ph.put(press, Ph.ellipse(x, y - 62, 26, 7), S(BRASS), K);
    // wax: a paper cylinder with a drip and a darker left side
    Ph.put(press, (g) => g.rect(x - 14, top, 28, y - 64 - top), S({ 'yellow.s': 0.2, 'pink.s': 0.08 }), K);
    Ph.put(press, (g) => g.rect(x - 14, top, 8, y - 64 - top), S({ 'yellow.s': 0.3, 'pink.s': 0.2, 'navy.s': 0.12 }), K);
    Ph.put(press, (g) => Ph.smooth(g, [[x + 6, top], [x + 13, top + 2], [x + 12, top + 36], [x + 8, top + 42], [x + 5, top + 20]]), S({ 'yellow.s': 0.12 }), K);
    // wick and flame
    Ph.line(press, [[x, top], [x + 1, top - 12]], 3, S({ navy: 1 }), K);
    const fx = x + fl * 2;
    Ph.put(press, (g) => Ph.smooth(g, [[fx, top - 58 * fh], [fx + 12, top - 22], [fx + 7, top - 6], [fx - 7, top - 6], [fx - 12, top - 22]]), S({ yellow: 1, 'pink.s': 0.3 }), K);
    Ph.put(press, (g) => Ph.smooth(g, [[fx, top - 36 * fh], [fx + 6, top - 16], [fx, top - 8], [fx - 6, top - 16]]), S({ 'yellow.s': 0.25 }), K);
    Ph.put(press, Ph.ellipse(fx, top - 9, 4, 5), S({ 'blue.s': 0.6 }), K);
}

function ball(press, x, y, r) {
    Ph.put(press, Ph.circle(x, y, r), BRASS);
    press.save();
    press.clip(Ph.circle(x, y, r));
    Ph.put(press, Ph.circle(x - r * 0.35, y + r * 0.4, r * 1.05), BRASS_SH, { knock: false });
    press.restore();
    press.knockout(Ph.ellipse(x + r * 0.3, y - r * 0.38, r * 0.3, r * 0.2, -0.5));
}

function newtonShot(press, tq, d, pan) {
    const nc = newtonCam(tq), mc = modelCam(tq);
    const ox = -1700 * pan;
    // where the ball is (model units) and the release
    const fallU = seg(tq, TM.drop, TM.land), fallen = tq >= TM.land;
    const bp = [P[0], P[1] - BALL_R - DROP_H * (1 - fallU * fallU)];
    const toScreen = (p) => [mc.ps[0] + (p[0] - P[0]) * mc.z + ox, mc.ps[1] + (p[1] - P[1]) * mc.z];
    // the satellite
    const ou = seg(tq, TM.orbit[0], TM.orbit[1]), orbA = -Math.PI / 2 + ou * Math.PI * 2 + Math.max(0, tq - TM.orbit[1]) * (Math.PI * 2 / (TM.orbit[1] - TM.orbit[0]));
    const C = [P[0], P[1] + R], sat = [C[0] + Math.cos(orbA) * ORB, C[1] + Math.sin(orbA) * ORB];
    // Newton's gaze: the ball, then the model, then the satellite
    const eyeS = [nc.o[0] + (NEWTON[0] + 30 * NS - nc.o[0]) * nc.z + ox, nc.o[1] + (NEWTON[1] - 12 * NS - nc.o[1]) * nc.z];
    let target = tq < TM.land + 0.2 ? toScreen([bp[0], bp[1]]) : toScreen(C);
    if (tq >= TM.orbit[0]) target = toScreen(sat);
    const dx = target[0] - eyeS[0], dy = target[1] - eyeS[1], dl = Math.hypot(dx, dy) || 1;
    const look = [Math.max(0.2, dx / dl), Math.max(-0.9, Math.min(1, dy / dl * 1.6))];

    // Newton's layer: his table, then him
    Ph.cam(press, nc.o[0] + ox, nc.o[1], 1, () => {
        press.each((g) => g.scale(nc.z, nc.z));
        press.each((g) => g.translate(-nc.o[0], -nc.o[1]));
        const endCap = seg(tq, TM.pull[0], TM.pull[0] + 0.5);
        const open = Ease.out(seg(tq, TM.drop - 1 / 12, TM.drop + 2 / 12));
        const lower = Ease.inOut(seg(tq, TM.land + 0.3, TM.pull[1])); // the arm comes back down
        const wrist = [266 - lower * 80, 50 + lower * 176], rot = lower * 0.12, op = Math.min(1, open + lower * 0.3);
        const hand = (part) => Ph.cam(press, wrist[0], wrist[1], 1, () => { press.each((g) => g.rotate(rot)); Cast.pinchHand(press, op, part); });
        // the study (it dissolves into the night while the table turns into a model)
        const dis = 1 - seg(tq, TM.pull[0] + 0.05, TM.pull[0] + 0.45);
        const S = (spec) => (dis < 1 ? fade(spec, dis) : spec), K = { knock: dis >= 1 };
        const sf = seg(tq, TM.pull[0] + 0.1, TM.pull[0] + 1.1);
        if (sf > 0) Sets.stars(press, -400, 2400, sf, tq);
        if (dis > 0) {
            Sets.wainscot(press, -300, 1900, 470, 850, S, K);
            Sets.floor(press, -300, 1900, 850, S, K);
            Sets.curtains(press, 1040, 70, 380, 330, S, K);
            studyWindow(press, 1040, 70, 380, 330, S, K, tq);
            Sets.studyShelf(press, 440, 230, 500, S, K);
        }
        // Newton sits behind the table: his chair, body, the table over his lap, the arm above it
        Ph.cam(press, NEWTON[0], NEWTON[1], NS, () => {
            Ph.cam(press, -178, 300, 1, () => Sets.chair(press, { depth: 330, floor: 160, back: 340, style: 'carved' }));
            Cast.newton(press, { look });
        });
        table(press, -300, 830, 610, { legs: tq >= TM.pull[0] + 0.05 ? [60, 790] : [60] });
        Ph.cam(press, NEWTON[0], NEWTON[1], NS, () => {
            const sh = [-50, 128], wr = [wrist[0] - 6, wrist[1] + 4];
            // lowered, the forearm lies on the table coming a little towards us (foreshortened)
            const el = ik(sh, wr, lerp(190, 150, lower), lerp(175, 150, lower), 1);
            sleeve(press, sh, el, wr, 62);
            Ph.put(press, (g) => Ph.smooth(g, [[wrist[0] - 24, wrist[1] - 28], [wrist[0] + 2, wrist[1] - 24], [wrist[0] + 8, wrist[1] + 26], [wrist[0] - 18, wrist[1] + 32]]), Cast.LINEN);
            // thumb behind the ball, the ball, then the back of the hand and the index in front
            hand('thumb');
            if (tq < TM.drop) ball(press, HOLD[0], HOLD[1], BALL_R / NS);
            hand('front');
        });
    });

    // the model layer: the far end of the table, the ground line, the Earth, the traces
    Ph.cam(press, mc.ps[0] + ox, mc.ps[1], 1, () => {
        press.each((g) => { g.scale(mc.z, mc.z); g.translate(-P[0], -P[1]); });
        const dis = 1 - seg(tq, TM.pull[0] + 0.05, TM.pull[0] + 0.45);
        if (dis > 0) {
            // the rest of the table: books, inkwell and quill, candle, hourglass
            const S = (spec) => (dis < 1 ? fade(spec, dis) : spec), K = { knock: dis >= 1 };
            table(press, 770, 1800, 610, { f: dis, legs: [1500] });
            books(press, 900, 622, S, K);
            Sets.inkwell(press, 1170, 624, S, K);
            candle(press, 1300, 624, tq, S, K);
            Sets.hourglass(press, 1440, 624, tq, S, K);
        }
        // the Earth fills in once the ground closes
        const ef = Ease.out(seg(tq, TM.earthFill[0], TM.earthFill[1]));
        if (ef > 0) Globe.draw(press, C, R, { f: ef, lon0: 12 - (tq - TM.earthFill[0]) * 14, lat0: 20, cloudLon: (tq - TM.earthFill[0]) * 6 });
        // the ground line: drawn on from P when the ball lands, then it bends into the Earth
        const draw = Ease.out(seg(tq, TM.land, TM.land + 0.35));
        const bu = Ease.inOut(seg(tq, TM.bend[0], TM.bend[1]));
        if (draw > 0) {
            const k = bu / R, Ll = lerp(100 * draw, Math.PI * R, bu), Lr = lerp(1140 * draw, Math.PI * R, bu);
            const pts = [];
            for (let i = 0; i <= 90; i++) {
                const s = -Ll + (Ll + Lr) * (i / 90);
                pts.push(k < 1e-6 ? [P[0] + s, P[1]] : [P[0] + Math.sin(s * k) / k, P[1] + (1 - Math.cos(s * k)) / k]);
            }
            Ph.line(press, pts, bu > 0.98 ? 9 : Ph.taper(9, 0.04, 0.04), AMBER);
        }
        // gravity towards the common centre: faint blue dotted radii from the ball and satellite
        const gr = seg(tq, TM.orbit[0] - 0.2, TM.orbit[0] + 0.3) * (1 - seg(tq, TM.wind[0], TM.wind[0] + 0.3));
        if (gr > 0) {
            for (const q of [[P[0], P[1] - BALL_R], ...(tq >= TM.orbit[0] ? [sat] : [])]) {
                const n = 14;
                for (let i = 1; i < n; i++) {
                    const u = i / n;
                    const x = lerp(q[0], C[0], u), y = lerp(q[1], C[1], u);
                    // light dots over the night, dark dots over the Earth
                    if (Math.hypot(x - C[0], y - C[1]) > R) Ph.put(press, Ph.circle(x, y, 5.5), fade({ 'blue.s': 0.35 }, gr));
                    else Ph.ink(press, Ph.circle(x, y, 6), fade({ 'navy.s': 0.9 }, gr));
                }
            }
            Ph.put(press, Ph.circle(C[0], C[1], 9), fade({ 'navy.s': 0.9 }, gr));
        }
        // the fall trace: a dashed amber line from the release point to the ball
        if (tq >= TM.drop) {
            const top = P[1] - BALL_R - DROP_H, bot = Math.min(bp[1], P[1] - BALL_R);
            const tf = 1 - seg(tq, TM.wind[0], TM.wind[0] + 0.3);
            for (let y = top; y < bot - 14; y += 26) Ph.line(press, [[P[0], y], [P[0], Math.min(bot - 8, y + 14)]], 6, fade(AMBER, tf));
        }
        // the orbit trace behind the satellite
        if (tq >= TM.orbit[0] && tq < TM.wind[0]) {
            const pts = [];
            const a0 = -Math.PI / 2, a1 = Math.min(orbA, a0 + Math.PI * 2);
            for (let a = a0; a <= a1 + 1e-6; a += 0.04) pts.push([C[0] + Math.cos(a) * ORB, C[1] + Math.sin(a) * ORB]);
            pts.push([C[0] + Math.cos(a1) * ORB, C[1] + Math.sin(a1) * ORB]);
            if (pts.length > 2) Ph.line(press, pts, Ph.taper(10, 0.02, 0.1), AMBER);
        }
        // the ball
        if (tq >= TM.drop) ball(press, bp[0], bp[1], BALL_R);
        // the satellite (pops in with lateral speed)
        if (tq >= TM.orbit[0] && tq < TM.wind[0] + 0.2) {
            const s = Ease.pop(tq, TM.orbit[0], 0.25);
            Ph.put(press, Ph.circle(sat[0], sat[1], 24 * s), { pink: 1, 'yellow.s': 0.25 });
            press.knockout(Ph.ellipse(sat[0] + 6, sat[1] - 7, 6 * s, 4 * s));
        }
    });
    // the ball in the hand before the drop: drawn in Newton's layer between thumb and index
    return { toScreen, C };
}

function earth(press, C, r, f, spin = 0) {
    Ph.put(press, Ph.circle(C[0], C[1], r), fade({ 'blue.s': 0.55, 'yellow.s': 0.05 }, f));
    press.save();
    press.clip(Ph.circle(C[0], C[1], r));
    // schematic land masses (green = yellow over blue), no real map
    const LANDS = [
        [[-0.55, -0.55], [-0.2, -0.7], [0.05, -0.5], [-0.1, -0.2], [-0.4, -0.15], [-0.6, -0.3]],
        [[0.2, -0.2], [0.55, -0.35], [0.8, 0.0], [0.6, 0.35], [0.3, 0.3], [0.15, 0.05]],
        [[-0.6, 0.25], [-0.3, 0.2], [-0.15, 0.5], [-0.4, 0.75], [-0.65, 0.6]],
    ];
    // the lands turn with the Earth as whole shapes: each one's centre goes round, its outline
    // is projected onto the sphere (squashed towards the limb)
    for (const l of LANDS) {
        const cx = l.reduce((a, p) => a + p[0], 0) / l.length;
        const uc = ((cx + spin + 1.3) % 2.6 + 2.6) % 2.6 - 1.3;
        const pts = l.map(([x, y]) => {
            const u = uc + (x - cx), lim = Math.sqrt(Math.max(0, 1 - y * y));
            return [C[0] + Math.sin(Math.max(-1.5708, Math.min(1.5708, u * 1.2))) * lim * r, C[1] + y * r];
        });
        Ph.put(press, (g) => Ph.smooth(g, pts), fade({ 'yellow.s': 0.85, 'blue.s': 0.6 }, f), { knock: false });
    }
    // night side: navy screen ramp towards the lower left
    Ph.ink(press, Ph.circle(C[0], C[1], r), { 'navy.s': (g) => Riso.radial(g, C[0] + r * 0.45, C[1] - r * 0.45, r * 0.6, r * 2.0, 0, 0.75 * f) });
    press.restore();
    // a thin paper rim on the lit side
    const rim = [];
    for (let a = -2.4; a <= 0.4; a += 0.05) rim.push([C[0] + Math.cos(a) * (r - 7), C[1] + Math.sin(a) * (r - 7)]);
    press.knockout((g) => { Ph.poly(g, Ph.outline(rim, Ph.taper(6 * f, 0.3, 0.3))); g.fill(); });
}

// ── the coil (both shots): a helix whose axis turns from facing us to lying sideways ───────
function helixPts(c, r, pitch, turns, beta, a0 = 0, a1 = null) {
    const n = Math.ceil(turns * 64), pts = [];
    const end = a1 ?? turns * Math.PI * 2;
    for (let i = 0; i <= n; i++) {
        const a = a0 + (end - a0) * (i / n);
        const ax = (a / (Math.PI * 2) - turns / 2) * pitch;
        pts.push({ p: [c[0] + ax * Math.cos(beta) + r * Math.sin(a) * Math.sin(beta), c[1] - r * Math.cos(a)], front: Math.sin(a) * Math.cos(beta) >= 0, a });
    }
    return pts;
}
function coil(press, c, r, pitch, turns, beta, w, side, spec = COPPER) {
    const pts = helixPts(c, r, pitch, turns, beta);
    // runs of consecutive points on the same side
    let run = [];
    const flush = () => {
        if (run.length > 1) {
            const back = !run[0].front;
            Ph.line(press, run.map((q) => q.p), w, back ? COPPER_DK : spec);
            if (!back) Ph.line(press, run.map((q) => [q.p[0] - w * 0.18, q.p[1] - w * 0.18]), Ph.taper(w * 0.22, 0.3, 0.3), { 'yellow.s': 0.5 });
        }
        run = [];
    };
    for (const q of pts) {
        if (run.length && q.front !== run[0].front) { run.push(q); flush(); }
        if (q.front === (side === 'front')) run.push(q);
    }
    flush();
}

// ── shot 2: Faraday ───────────────────────────────────────────────────────────────────────
function faradayShot(press, tq, d, pan, sim) {
    const ox = 1700 * (1 - pan);
    const push = Ease.inOut(seg(tq, TM.push[0], TM.push[1]));
    const tipX = magnetX(tq);
    const theta = sim(tq);
    // the push-in: zoom on the needle's tip region
    const z = lerp(1, 2.8, push), fx = GALV.pivot[0], fy = GALV.pivot[1] - GALV.needle * 0.75;
    Ph.cam(press, ox + lerp(0, 800 - fx * 2.8 + fx * 1.8 - fx * 0.8, 0), 0, 1, () => {
        press.each((g) => { g.translate(fx + (800 - fx) * push, fy + (450 - fy) * push); g.scale(z, z); g.translate(-fx, -fy); });
        const lean = Ease.inOut(seg(tq, TM.magIn[0] - 0.3, TM.magIn[1])) - Ease.inOut(seg(tq, TM.magOut[0], TM.magOut[1] + 0.2));
        const head = [290 + lean * 40, 300 + lean * 6];
        Sets.wainscot(press, -400, 2000, 470, 850);
        Sets.floor(press, -400, 2000, 850);
        Sets.lamp(press, 620, 110, tq);
        labShelf(press);
        Sets.pile(press, 1570, 650);
        // Faraday behind the bench, on his chair
        Ph.cam(press, head[0], head[1], NS, () => Ph.cam(press, -170, 300, 1, () => Sets.chair(press, { depth: 320, floor: 160, back: 260, style: 'windsor' })));
        const grip = [tipX - MAG.len + 30, COIL.y];
        Ph.cam(press, head[0], head[1], NS, () => {
            Cast.faraday(press, { look: [1, 0.55] });
        });
        table(press, -400, 2000, 640, { legs: [100, 1560] });
        // coil back half-turns, the paper tube, the magnet, the front half-turns
        const coilOn = tq >= TM.wind[1]; // before that the winding orbit is drawn over both worlds
        if (coilOn) coil(press, [COIL.x, COIL.y], COIL.r, COIL.pitch, COIL.turns, COIL.beta, 13, 'back');
        const L = COIL.turns * COIL.pitch * Math.cos(COIL.beta) + 30, mouth = COIL.x - L / 2, mrx = TUBE_R * Math.sin(COIL.beta);
        // saddles holding the coil on the bench
        for (const sx of [mouth + 40, mouth + L - 40]) Ph.put(press, (g) => Ph.poly(g, [[sx - 26, 640], [sx + 26, 640], [sx + 20, COIL.y + COIL.r - 8], [sx - 20, COIL.y + COIL.r - 8]]), WOOD);
        // the tube's body (paper) and its dark mouth
        Ph.put(press, (g) => { g.beginPath(); g.moveTo(mouth, COIL.y - TUBE_R); g.lineTo(mouth + L, COIL.y - TUBE_R); g.ellipse(mouth + L, COIL.y, mrx, TUBE_R, 0, -Math.PI / 2, Math.PI / 2); g.lineTo(mouth, COIL.y + TUBE_R); g.closePath(); }, { 'yellow.s': 0.3, 'pink.s': 0.12, 'navy.s': 0.12 });
        Ph.ink(press, (g) => g.rect(mouth, COIL.y + TUBE_R * 0.2, L + mrx, TUBE_R * 0.8), { 'navy.s': (g) => Riso.ramp(g, 0, COIL.y, 0, COIL.y + TUBE_R, 0, 0.45) });
        Ph.put(press, Ph.ellipse(mouth, COIL.y, mrx, TUBE_R), { navy: 1, yellow: 0.9 });
        Ph.put(press, Ph.ellipse(mouth, COIL.y, mrx, TUBE_R), { 'yellow.s': 0.3, 'pink.s': 0.2 }, { knock: false });
        // the magnet (clipped: outside the tube, or inside the mouth)
        press.save();
        press.clip((g) => { g.rect(-2000, -2000, mouth + 2000, 5000); g.ellipse(mouth, COIL.y, mrx, TUBE_R - 3, 0, 0, Math.PI * 2); });
        magnet(press, tipX, COIL.y);
        press.restore();
        // the mouth's rim over the magnet
        const rim = [];
        for (let a = -Math.PI / 2; a <= Math.PI / 2 + 0.01; a += 0.1) rim.push([mouth - Math.cos(a) * mrx, COIL.y + Math.sin(a) * TUBE_R]);
        Ph.line(press, rim, 6, { 'yellow.s': 0.35, 'pink.s': 0.2, 'navy.s': 0.2 });
        if (coilOn) coil(press, [COIL.x, COIL.y], COIL.r, COIL.pitch, COIL.turns, COIL.beta, 13, 'front');
        // field lines round the magnet's outer part: faint, dashed, moving with it
        fieldLines(press, tipX, COIL.y, mouth);
        // Faraday's arm and fist on the magnet's south end
        const sh = [head[0] - 44 * NS, head[1] + 128 * NS];
        const el = ik(sh, [grip[0] - 18, grip[1] + 6], 200 * NS, 190 * NS, 1);
        sleeve(press, sh, el, [grip[0] - 16, grip[1] + 4], 66 * NS);
        Ph.put(press, (g) => Ph.smooth(g, [[grip[0] - 36, grip[1] - 30], [grip[0] - 12, grip[1] - 30], [grip[0] - 6, grip[1] + 34], [grip[0] - 30, grip[1] + 36]]), Cast.LINEN);
        Ph.cam(press, grip[0] - 12, grip[1], 1, () => Cast.fist(press, MAG.h));
        // wires: from the coil's two ends to the galvanometer's terminals
        const lu = Ease.out(seg(tq, TM.leads[0], TM.leads[1]));
        galvanometer(press, theta, tq);
        if (lu > 0) leads(press, mouth, L, lu);
    });
}

// the laboratory wall behind the bench: a plank shelf with glassware and a coil of wire,
// kept low in contrast (it is background)
function labShelf(press) {
    const y = 250, x0 = 700, x1 = 1580;
    const PLANK = { 'yellow.s': 0.6, 'pink.s': 0.45, 'navy.s': 0.55 };
    for (const bx of [x0 + 60, x1 - 60]) Ph.put(press, (g) => Ph.poly(g, [[bx - 8, y], [bx + 8, y], [bx + 8, y + 50], [bx - 30, y + 14]]), PLANK);
    Ph.put(press, (g) => g.rect(x0, y - 14, x1 - x0, 16), PLANK);
    Ph.put(press, (g) => g.rect(x0, y - 16, x1 - x0, 4), { 'yellow.s': 0.5, 'pink.s': 0.3, 'navy.s': 0.2 });
    const GLASS = { 'blue.s': 0.35, 'navy.s': 0.25 };
    const glint = (x, yy, h) => press.knockout((g) => { Ph.poly(g, Ph.outline([[x, yy], [x + 2, yy + h]], Ph.taper(4))); g.fill(); });
    // round-bottomed flask with a pink liquid
    Ph.put(press, Ph.circle(800, y - 58, 42), GLASS);
    Ph.put(press, (g) => g.rect(790, y - 150, 20, 60), GLASS);
    press.save(); press.clip(Ph.circle(800, y - 58, 42));
    Ph.put(press, (g) => g.rect(750, y - 60, 100, 60), { 'pink.s': 0.6, 'blue.s': 0.35 });
    press.restore();
    glint(778, y - 86, 26);
    // a tall amber bottle with a stopper
    Ph.put(press, (g) => Ph.smooth(g, [[900, y - 16], [900, y - 110], [912, y - 130], [912, y - 150], [936, y - 150], [936, y - 130], [948, y - 110], [948, y - 16]]), { 'yellow.s': 0.7, 'pink.s': 0.55, 'navy.s': 0.35 });
    Ph.put(press, (g) => g.rect(914, y - 168, 20, 20), { 'yellow.s': 0.5, 'pink.s': 0.3, 'navy.s': 0.5 });
    glint(908, y - 104, 70);
    // a Leyden jar: glass with a tin-foil coat on its lower half and a brass knob on a rod
    Ph.put(press, (g) => g.rect(1010, y - 120, 80, 104), GLASS);
    Ph.put(press, (g) => g.rect(1010, y - 70, 80, 54), { 'navy.s': 0.2, 'yellow.s': 0.12 });
    Ph.line(press, [[1050, y - 120], [1050, y - 176]], 5, { 'yellow.s': 0.6, 'navy.s': 0.4 });
    Ph.put(press, Ph.circle(1050, y - 184, 12), BRASS_SH);
    glint(1018, y - 112, 36);
    // a hank of copper wire, hanging from a peg under the shelf
    Ph.line(press, [[1250, y + 6], [1250, y + 30]], 6, { 'yellow.s': 0.6, 'pink.s': 0.4, 'navy.s': 0.5 });
    for (let i = 0; i < 6; i++) {
        const pts = [];
        for (let k = 0; k <= 40; k++) { const a = (k / 40) * Math.PI * 2; pts.push([1244 + i * 2.4 + Math.cos(a) * (40 - i), y + 80 + Math.sin(a) * (46 - i * 1.2)]); }
        Ph.line(press, pts, 4, { 'yellow.s': 0.75, 'pink.s': 0.6, 'navy.s': i % 2 ? 0.5 : 0.3 });
    }
    // two small jars
    for (const [x, c] of [[1380, { 'blue.s': 0.5, yellow: 0.5, 'navy.s': 0.3 }], [1450, { 'pink.s': 0.5, 'navy.s': 0.45 }]]) {
        Ph.put(press, (g) => g.rect(x, y - 70, 50, 54), c);
        Ph.put(press, (g) => g.rect(x - 4, y - 80, 58, 12), { 'yellow.s': 0.3, 'navy.s': 0.5 });
        glint(x + 8, y - 64, 30);
    }
}

function magnet(press, tip, y) {
    const x0 = tip - MAG.len, h = MAG.h;
    // south half blue, north half red (pink + yellow), a steel edge on top
    Ph.put(press, (g) => g.rect(x0, y - h / 2, MAG.len / 2, h), { blue: 1, 'navy.s': 0.25 });
    Ph.put(press, (g) => g.rect(x0 + MAG.len / 2, y - h / 2, MAG.len / 2, h), { pink: 1, yellow: 1, 'navy.s': 0.1 });
    Ph.put(press, (g) => g.rect(x0, y - h / 2, MAG.len, 6), { 'blue.s': 0.25, 'yellow.s': 0.1 });
    Ph.ink(press, (g) => g.rect(x0, y + h / 2 - 9, MAG.len, 9), { 'navy.s': 0.55 });
}

function fieldLines(press, tip, y, mouth) {
    const x0 = tip - MAG.len, cx = tip - MAG.len / 2;
    press.save();
    press.clip((g) => g.rect(-2000, -2000, mouth - 6 + 2000, 5000));
    for (const k of [1, 2, 3]) {
        const ry = 34 + k * 30, rx = MAG.len / 2 + 8 + k * 14;
        for (const sgn of [-1, 1]) {
            // dashes along an arc from the north pole round to the south pole
            for (let a = 0.18; a < Math.PI - 0.18; a += 0.2) {
                const p = (b) => [cx + Math.cos(b) * rx, y + sgn * Math.sin(b) * ry];
                Ph.line(press, [p(a), p(a + 0.1)], 3.4, FIELD);
            }
        }
    }
    press.restore();
}

// the two leads: silk-wrapped wire (green-grey) from the coil's ends along the bench top to
// the galvanometer's terminal posts, drawn on from the coil
function leads(press, mouth, L, u) {
    const y = 650, a = [mouth + 24, COIL.y + COIL.r - 2], b = [mouth + L - 20, COIL.y + COIL.r - 2];
    const t1 = [GALV.x - 70, 600], t2 = [GALV.x + 70, 600];
    const wire = (pts) => {
        const s = Ph.sample(pts, false, 6), n = Math.max(2, Math.round(s.length * u));
        Ph.line(press, s.slice(0, n), 8, { 'yellow.s': 0.45, 'blue.s': 0.55, 'navy.s': 0.3 });
        Ph.line(press, s.slice(0, n).map(([x, yy]) => [x, yy + 2.5]), 2.4, { navy: 1 });
    };
    wire([a, [a[0] - 14, y - 4], [a[0] + 40, y + 2], [t1[0] - 120, y + 4], [t1[0] - 30, y - 2], [t1[0] - 8, 612], t1]);
    wire([b, [b[0] + 18, y - 2], [t2[0] - 150, y + 6], [t2[0] - 30, y + 2], [t2[0] + 4, 614], t2]);
}

function galvanometer(press, theta, tq) {
    const { x, y, r, pivot, needle } = GALV;
    // base plate and stand
    Ph.put(press, (g) => g.rect(x - 130, 612, 260, 30), WOOD);
    Ph.put(press, (g) => g.rect(x - 130, 606, 260, 10), WOOD_TOP);
    Ph.put(press, (g) => Ph.poly(g, [[x - 36, 606], [x + 36, 606], [x + 24, y + r - 6], [x - 24, y + r - 6]]), BRASS_SH);
    for (const tx of [x - 70, x + 70]) {
        Ph.put(press, (g) => g.rect(tx - 9, 598, 18, 16), BRASS);
        Ph.put(press, Ph.ellipse(tx, 598, 11, 5), BRASS_SH);
    }
    // brass case and the dial
    Ph.put(press, Ph.circle(x, y, r), BRASS);
    Ph.ink(press, Ph.circle(x, y, r), { 'navy.s': (g) => Riso.radial(g, x + r * 0.3, y - r * 0.4, r * 0.4, r * 1.2, 0, 0.55) });
    // bezel: an inner lip in shadow, four screws
    Ph.put(press, Ph.circle(x, y, r - 12), BRASS_SH);
    for (let i = 0; i < 4; i++) {
        const a = Math.PI / 4 + i * Math.PI / 2, sx = x + Math.cos(a) * (r - 6), sy = y + Math.sin(a) * (r - 6);
        Ph.put(press, Ph.circle(sx, sy, 5), BRASS_SH);
        Ph.line(press, [[sx - 3, sy - 2], [sx + 3, sy + 2]], 1.6, { navy: 1 });
    }
    Ph.put(press, Ph.circle(x, y, r - 18), { 'yellow.s': 0.12, 'pink.s': 0.05 });
    Ph.ink(press, Ph.circle(x, y, r - 18), { 'navy.s': (g) => Riso.radial(g, x + 10, y - 10, r * 0.5, r, 0, 0.22) });
    // a pink band at each end of the scale (the needle's limits) and the zero mark's dot
    for (const sg of [-1, 1]) {
        const arcP = [];
        for (let a = -Math.PI / 2 + sg * 0.56; Math.abs(a + Math.PI / 2) <= 0.74; a += sg * 0.03) arcP.push([pivot[0] + Math.cos(a) * (needle - 12), pivot[1] + Math.sin(a) * (needle - 12)]);
        Ph.line(press, arcP, 7, { 'pink.s': 0.7 });
    }
    // scale: an arc of ticks above the pivot, a longer one at zero
    for (let i = -8; i <= 8; i++) {
        const a = -Math.PI / 2 + i * 0.09, l = i === 0 ? 20 : i % 4 === 0 ? 14 : 8, ro = needle - 4;
        Ph.line(press, [[pivot[0] + Math.cos(a) * ro, pivot[1] + Math.sin(a) * ro], [pivot[0] + Math.cos(a) * (ro - l), pivot[1] + Math.sin(a) * (ro - l)]], i === 0 ? 4 : 3, { navy: 1 });
    }
    const arc = [];
    for (let a = -Math.PI / 2 - 0.75; a <= -Math.PI / 2 + 0.75; a += 0.05) arc.push([pivot[0] + Math.cos(a) * (needle - 2), pivot[1] + Math.sin(a) * (needle - 2)]);
    Ph.line(press, arc, 3, { navy: 1 });
    // the needle (angle from vertical, right positive)
    const a = -Math.PI / 2 + theta, tip = [pivot[0] + Math.cos(a) * (needle - 10), pivot[1] + Math.sin(a) * (needle - 10)];
    Ph.line(press, [[pivot[0] - Math.cos(a) * 16, pivot[1] - Math.sin(a) * 16], tip], (u) => 7 - 5 * u, { navy: 1, 'pink.s': 0.5 });
    // counterweight on the needle's tail and the pivot cap
    Ph.put(press, Ph.circle(pivot[0] - Math.cos(a) * 16, pivot[1] - Math.sin(a) * 16, 6), { navy: 1, 'pink.s': 0.4 });
    Ph.put(press, Ph.circle(pivot[0], pivot[1], 10), BRASS_SH);
    press.knockout(Ph.circle(pivot[0] + 3, pivot[1] - 3, 2.5));
    // glass: a knocked-out reflection
    const gl = [];
    for (let b = -2.5; b <= -1.7; b += 0.05) gl.push([x + Math.cos(b) * (r - 26), y + Math.sin(b) * (r - 26)]);
    press.knockout((g) => { Ph.poly(g, Ph.outline(gl, Ph.taper(7, 0.3, 0.3))); g.fill(); });
    return tip;
}

Seg.newtonFaraday = {
    init() {
        // the galvanometer: a damped needle driven by the magnet's speed (flux change),
        // integrated once at 1 ms and read by time
        const dt = 0.001, n = Math.ceil(12.5 / dt), th = new Float32Array(n);
        let a = 0, v = 0;
        const w = 2 * Math.PI * 1.7, z = 0.62, K = 0.0042;
        for (let i = 0; i < n; i++) {
            const t = i * dt, vel = (magnetX(t + dt) - magnetX(t)) / dt;
            const acc = w * w * (K * vel - a) - 2 * z * w * v;
            v += acc * dt; a += v * dt; th[i] = a;
        }
        return { sim: (t) => Math.max(-GALV.max, Math.min(GALV.max, th[Math.min(n - 1, Math.max(0, Math.round(t / dt)))])) };
    },
    draw(press, tq, st) {
        const d = Math.round(tq * 12), sim = st.sim;
        const pan = Ease.inOut(seg(tq, TM.pan[0], TM.pan[1]));
        if (pan < 1) {
            // a slow push-in while he holds the ball, and again while the satellite goes round
            const gz = 1 + 0.04 * Ease.inOut(seg(tq, 0, 1.5)) + 0.05 * Ease.inOut(seg(tq, TM.orbit[0] - 0.3, TM.wind[0] + 0.3));
            Ph.cam(press, 800, 470, gz, () => { press.each((g2) => g2.translate(-800, -470)); newtonShot(press, tq, d, pan); });
        }
        if (pan > 0 && tq < TM.spot[0] + 0.4) faradayShot(press, tq, d, pan, sim);
        // the orbit winding into the coil (over both worlds while it travels)
        const wu = Ease.inOut(seg(tq, TM.wind[0], TM.wind[1]));
        if (tq >= TM.wind[0] && tq < TM.wind[1]) {
            const mc = modelCam(tq), C = [P[0], P[1] + R];
            const cs = [mc.ps[0] + (C[0] - P[0]) * mc.z - 1700 * pan, mc.ps[1] + (C[1] - P[1]) * mc.z];
            const S = lerp(ORB * mc.z / COIL.r, 1, wu);
            const c = [lerp(cs[0] + 1700 * pan, COIL.x, wu), lerp(cs[1], COIL.y, wu)]; // stays mid-frame while the worlds slide under it
            const cuu = seg(tq, TM.wind[0], TM.wind[0] + 0.35);
            const beta = lerp(Math.PI / 2, COIL.beta, wu);
            const w = lerp(10 * mc.z, 13, cuu);
            coil(press, c, COIL.r * S, COIL.pitch * S, COIL.turns, beta, w, 'back', cuu < 0.5 ? AMBER : COPPER);
            coil(press, c, COIL.r * S, COIL.pitch * S, COIL.turns, beta, w, 'front', cuu < 0.5 ? AMBER : COPPER);
        }
        // the spot: after the push-in the needle's tip becomes a light mark on a long scale
        if (tq >= TM.push[0] + 0.5) spotScale(press, tq, sim);
    },
    scale(press, tq, st) { spotScale(press, tq, st.sim); },
    // the finale's vignettes (lt: seconds since the atlas began, 0–3): Newton watching the
    // satellite go round the Earth, and Faraday's magnet going in, held, coming out
    atlasNewton(press, lt) {
        const tn = 3.4 + lt * 0.5;
        Ph.cam(press, 800, 450, 0.7, () => { press.each((g) => g.translate(-620, -480)); newtonShot(press, tn, Math.round(tn * 12), 0); });
    },
    atlasFaraday(press, lt, st) {
        const tf = 6.9 + lt;
        Ph.cam(press, 800, 450, 0.62, () => { press.each((g) => g.translate(-760, -470)); faradayShot(press, tf, Math.round(tf * 12), 1, st.sim); });
    },
    // the geometry of the closing scale (screen units), for the next segment to continue it
    SCALE: { y: 388.4, h: 68, tick: 34, x0: 800, src: [-60, 120] },
};

function spotScale(press, tq, sim) {
    // the needle's tip on screen (the push-in is complete from TM.push[1])
    const push = Ease.inOut(seg(tq, TM.push[0], TM.push[1])), z = lerp(1, 2.8, push);
    const F = [GALV.pivot[0], GALV.pivot[1] - GALV.needle * 0.75], th = sim(tq);
    const tipL = [GALV.pivot[0] + Math.sin(th) * (GALV.needle - 10), GALV.pivot[1] - Math.cos(th) * (GALV.needle - 10)];
    const tip = [F[0] + (800 - F[0]) * push + (tipL[0] - F[0]) * z, F[1] + (450 - F[1]) * push + (tipL[1] - F[1]) * z];
    const glow = seg(tq, TM.push[0] + 0.5, TM.spot[0]);
    // from TM.spot the dark spreads out from the mark and the mark runs along a scale
    const dark = Ease.in(seg(tq, TM.spot[0], TM.spot[0] + 0.34)) * 1900;
    const run = Ease.inOut(seg(tq, TM.spot[0] + 0.2, TM.spot[1] + 0.5));
    const y = tip[1], sx = tq < TM.spot[0] ? tip[0] : 800 + run * 560;
    if (dark > 0) Ph.put(press, Ph.circle(800, y, tq >= TM.spot[0] + 0.4 ? 9000 : dark), { blue: 0.9, 'navy.s': 0.9 });
    // the scale: an ivory strip slides in under the mark, ticks and numbers-free marks on it
    if (tq >= TM.spot[0] + 0.25) {
        const u = Ease.out(seg(tq, TM.spot[0] + 0.25, TM.spot[0] + 0.6)), top = y - 34 + (1 - u) * 60, h = 68;
        Ph.put(press, (g) => g.rect(-3000, top, 7600, h), { 'yellow.s': 0.16, 'pink.s': 0.06 });
        Ph.ink(press, (g) => g.rect(-3000, top + h - 12, 7600, 12), { 'navy.s': 0.35, 'pink.s': 0.2 });
        for (let i = -110; i <= 110; i++) {
            const x = 800 + i * 34, l = i % 5 === 0 ? 30 : i % 5 === 0 ? 22 : 14;
            Ph.line(press, [[x, top + 4], [x, top + 4 + l]], i % 5 === 0 ? 4 : 3, { navy: 1 });
            if (i % 10 === 0) Ph.put(press, Ph.circle(x, top + 48, 5), { navy: 1 });
        }
    }
    // the beam that makes the mark (a mirror galvanometer's light): a soft wedge from a lamp
    // off frame, with dust drifting in it
    const bf = seg(tq, TM.spot[0] + 0.15, TM.spot[0] + 0.5);
    if (bf > 0) {
        const src = [-60, 120], wedge = (g) => { g.beginPath(); g.moveTo(src[0], src[1] - 40); g.lineTo(sx, y - 12); g.lineTo(sx, y + 12); g.lineTo(src[0], src[1] + 40); g.closePath(); };
        press.knockout((g) => { g.fillStyle = Riso.ramp(g, src[0], 0, sx, 0, 0.12 * bf, 0.4 * bf); wedge(g); g.fill(); });
        Ph.ink(press, wedge, { 'yellow.s': (g) => Riso.ramp(g, src[0], 0, sx, 0, 0.1 * bf, 0.5 * bf) });
        const r = Motion.rng('dust');
        for (let i = 0; i < 40; i++) {
            const u = r(), off = (r() - 0.5) * 2, ph = r() * 6.28, sp = 0.3 + r() * 0.6;
            const bx = lerp(src[0], sx, u), by = lerp(src[1], y, u) + off * lerp(34, 10, u) + Math.sin(tq * sp + ph) * 6;
            Ph.put(press, Ph.circle(bx + Math.cos(tq * sp * 0.7 + ph) * 8, by, 2 + r() * 2), { 'yellow.s': 0.5 * bf });
        }
    }
    // the light mark: a soft screened halo round a yellow core with a paper-white centre
    const a = Math.max(glow, tq >= TM.spot[0] ? 1 : 0), R = 58 * a;
    if (a <= 0) return;
    press.knockout((g) => { g.fillStyle = Riso.radial(g, sx, y, 4, R, 0.9, 0); g.beginPath(); g.arc(sx, y, R, 0, Math.PI * 2); g.fill(); });
    Ph.ink(press, Ph.circle(sx, y, R), { 'yellow.s': (g) => Riso.radial(g, sx, y, 6, R, 0.9, 0) });
    Ph.put(press, Ph.ellipse(sx, y, 13 * a, 16 * a), { yellow: 1 });
    press.knockout(Ph.ellipse(sx, y, 6 * a, 8 * a));
}
})();
