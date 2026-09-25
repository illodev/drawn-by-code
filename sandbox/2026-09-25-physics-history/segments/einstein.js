// Segment FIS-06 of physics-history (26–32 s of the piece; local time 0–6): Einstein in his
// Bern study, 1915 look, stands at his high desk and watches a beam of light cross a 3D
// lattice that stands for the geometry of space. A mass (a star) appears at the lattice's
// centre, the lattice is pulled in towards it from every side, and two light paths bend
// towards it, the near one clearly more than the far one. The camera orbits 25° round the
// mass (the lattice is truly 3D: projected points and lines, depth ordered, in perspective),
// distant images arc round it, and the camera pushes into one lattice line that becomes the
// single vertical edge Schrödinger's segment starts from.
//
//   Seg.einstein.init(env) → state
//   Seg.einstein.draw(press, tq, st)      tq: local time 0–6 (on twos)
//   Seg.einstein.atlas(press, tq, st)     the finale's vignette
//
// Joins: local 0 is the ground plus one straight amber line, 8 wide, across the frame at
// y = 450 (the previous segment ends on it). At local 5.92 the frame is the ground plus one
// light-blue line (knocked out, then blue screen 0.45), 10 wide, at x = 800, full height.
//
// The physics, declared (not drawn by eye):
// - the lattice nodes are pulled towards the mass by d(r) = m·A·a²·r / (r² + a²)^1.5: zero at
//   the centre, strongest about one cell out, falling off with distance, never folding over
//   (d' < 1), the same in every direction (no outside «down»);
// - the light paths are integrated: a unit-speed ray turns towards the mass by the
//   perpendicular part of GM·m/r² at every step, so its direction changes continuously and
//   the total deflection is ≈ 2GM/b (∝ 1/b). With GM = 12 (exaggerated so it reads in
//   seconds), b = 85 turns ≈ 21° and b = 210 turns ≈ 7°;
// - the lensed images use the point-lens map θ± = (β ± √(β² + 4θE²)) / 2, stretched
//   tangentially by θ/β.
var Seg = globalThis.Seg ?? (globalThis.Seg = {});
(() => {
const { ink, smooth, poly, taper, circle, ellipse } = Ph;
// Ph.put / Ph.line, but `knock` may be a number: a partial knockout. A shape fading in with
// knock = f and its spec at f crossfades from what is behind it (no dark mud of screens)
function put(press, path, spec, o = {}) {
    const k = o.knock === undefined || o.knock === true ? 1 : o.knock === false ? 0 : Math.max(0, Math.min(1, o.knock));
    if (k > 0) press.knockout((g) => { if (k < 1) g.fillStyle = Riso.tone(k); g.beginPath(); path(g); g.fill(); });
    ink(press, path, spec);
}
const line = (press, pts, w, spec, o) => { const ol = Ph.outline(pts, w); put(press, (g) => poly(g, ol), spec, o); };
const lerp = Ease.lerp, seg = Ease.seg, TAU = Math.PI * 2;
const fade = (spec, f) => Object.fromEntries(Object.entries(spec).map(([k, v]) => [k.endsWith('.s') ? k : k + '.s', typeof v === 'function' ? v : v * f]));
const sstep = (a, b, x) => { const u = Math.max(0, Math.min(1, (x - a) / (b - a))); return u * u * (3 - 2 * u); };

// ── timings (local seconds) ───────────────────────────────────────────────────────────────
const TM = {
    build: [1 / 12, 0.6], find: [0, 1.4], ray2: [0.42, 1.25], massIn: [0.95, 1.5], curve: [1.0, 2.75],
    orbit: [3.0, 4.1], lens: [4.0, 4.95], push: [5.0, 5.84], clear: [5.42, 5.84], end: 5.9,
};

// ── colours as separations ────────────────────────────────────────────────────────────────
const AMBER = { yellow: 1, 'pink.s': 0.55 };
const EDGE = { 'blue.s': 0.45 };  // a lattice line: knocked out, then this (the end line's spec)
const WOOD_DK = { 'yellow.s': 0.8, 'pink.s': 0.65, 'navy.s': 0.72 };
const WOOD = { 'yellow.s': 0.85, 'pink.s': 0.6, 'navy.s': 0.45 };
const WOOD_LT = { 'yellow.s': 0.7, 'pink.s': 0.42, 'navy.s': 0.2 };
const GRAIN = { 'pink.s': 0.8, 'navy.s': 0.8, 'yellow.s': 0.9 };
const BRASS = { yellow: 1, 'pink.s': 0.22, 'navy.s': 0.08 };
const BRASS_SH = { yellow: 1, 'pink.s': 0.4, 'navy.s': 0.45 };
const PAPER = { 'yellow.s': 0.12, 'pink.s': 0.04 };
const PAPER_SH = { 'yellow.s': 0.22, 'pink.s': 0.1, 'navy.s': 0.14 };
// a charcoal-grey wool suit (lighter than Newton's and Faraday's coats, so it reads on the night)
const SUIT = { 'navy.s': 0.85, 'yellow.s': 0.6, 'pink.s': 0.42, 'blue.s': 0.2 };
const SUIT_LT = { 'navy.s': 0.72, 'yellow.s': 0.55, 'pink.s': 0.4, 'blue.s': 0.2 };
const SUIT_DK = { navy: 1, 'yellow.s': 0.75, 'pink.s': 0.5 };
const HAIR = { navy: 1, yellow: 0.85, 'pink.s': 0.5 };
const HAIR_LT = { 'navy.s': 0.6, yellow: 0.8, 'pink.s': 0.55 };
const HAIR_DK = { navy: 1, yellow: 1, pink: 0.8 };

// ── the world (units: a lattice cell is 110) ──────────────────────────────────────────────
const SP = 110, NI = 3, NJ = 2, NK = 2;         // nodes i ∈ [-3, 3], j, k ∈ [-2, 2]
const MASS_R = 50, GM = 12;
const RAYS = [{ b: -85, key: 'near' }, { b: -210, key: 'far' }]; // both in the plane z = 0, below the mass
const FLOOR = -350, WALL = -760;
const EIN = [-700, FLOOR, -100];                // Einstein's group: the floor under his feet
const GS = 0.8;                                // his group's scale (group units per world unit)
const HEAD_Y = 660;                             // his head's centre above the floor (group units)
const HERO = { i: 1, k: 2 };                    // the vertical line the camera pushes into
const F = 1556;                                 // focal length: 35 mm equivalent on 1600 units

// the lattice pulled towards the mass (m: 0..1)
function warp(p, m) {
    const r = Math.hypot(p[0], p[1], p[2]);
    if (m <= 0 || r < 1e-6) return p;
    const a = 140, d = m * 125 * a * a * r / Math.pow(r * r + a * a, 1.5);
    const k = (r - d) / r;
    return [p[0] * k, p[1] * k, p[2] * k];
}

// a light ray in the plane z = 0 entering from the left at height b (see the header)
function rayPath(b, m, x1 = 1500) {
    let p = [-1600, b], u = [1, 0];
    const pts = [[p[0], p[1], 0]], ds = 5;
    for (let n = 0; n < 900 && p[0] < x1; n++) {
        const r = Math.hypot(p[0], p[1]), gx = -GM * m * p[0] / (r * r * r), gy = -GM * m * p[1] / (r * r * r);
        const gd = gx * u[0] + gy * u[1];
        u = [u[0] + (gx - gd * u[0]) * ds, u[1] + (gy - gd * u[1]) * ds];
        const l = Math.hypot(u[0], u[1]);
        u = [u[0] / l, u[1] / l];
        p = [p[0] + u[0] * ds, p[1] + u[1] * ds];
        if (n % 4 === 3) pts.push([p[0], p[1], 0]);
    }
    return pts;
}

// ── camera ────────────────────────────────────────────────────────────────────────────────
const rotY = (p, a) => [p[0] * Math.cos(a) + p[2] * Math.sin(a), p[1], -p[0] * Math.sin(a) + p[2] * Math.cos(a)];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
function lookAt(E, T) {
    const fw = norm(sub(T, E)), rt = norm(cross(fw, [0, 1, 0])), up = cross(rt, fw);
    return { E, fw, rt, up };
}
function camAt(tq, heroTop) {
    // 0–1.4: from the beam's own height (pitch 0, so the beam is the horizon) up and back
    // to find Einstein; a soft sideways drift; 3.0–4.1 the orbit round the mass
    const a = Ease.inOut(seg(tq, TM.find[0], TM.find[1]));
    const drift = Ease.inOut(seg(tq, 1.2, 5.0));
    const T = [lerp(300, -200, a) + 40 * drift, lerp(-85, -40, a), 0];
    const yaw = lerp(-0.3, -0.5, a), pitch = lerp(0, 0.2, a), D = lerp(1100, 1480, a) - 50 * drift;
    let E = [T[0] + D * Math.sin(yaw) * Math.cos(pitch), T[1] + D * Math.sin(pitch), T[2] + D * Math.cos(yaw) * Math.cos(pitch)];
    let Tt = T;
    const orb = 0.436 * Ease.inOut(seg(tq, TM.orbit[0], TM.orbit[1]));
    E = rotY(E, orb);
    Tt = rotY(Tt, orb);
    // the push: into the hero line, level (vertical lines stay vertical), centred
    const pu = Ease.inOut(seg(tq, TM.push[0], TM.push[1]));
    if (pu > 0 && heroTop) {
        const H = heroTop;                   // the hero line's mid point (warped)
        const dir = norm(sub(Tt, E)), flat = norm([dir[0], 0, dir[2]]);
        const E2 = [H[0] - flat[0] * 125, H[1], H[2] - flat[2] * 125];
        const k = Ease.in(seg(tq, TM.push[0], TM.push[1])) * 0.35 + pu * 0.65;
        E = [lerp(E[0], E2[0], k), lerp(E[1], E2[1], pu), lerp(E[2], E2[2], k)];
        Tt = [lerp(Tt[0], H[0], pu), lerp(Tt[1], H[1] + (E[1] - H[1]) * 0, pu), lerp(Tt[2], H[2], pu)];
        // keep level as it arrives: the target at the eye's height
        Tt[1] = lerp(Tt[1], E[1], pu);
    }
    return lookAt(E, Tt);
}
// world → screen [x, y, depth]
function proj(c, P) {
    const d = sub(P, c.E), z = dot(d, c.fw);
    return [800 + F * dot(d, c.rt) / z, 450 - F * dot(d, c.up) / z, z];
}

// ── helpers ───────────────────────────────────────────────────────────────────────────────
// a light line: a (partial) knockout, then its spec; kA < 1 is a dimmer, farther line
function lightLine(press, pts, w, kA, spec) {
    const ol = Ph.outline(pts, w);
    if (kA > 0) press.knockout((g) => { g.fillStyle = Riso.tone(kA); poly(g, ol); g.fill(); });
    ink(press, (g) => poly(g, ol), spec);
}
function ik(s, w, a, b, bend) {
    const dx = w[0] - s[0], dy = w[1] - s[1], d = Math.min(Math.hypot(dx, dy), a + b - 0.01);
    const ang = Math.atan2(dy, dx), c = Math.acos(Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d))));
    return [s[0] + Math.cos(ang + bend * c) * a, s[1] + Math.sin(ang + bend * c) * a];
}
// billboard: draw fn in local units (1 = one world unit) at a world anchor
function bb(press, c, P, fn) {
    const q = proj(c, P);
    if (q[2] < 60) return;
    Ph.cam(press, q[0], q[1], F / q[2], fn);
}
// a world quad (4 points) projected, as a path
const quad = (c, pts) => (g) => { const q = pts.map((p) => proj(c, p)); if (q.some((v) => v[2] < 30)) return; g.moveTo(q[0][0], q[0][1]); for (let i = 1; i < q.length; i++) g.lineTo(q[i][0], q[i][1]); g.closePath(); };

// ── the lattice ───────────────────────────────────────────────────────────────────────────
function buildLattice() {
    const segs = [];
    const add = (a, b, axis) => segs.push({ a, b, axis, hero: axis === 'y' && a[0] === HERO.i * SP && a[2] === HERO.k * SP });
    for (let i = -NI; i <= NI; i++) for (let j = -NJ; j <= NJ; j++) for (let k = -NK; k <= NK; k++) {
        const p = [i * SP, j * SP, k * SP];
        if (i < NI) add(p, [(i + 1) * SP, j * SP, k * SP], 'x');
        if (j < NJ) add(p, [i * SP, (j + 1) * SP, k * SP], 'y');
        if (k < NK) add(p, [i * SP, j * SP, (k + 1) * SP], 'z');
    }
    const nodes = [];
    for (let i = -NI; i <= NI; i++) for (let j = -NJ; j <= NJ; j++) for (let k = -NK; k <= NK; k++) nodes.push([i * SP, j * SP, k * SP]);
    return { segs, nodes };
}

// the star at the centre: a sun-like disc, yellow with an orange limb (limb darkening), a
// fine mottle of granules drifting, a pale hot centre and a soft corona; f fades it
function star(press, c, r, tq, f, gl = 1) {
    if (r < 0.5) return;
    const [x, y] = c, R2 = r * 1.55 * gl;
    press.knockout((g) => { g.fillStyle = Riso.radial(g, x, y, r * 0.9, R2, 0.6 * f, 0); g.beginPath(); g.arc(x, y, R2, 0, TAU); g.fill(); });
    ink(press, circle(x, y, R2), { 'yellow.s': (g) => Riso.radial(g, x, y, r * 0.9, R2, 0.5 * f, 0) });
    put(press, circle(x, y, r), { [f < 1 ? 'yellow.s' : 'yellow']: f, 'pink.s': (g) => Riso.radial(g, x, y, r * 0.35, r * 1.02, 0.12 * f, 0.8 * f) }, { knock: f });
    press.save();
    press.clip(circle(x, y, r));
    const rr = Motion.rng('granules');
    for (let i = 0; i < 46; i++) {
        const a = rr() * TAU + tq * 0.12 * (rr() - 0.5), d = Math.sqrt(rr()) * r * 0.92, gr = r * (0.045 + 0.035 * rr());
        ink(press, circle(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.96, gr), { 'pink.s': (0.3 + 0.3 * (d / r)) * f });
    }
    press.restore();
    // the hot centre, paler
    press.knockout((g) => { g.fillStyle = Riso.radial(g, x - r * 0.08, y - r * 0.1, 0, r * 0.62, 0.55 * f, 0); g.beginPath(); g.arc(x - r * 0.08, y - r * 0.1, r * 0.62, 0, TAU); g.fill(); });
    ink(press, circle(x - r * 0.08, y - r * 0.1, r * 0.62), { 'yellow.s': (g) => Riso.radial(g, x - r * 0.08, y - r * 0.1, 0, r * 0.62, 0.5 * f, 0) });
    // two small prominences at the limb, flickering
    for (const [a0, k] of [[-2.3, 0], [0.9, 1]]) {
        const h = r * (0.12 + 0.05 * Motion.noise1('prom' + k, tq * 1.5)), pts = [];
        for (let i = 0; i <= 8; i++) { const a = a0 + (i / 8) * 0.34, rad = r + Math.sin(i / 8 * Math.PI) * h; pts.push([x + Math.cos(a) * rad, y + Math.sin(a) * rad]); }
        line(press, pts, taper(r * 0.07, 0.3, 0.3), { pink: 0.9 * f, 'yellow.s': 0.8 * f }, { knock: f });
    }
}

// ── the room ──────────────────────────────────────────────────────────────────────────────
// how much of the room is still room at world x (it dissolves into the geometric space)
const wallF = (x) => 1 - sstep(-470, -120, x);
const floorF = (x) => 1 - sstep(-420, 120, x);

function room(press, c, tq, rf) {
    // the floor: boards running towards us, dissolving into night on the right; where they
    // dissolve their seams turn into light-blue lines, the start of the geometry
    const X0 = -2400, X1 = 700, Z0 = WALL, Z1 = 520, PW = 70;
    for (let x = X0; x < X1; x += PW) {
        const f = floorF(x + PW / 2) * rf;
        if (f <= 0.02) continue;
        const shade = ((x / PW) % 3 + 3) % 3;
        const spec = shade === 0 ? WOOD_DK : shade === 1 ? { 'yellow.s': 0.82, 'pink.s': 0.62, 'navy.s': 0.62 } : { 'yellow.s': 0.78, 'pink.s': 0.66, 'navy.s': 0.68 };
        put(press, quad(c, [[x, FLOOR, Z0], [x + PW, FLOOR, Z0], [x + PW, FLOOR, Z1], [x, FLOOR, Z1]]), f < 1 ? fade(spec, f) : spec, { knock: f });
    }
    for (let x = X0; x <= X1; x += PW) {
        const f = floorF(x) * rf;
        const a = proj(c, [x, FLOOR, Z0]), b = proj(c, [x, FLOOR, Z1]);
        if (a[2] < 30 || b[2] < 30) continue;
        if (f > 0.5) line(press, [[a[0], a[1]], [b[0], b[1]]], 2.2, f < 1 ? fade({ navy: 1 }, f) : { navy: 1 }, { knock: f });
        const g = (1 - floorF(x)) * sstep(0.0, 0.35, floorF(x)) * rf;
        if (g > 0.02) lightLine(press, [[a[0], a[1]], [b[0], b[1]]], 2.6, 0.85 * g, { 'blue.s': 0.45 * g });
    }
    // where the boards dissolve, cross lines every lattice cell: the floor becomes a grid
    for (let z = Z0; z <= Z1; z += SP) {
        for (let x = -440; x < 160; x += PW) {
            const fm = floorF(x + PW / 2), g = (1 - fm) * sstep(0.0, 0.35, fm) * rf;
            if (g <= 0.02) continue;
            const a = proj(c, [x, FLOOR, z]), b = proj(c, [x + PW, FLOOR, z]);
            if (a[2] < 30 || b[2] < 30) continue;
            lightLine(press, [[a[0], a[1]], [b[0], b[1]]], 2.4, 0.8 * g, { 'blue.s': 0.45 * g });
        }
    }
    // board ends (staggered butt joints) and a few grain streaks
    const r = Motion.rng('ein-floor');
    for (let x = X0; x < X1; x += PW) {
        const f = floorF(x) * rf;
        if (f < 0.6) { r(); r(); continue; }
        const z = Z0 + 80 + r() * (Z1 - Z0 - 160), z2 = z + 120 + r() * 200;
        const p = proj(c, [x + 4, FLOOR, z]), q = proj(c, [x + PW - 4, FLOOR, z]);
        line(press, [[p[0], p[1]], [q[0], q[1]]], 1.8, { navy: 1 });
        const u = proj(c, [x + PW * 0.5, FLOOR, z2 - 90]), v = proj(c, [x + PW * 0.5, FLOOR, z2]);
        if (p[2] < 30 || q[2] < 30 || u[2] < 30 || v[2] < 30) continue;
        line(press, [[u[0], u[1]], [v[0], v[1]]], 1.4, GRAIN);
    }
    // the back wall's panelling (wainscot) and skirting, dissolving the same way
    const top = -130;
    for (let x = X0; x < 200; x += 60) {
        const f = wallF(x + 30) * rf;
        if (f <= 0.02) continue;
        const K = { knock: f }, S = (s) => (f < 1 ? fade(s, f) : s);
        put(press, quad(c, [[x, FLOOR, WALL], [x + 60, FLOOR, WALL], [x + 60, top, WALL], [x, top, WALL]]), S({ blue: 0.9, 'navy.s': 0.9, 'pink.s': 0.18 }), K);
        put(press, quad(c, [[x, top, WALL], [x + 60, top, WALL], [x + 60, top + 14, WALL], [x, top + 14, WALL]]), S({ 'blue.s': 0.55, 'navy.s': 0.45 }), K);
        put(press, quad(c, [[x, FLOOR, WALL], [x + 60, FLOOR, WALL], [x + 60, FLOOR + 40, WALL], [x, FLOOR + 40, WALL]]), S(WOOD_DK), K);
    }
    for (let x = X0 + 30; x < 100; x += 240) {
        const f = Math.min(wallF(x), wallF(x + 200)) * rf;
        if (f <= 0.05) continue;
        const K = { knock: f }, S = (s) => (f < 1 ? fade(s, f) : s);
        const P = (xx, yy) => { const q = proj(c, [xx, yy, WALL]); return [q[0], q[1]]; };
        const y0 = FLOOR + 70, y1 = top - 30;
        line(press, [P(x, y1), P(x + 200, y1)], 3, S({ 'blue.s': 0.5, 'navy.s': 0.4 }), K);
        line(press, [P(x, y1), P(x, y0)], 3, S({ 'blue.s': 0.5, 'navy.s': 0.4 }), K);
        line(press, [P(x + 200, y1), P(x + 200, y0)], 4, S({ navy: 1 }), K);
        line(press, [P(x, y0), P(x + 200, y0)], 4, S({ navy: 1 }), K);
    }
    // wall pieces as billboards on the wall plane
    const wf = (x) => wallF(x) * rf;
    bb(press, c, [-1170, 60, WALL], () => windowBern(press, tq, wf(-1170)));
    bb(press, c, [-380, 320, WALL], () => clock(press, tq, wf(-380)));
    bb(press, c, [-1420, FLOOR, WALL + 200], () => coatStand(press, tq, wf(-1420)));
    rug(press, c, rf);
}

// a worn rug under the desk, in perspective on the floor: a red field (pink + yellow), a navy
// border with a light rule, a medallion, fringes at the two ends
function rug(press, c, rf) {
    const x0 = -980, x1 = -380, z0 = -340, z1 = 120, y = FLOOR + 0.5;
    if ([[x0, z0], [x1, z0], [x1, z1], [x0, z1]].some(([x, z]) => proj(c, [x - 30, y, z])[2] < 30)) return;
    const Q = (xa, xb, za, zb) => quad(c, [[xa, y, za], [xb, y, za], [xb, y, zb], [xa, y, zb]]);
    const K = { knock: rf }, S = (s) => (rf < 1 ? fade(s, rf) : s);
    put(press, Q(x0, x1, z0, z1), S({ navy: 1, 'pink.s': 0.5, 'yellow.s': 0.4 }), K);
    put(press, Q(x0 + 40, x1 - 40, z0 + 40, z1 - 40), S({ pink: 0.85, 'yellow.s': 0.75, 'navy.s': 0.35 }), K);
    const rule = [[x0 + 28, z0 + 28], [x1 - 28, z0 + 28], [x1 - 28, z1 - 28], [x0 + 28, z1 - 28], [x0 + 28, z0 + 28]].map(([x, z]) => { const q = proj(c, [x, y, z]); return [q[0], q[1]]; });
    for (let i = 0; i < 4; i++) line(press, [rule[i], rule[i + 1]], 2, S({ 'yellow.s': 0.6, 'pink.s': 0.2 }), K);
    // the medallion: a lozenge, and small motifs in the field
    const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
    const lz = [[mx - 150, mz], [mx, mz - 110], [mx + 150, mz], [mx, mz + 110]].map(([x, z]) => { const q = proj(c, [x, y, z]); return [q[0], q[1]]; });
    put(press, (g) => poly(g, lz), S({ navy: 1, 'pink.s': 0.45 }), K);
    const lz2 = [[mx - 80, mz], [mx, mz - 60], [mx + 80, mz], [mx, mz + 60]].map(([x, z]) => { const q = proj(c, [x, y, z]); return [q[0], q[1]]; });
    put(press, (g) => poly(g, lz2), S({ 'yellow.s': 0.7, 'pink.s': 0.5 }), K);
    for (const [x, z] of [[x0 + 90, z0 + 90], [x1 - 90, z0 + 90], [x0 + 90, z1 - 90], [x1 - 90, z1 - 90]]) {
        const q = proj(c, [x, y, z]);
        put(press, ellipse(q[0], q[1], 9, 4), S({ navy: 1, 'blue.s': 0.4 }), K);
    }
    // fringes on the short ends
    for (const xe of [x0, x1]) for (let z = z0 + 10; z < z1; z += 22) {
        const a = proj(c, [xe, y, z]), b = proj(c, [xe + (xe === x0 ? -26 : 26), y, z + 4]);
        line(press, [[a[0], a[1]], [b[0], b[1]]], 1.6, S({ 'yellow.s': 0.3, 'pink.s': 0.1 }), K);
    }
}

// a sash window over the Bern roofs at night: frame, sky with stars, roofs with lit windows,
// the Zytglogge tower's silhouette, a half-drawn roller blind whose cord sways
function windowBern(press, tq, f) {
    if (f <= 0.02) return;
    const K = { knock: f }, S = (s) => (f < 1 ? fade(s, f) : s);
    const w = 300, h = 380, x = -w / 2, y = -h / 2;
    const FR = { 'yellow.s': 0.8, 'pink.s': 0.6, 'navy.s': 0.55 };
    put(press, (g) => g.rect(x - 20, y - 20, w + 40, h + 40), S(FR), K);
    put(press, (g) => g.rect(x, y, w, h), S({ navy: 1, 'blue.s': 0.45 }), K);
    press.save();
    press.clip((g) => g.rect(x, y, w, h));
    const r = Motion.rng('bern-stars');
    for (let i = 0; i < 14; i++) {
        const sx = x + 10 + r() * (w - 20), sy = y + 60 + r() * (h * 0.45), tw = Motion.noise1('bt' + i, tq * 3);
        put(press, circle(sx, sy, 2 + r() * 2.2 + tw * 0.7), S({ 'yellow.s': 0.45 + 0.3 * r() }), K);
    }
    // roofs: steep gables and a tower with a pointed spire and a clock face (no numerals)
    const roof = [[x - 10, y + h + 10], [x - 10, y + h * 0.78], [x + 30, y + h * 0.66], [x + 70, y + h * 0.78], [x + 90, y + h * 0.7], [x + 118, y + h * 0.7],
        [x + 118, y + h * 0.36], [x + 132, y + h * 0.25], [x + 146, y + h * 0.36], [x + 146, y + h * 0.6], [x + 190, y + h * 0.56], [x + 230, y + h * 0.72], [x + 262, y + h * 0.64], [x + w + 10, y + h * 0.74], [x + w + 10, y + h + 10]];
    put(press, (g) => poly(g, roof), S({ navy: 1, yellow: 0.6, 'blue.s': 0.3 }), K);
    put(press, circle(x + 132, y + h * 0.44, 8), S({ 'yellow.s': 0.55, 'pink.s': 0.2 }), K);
    for (const [wx, wy, on] of [[x + 30, y + h * 0.84, 0], [x + 60, y + h * 0.88, 1], [x + 200, y + h * 0.7, 2], [x + 240, y + h * 0.84, 3], [x + 280, y + h * 0.82, 4]]) {
        const lit = 0.55 + 0.35 * Math.max(0, Motion.noise1('lw' + on, tq * 0.8));
        put(press, (g) => g.rect(wx, wy, 9, 12), S({ yellow: lit, 'pink.s': 0.25 }), K);
    }
    // chimney smoke from one roof
    for (let i = 0; i < 3; i++) {
        const u = (tq * 0.3 + i / 3) % 1, sx = x + 222 + u * 26, sy = y + h * 0.66 - u * 90;
        put(press, circle(sx, sy, 5 + u * 9), S({ 'blue.s': 0.2 * (1 - u) }), { knock: false });
    }
    press.restore();
    // glazing bars, sill, the roller blind (half down) and its cord with a tassel
    put(press, (g) => g.rect(-7, y, 14, h), S(FR), K);
    put(press, (g) => g.rect(x, -7, w, 14), S(FR), K);
    put(press, (g) => g.rect(x - 30, y + h + 16, w + 60, 18), S(WOOD_LT), K);
    put(press, (g) => g.rect(x - 6, y - 4, w + 12, 96), S({ 'yellow.s': 0.5, 'pink.s': 0.2, 'navy.s': 0.2 }), K);
    line(press, [[x - 6, y + 92], [x + w + 6, y + 92]], 6, S(WOOD), K);
    const sw = Math.sin(tq * 2.1) * 6;
    line(press, [[20, y + 96], [20 + sw * 0.5, y + 150], [20 + sw, y + 200]], 1.8, S({ 'yellow.s': 0.5, 'navy.s': 0.3 }), K);
    put(press, ellipse(20 + sw, y + 208, 5, 9), S({ yellow: 1, 'pink.s': 0.5 }), K);
}

// a Vienna regulator on the wall: a tall wooden case, a paper dial with marks only, and a
// brass pendulum swinging behind the glass (period 1.5 s)
function clock(press, tq, f) {
    if (f <= 0.02) return;
    const K = { knock: f }, S = (s) => (f < 1 ? fade(s, f) : s);
    // crown and case
    put(press, (g) => poly(g, [[-60, -30], [0, -64], [60, -30]]), S(WOOD), K);
    put(press, circle(0, -66, 7), S(BRASS), K);
    put(press, (g) => g.rect(-56, -32, 112, 330), S(WOOD_DK), K);
    put(press, (g) => g.rect(-56, -32, 10, 330), S(WOOD), K);
    put(press, (g) => g.rect(-60, 292, 120, 16), S(WOOD), K);
    put(press, (g) => poly(g, [[-40, 308], [40, 308], [0, 340]]), S(WOOD_DK), K);
    // dial: paper with minute marks and hour marks
    put(press, circle(0, 32, 40), S({ 'yellow.s': 0.16, 'pink.s': 0.05 }), K);
    for (let i = 0; i < 12; i++) {
        const a = i / 12 * TAU, r0 = i % 3 === 0 ? 28 : 32;
        line(press, [[Math.cos(a) * r0, 32 + Math.sin(a) * r0], [Math.cos(a) * 37, 32 + Math.sin(a) * 37]], i % 3 === 0 ? 3 : 2, S({ navy: 1 }), K);
    }
    // the hands: nearly a quarter past eleven, the minute hand creeping
    const mA = -Math.PI / 2 + (15 + tq / 60) / 60 * TAU, hA = -Math.PI / 2 + (11.25 / 12) * TAU;
    line(press, [[0, 32], [Math.cos(hA) * 20, 32 + Math.sin(hA) * 20]], taper(4, 0.1, 0.5), S({ navy: 1 }), K);
    line(press, [[0, 32], [Math.cos(mA) * 30, 32 + Math.sin(mA) * 30]], taper(3, 0.1, 0.5), S({ navy: 1 }), K);
    put(press, circle(0, 32, 3.5), S(BRASS_SH), K);
    // the glass door and the pendulum
    put(press, (g) => g.rect(-38, 84, 76, 196), S({ navy: 1, 'blue.s': 0.4 }), K);
    const th = 0.16 * Math.sin(tq * TAU / 1.5);
    const bob = [Math.sin(th) * 150, 90 + Math.cos(th) * 150];
    press.save();
    press.clip((g) => g.rect(-38, 84, 76, 196));
    line(press, [[0, 90], bob], 3, S({ 'yellow.s': 0.7, 'navy.s': 0.4 }), K);
    put(press, circle(bob[0], bob[1], 17), S(BRASS), K);
    put(press, circle(bob[0] + 4, bob[1] + 4, 12), S({ 'navy.s': 0.35 }), { knock: false });
    press.knockout((g) => { g.beginPath(); g.ellipse(bob[0] - 6, bob[1] - 6, 5, 3, -0.6, 0, TAU); g.fill(); });
    press.restore();
    // a glint on the glass
    press.knockout((g) => { g.fillStyle = Riso.tone(f); poly(g, Ph.outline([[-28, 100], [-20, 150]], taper(4))); g.fill(); });
}

// a coat stand with a homburg and a coat hanging from it
function coatStand(press, tq, f) {
    if (f <= 0.02) return;
    const K = { knock: f }, S = (s) => (f < 1 ? fade(s, f) : s);
    for (const dx of [-60, 60, 0]) line(press, [[0, -40], [dx, 0]], 8, S(WOOD_DK), K);
    line(press, [[0, 0], [0, -760]], 12, S(WOOD), K);
    put(press, circle(0, -770, 12), S(WOOD_LT), K);
    for (const s of [-1, 1]) line(press, [[0, -720], [s * 34, -742], [s * 44, -760]], 6, S(WOOD), K);
    // the coat: dark wool hanging in folds, swaying a little in the draught
    const sw = Math.sin(tq * 1.3) * 4;
    put(press, (g) => smooth(g, [[-30, -730], [30, -730], [58, -600], [70 + sw, -380], [-54 + sw, -380], [-50, -600]]), S({ navy: 1, 'pink.s': 0.5, 'yellow.s': 0.5 }), K);
    for (const k of [-28, 0, 26]) line(press, [[k * 0.5, -700], [k + sw * 0.6, -390]], taper(4), S({ navy: 1, yellow: 1, pink: 0.6 }), K);
    // the hat on the top peg: crown with a pinch, a band, a curled brim
    put(press, (g) => smooth(g, [[-40, -770], [-34, -820], [0, -832], [34, -820], [40, -770]]), S({ navy: 1, yellow: 0.8, 'pink.s': 0.5 }), K);
    put(press, (g) => g.rect(-40, -790, 80, 12), S({ navy: 1, 'blue.s': 0.4 }), K);
    put(press, ellipse(0, -770, 62, 11), S({ navy: 1, yellow: 0.9, 'pink.s': 0.55 }), K);
    line(press, [[-30, -826], [0, -818], [30, -826]], 3, S({ navy: 1 }), K);
}

// ── Einstein and his high desk (group units: the floor under his feet at (0, 0)) ──────────
// a coat sleeve along shoulder → elbow → wrist, with a white cuff
function sleeve(press, s, e, w, width) {
    line(press, [s, e], (u) => width * (1 - 0.12 * u) + 7, SUIT_DK);
    line(press, [e, w], (u) => width * (0.88 - 0.18 * u) + 7, SUIT_DK);
    line(press, [s, e], (u) => width * (1 - 0.12 * u), SUIT);
    line(press, [e, w], (u) => width * (0.88 - 0.18 * u), SUIT);
    for (const k of [-1, 0, 1]) line(press, [[e[0] - 12 + k * 10, e[1] - width * 0.3], [e[0] - 2 + k * 12, e[1] + width * 0.22]], taper(3), SUIT_DK);
    const nrm = (a, b, d) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [dy / l * d, -dx / l * d]; };
    const up = (n) => (n[1] > 0 ? [-n[0], -n[1]] : n);
    const u1 = up(nrm(s, e, width * 0.28)), u2 = up(nrm(e, w, width * 0.26));
    line(press, [[s[0] + u1[0] + (e[0] - s[0]) * 0.2, s[1] + u1[1] + (e[1] - s[1]) * 0.2], [e[0] + u1[0], e[1] + u1[1]]], taper(width * 0.2), SUIT_LT);
    line(press, [[e[0] + u2[0], e[1] + u2[1]], [w[0] + u2[0] - 10, w[1] + u2[1]]], taper(width * 0.2), SUIT_LT);
}

// the high desk (a Stehpult, as at the patent office): a sloping top rising away from him,
// a flat ledge along the top edge, a carcass, four legs, a stretcher and a shelf of files
const DESK = { x0: 118, x1: 400, yLo: -384, yHi: -452, ledge: 34 };
function deskTopY(x) { return lerp(DESK.yLo, DESK.yHi, (x - DESK.x0) / (DESK.x1 - DESK.x0)); }
function deskBack(press) {
    // far legs and the far end of the carcass, darker
    for (const x of [150, 426]) put(press, (g) => g.rect(x, -330, 18, 330 - 6), WOOD_DK);
    put(press, (g) => poly(g, [[DESK.x0 + 26, deskTopY(DESK.x0) - 8], [DESK.x1 + 26, DESK.yHi - 16], [DESK.x1 + 26, -300], [DESK.x0 + 26, -300]]), WOOD_DK);
}
function deskFront(press, tq) {
    const { x0, x1, yLo, yHi } = DESK;
    // carcass (the box under the sloping lid), then its lit edge
    put(press, (g) => poly(g, [[x0, yLo + 10], [x1, yHi + 10], [x1, -296], [x0, -296]]), WOOD);
    put(press, (g) => g.rect(x0, -304, x1 - x0, 14), WOOD_LT);
    // a drawer with a brass pull
    put(press, (g) => g.rect(x0 + 60, -360, 150, 46), WOOD_DK);
    line(press, [[x0 + 60, -360], [x0 + 210, -360]], 2.4, WOOD_LT);
    put(press, ellipse(x0 + 135, -337, 12, 5), BRASS);
    // grain streaks on the carcass
    const r = Motion.rng('desk-grain');
    for (let i = 0; i < 6; i++) {
        const xa = x0 + 10 + r() * 180, ya = -376 + r() * 60;
        if (ya > -366 && ya < -310 && xa > x0 + 50 && xa < x0 + 220) continue;
        line(press, [[xa, ya], [xa + 50 + r() * 40, ya + (r() - 0.5) * 2]], taper(1.8), GRAIN);
    }
    // near legs (turned), stretcher, the shelf with files and a stack of books
    for (const x of [x0 + 6, x1 - 16]) {
        put(press, (g) => poly(g, [[x, -296], [x + 20, -296], [x + 18, 0], [x + 2, 0]]), WOOD);
        for (const y of [-240, -60]) put(press, ellipse(x + 10, y, 13, 16), WOOD_LT);
        line(press, [[x + 16, -290], [x + 15, -4]], 2, { 'navy.s': 0.6 });
    }
    put(press, (g) => g.rect(x0 + 12, -130, x1 - x0 - 12, 14), WOOD);
    put(press, (g) => g.rect(x0 + 12, -132, x1 - x0 - 12, 4), WOOD_LT);
    const files = [{ pink: 0.9, 'navy.s': 0.6 }, { 'blue.s': 0.8, yellow: 1, 'navy.s': 0.4 }, { navy: 1, 'pink.s': 0.5 }, PAPER_SH, { 'yellow.s': 0.8, 'pink.s': 0.7, 'navy.s': 0.4 }];
    let bx = x0 + 40;
    for (let i = 0; i < 5; i++) {
        const w = 18 + (i * 7) % 11, h = 70 + (i * 13) % 26;
        put(press, (g) => g.rect(bx, -130 - h, w, h), files[i]);
        line(press, [[bx + 3, -130 - h + 10], [bx + w - 3, -130 - h + 10]], 2, { yellow: 1, 'pink.s': 0.2 });
        bx += w + 3;
    }
    // papers bound in a ribbon, lying flat
    put(press, (g) => g.rect(bx + 30, -150, 110, 20), PAPER);
    put(press, (g) => g.rect(bx + 30, -150, 110, 5), PAPER_SH);
    put(press, (g) => g.rect(bx + 80, -151, 8, 22), { pink: 0.9, 'yellow.s': 0.3 });
    put(press, (g) => g.rect(x0 + 8, -32, x1 - x0, 12), WOOD_DK);
    // the sloping lid, seen a little from above: its top surface (a band going back), the
    // thick front edge catching the lamp
    const LV = [-12, -44];                       // the lid's depth, as seen from the camera
    const lid = (u, w) => [lerp(x0 - 14, x1, u) + LV[0] * w, lerp(yLo, yHi, u) + LV[1] * w];
    put(press, (g) => poly(g, [lid(0, 0), lid(1, 0), lid(1, 1), lid(0, 1)]), WOOD_LT);
    put(press, (g) => poly(g, [[x0 - 14, yLo], [x1, yHi], [x1, yHi + 16], [x0 - 14, yLo + 16]]), WOOD);
    line(press, [[x0 - 14, yLo + 1], [x1, yHi + 1]], 3, { 'yellow.s': 0.5, 'pink.s': 0.25 });
    line(press, [[x0 - 14, yLo + 15], [x1, yHi + 15]], 3, WOOD_DK);
    for (let i = 0; i < 3; i++) line(press, [lid(0.05, 0.25 + i * 0.25), lid(0.35 + i * 0.2, 0.28 + i * 0.25)], taper(1.6), GRAIN);
    // papers on the lid: a sheet of calculations and a sheet with a sketch (marks only: rows of
    // script-like strokes, a dot with a curve bending round it; never letters)
    const sheet = (u0, u1, w0, w1, sk) => {
        const P = (u, w) => lid(lerp(u0, u1, u) + sk * w, lerp(w0, w1, w));
        put(press, (g) => poly(g, [P(0, 0), P(1, 0), P(1, 1), P(0, 1)]), PAPER);
        line(press, [P(0, 0.02), P(1, 0.02)], 1.6, PAPER_SH);
        return P;
    };
    const A = sheet(0.06, 0.5, 0.12, 0.9, 0.03);
    for (let r = 0; r < 5; r++) for (let k = 0; k < 3; k++) {
        const u = 0.08 + k * 0.3 + (r % 2) * 0.05;
        line(press, [A(u, 0.85 - r * 0.16), A(u + 0.2 - (r * k) % 3 * 0.03, 0.85 - r * 0.16)], 1.5, { 'navy.s': 0.75 });
    }
    const B = sheet(0.5, 0.95, 0.1, 0.88, -0.02);
    put(press, circle(...B(0.45, 0.5), 3.2), { navy: 1 });
    line(press, [B(0.05, 0.25), B(0.3, 0.3), B(0.45, 0.36), B(0.62, 0.3), B(0.95, 0.12)], 1.6, { 'pink.s': 0.75, 'navy.s': 0.4 });
    line(press, [B(0.05, 0.8), B(0.95, 0.8)], 1.2, { 'navy.s': 0.5 });
    // the ledge along the high edge
    put(press, (g) => g.rect(x1 - 4, yHi - 20, 44, 20), WOOD);
    put(press, (g) => g.rect(x1 - 4, yHi - 22, 44, 5), WOOD_LT);
    // the lamp, the pipe, the inkwell on the ledge
    lamp(press, x1 + 22, yHi - 20, tq);
    inkwell(press, x1 + 2, yHi - 20);
    Ph.cam(press, x1 - 44, deskTopY(x1 - 44) - 22, 1.5, () => pipe(press, 0, 0, tq));
}
// an Emeralite-style desk lamp (1909): brass base and stem, a green glass shade, a warm pool
// of light on the papers, its filament breathing a little
function lamp(press, x, y, tq) {
    const fl = 1 + 0.06 * Motion.noise1('lampfl', tq * 5);
    const sx = x - 30, sy = y - 92;
    press.knockout((g) => { g.fillStyle = Riso.radial(g, sx - 30, sy + 90, 10, 150, 0.5 * fl, 0); g.beginPath(); g.arc(sx - 30, sy + 90, 150, 0, TAU); g.fill(); });
    ink(press, circle(sx - 30, sy + 90, 150), { 'yellow.s': (g) => Riso.radial(g, sx - 30, sy + 90, 10, 150, 0.45, 0) });
    put(press, ellipse(x, y - 4, 26, 6), BRASS_SH);
    put(press, (g) => poly(g, [[x - 5, y - 6], [x + 5, y - 6], [x + 4, y - 80], [x - 4, y - 80]]), BRASS);
    line(press, [[x, y - 80], [sx + 14, sy + 4]], 5, BRASS_SH);
    // the shade: a half cylinder, green (yellow + blue), lit rim, a bulb glow under it
    put(press, (g) => smooth(g, [[sx - 44, sy + 16], [sx - 38, sy - 4], [sx, sy - 12], [sx + 38, sy - 4], [sx + 44, sy + 16]]), { yellow: 1, blue: 0.75, 'navy.s': 0.3 });
    put(press, (g) => smooth(g, [[sx - 36, sy + 2], [sx, sy - 8], [sx + 20, sy - 6], [sx, sy - 2]]), { 'yellow.s': 0.8, 'blue.s': 0.4 });
    put(press, ellipse(sx, sy + 16, 44, 5), { yellow: 1, 'pink.s': 0.2 * fl });
    press.knockout(ellipse(sx, sy + 17, 20, 3));
}
function inkwell(press, x, y) {
    put(press, (g) => smooth(g, [[x - 14, y], [x - 12, y - 18], [x - 5, y - 22], [x + 5, y - 22], [x + 12, y - 18], [x + 14, y]]), { navy: 1, 'blue.s': 0.4 });
    put(press, ellipse(x, y - 22, 7, 2.5), { navy: 1, yellow: 0.8 });
    press.knockout((g) => { poly(g, Ph.outline([[x - 8, y - 16], [x - 10, y - 4]], taper(3))); g.fill(); });
    line(press, [[x + 1, y - 22], [x - 22, y - 76]], 2.4, { 'yellow.s': 0.4, 'navy.s': 0.5 });
}
// a pipe resting on the lid's lip, a thread of smoke rising from its bowl
function pipe(press, x, y, tq) {
    line(press, [[x - 44, y - 3], [x - 10, y - 5], [x + 4, y - 8]], taper(5, 0.1, 0.1), { navy: 1, yellow: 0.8, 'pink.s': 0.4 });
    put(press, (g) => smooth(g, [[x, y - 2], [x + 2, y - 22], [x + 20, y - 24], [x + 22, y - 4], [x + 12, y + 2]]), { 'yellow.s': 0.85, 'pink.s': 0.7, 'navy.s': 0.55 });
    put(press, ellipse(x + 11, y - 23, 9, 3), { navy: 1, 'pink.s': 0.5, yellow: 0.7 });
    put(press, ellipse(x + 11, y - 23, 4, 1.5), { yellow: 1, pink: 0.6 });
    // smoke: three threads born at the bowl, rising and curling, each a tapered wisp
    for (let i = 0; i < 3; i++) {
        const ph = i * 2.1, pts = [];
        for (let k = 0; k <= 10; k++) {
            const u = k / 10, h = u * (120 + i * 30);
            pts.push([x + 11 + Math.sin(u * 5 + tq * 2.2 + ph) * (4 + u * 16) + u * 10, y - 26 - h]);
        }
        const a = 0.55 - i * 0.12;
        lightLine(press, pts, taper(4.2 - i * 0.8, 0.05, 0.6), a * 0.9, { 'blue.s': 0.14 * a });
    }
}

// Einstein, 1915 (36): thick dark hair, tousled and standing up, a full dark moustache, strong
// brows, large dark eyes, a round face; a charcoal suit, waistcoat, white wing collar and a
// dark tie. Head local: the head's centre at (0, 0), facing right in near profile.
function einsteinBody(press, o) {
    const { SKIN, SKIN_SH, LINEN, LINEN_SH } = Cast;
    const SKIN_DK = { 'yellow.s': 0.36, 'pink.s': 0.5, 'navy.s': 0.2 };
    const LINE = { 'pink.s': 0.55, 'navy.s': 0.4 };
    const INK = { navy: 1 };
    const br = o.breath ?? 0;
    // legs and shoes: the far leg a step behind, the near one in front; the floor at y = 660
    const fl = 660;
    put(press, (g) => smooth(g, [[-66, 420], [30, 420], [22, 540], [8, fl - 20], [-34, fl - 20], [-40, 540]]), SUIT_DK);
    put(press, (g) => smooth(g, [[-38, fl - 26], [6, fl - 26], [38, fl - 12], [42, fl], [-40, fl]]), { navy: 1, yellow: 0.9, 'pink.s': 0.6 });
    put(press, (g) => smooth(g, [[-36, 420], [70, 420], [72, 520], [62, fl - 22], [16, fl - 22], [12, 540], [-24, 470]]), SUIT);
    line(press, [[46, 430], [52, 540], [50, fl - 24]], taper(3), SUIT_DK);
    line(press, [[20, 520], [26, 600]], taper(3), SUIT_LT);
    put(press, (g) => smooth(g, [[12, fl - 28], [62, fl - 28], [100, fl - 14], [104, fl], [12, fl]]), { navy: 1, yellow: 1, 'pink.s': 0.5 });
    line(press, [[26, fl - 22], [66, fl - 20], [94, fl - 10]], 2.2, { 'yellow.s': 0.45, 'navy.s': 0.2 });
    line(press, [[14, fl - 3], [102, fl - 3]], 2.5, { 'yellow.s': 0.4, 'navy.s': 0.3 });
    // jacket: shoulders, chest, skirts to the hip; the front opens on the waistcoat
    put(press, (g) => smooth(g, [[-122, 160], [-100, 116], [-40, 104 - br], [40, 102 - br], [92, 116], [118, 170], [126, 270], [120, 350], [116, 440], [40, 452], [-60, 448], [-118, 436], [-128, 330], [-130, 240]]), SUIT);
    put(press, (g) => smooth(g, [[-122, 170], [-104, 128], [-70, 118], [-96, 220], [-108, 330], [-112, 436], [-126, 330]]), SUIT_DK);
    // waistcoat, shirt and tie in the opening
    put(press, (g) => smooth(g, [[46, 118], [90, 120], [110, 190], [116, 300], [106, 356], [74, 344], [56, 220]]), { navy: 1, 'yellow.s': 0.5, 'pink.s': 0.5 });
    for (let i = 0; i < 4; i++) put(press, circle(88 + i * 5, 196 + i * 36, 4.2), { yellow: 0.9, 'pink.s': 0.3, 'navy.s': 0.3 });
    put(press, (g) => poly(g, [[46, 104], [92, 104], [98, 170], [70, 196]]), LINEN);
    line(press, [[60, 112], [74, 186]], taper(2.2), LINEN_SH);
    put(press, (g) => poly(g, [[70, 104], [86, 104], [90, 116], [92, 184], [84, 196], [78, 186], [76, 116]]), { navy: 1, 'pink.s': 0.65 });
    line(press, [[82, 122], [86, 180]], taper(3), { 'pink.s': 0.5, 'blue.s': 0.45 });
    for (let i = 0; i < 4; i++) line(press, [[74, 130 + i * 16], [88, 124 + i * 16]], 1.6, { 'pink.s': 0.6, 'yellow.s': 0.3 });
    // lapels folding back, a lit edge on the near one; a watch chain on the waistcoat
    put(press, (g) => poly(g, [[42, 108], [72, 126], [104, 236], [90, 262], [60, 180]]), SUIT_LT);
    line(press, [[44, 112], [74, 130], [104, 238]], taper(3), SUIT_DK);
    line(press, Ph.sample([[96, 262], [104, 282], [116, 290]], false, 6), 2, BRASS);
    // pocket flap and the jacket's hem
    put(press, (g) => poly(g, [[4, 350], [74, 346], [76, 362], [6, 366]]), SUIT_DK);
    line(press, [[-112, 438], [40, 448], [114, 438]], taper(3), SUIT_DK);
    // neck and wing collar
    put(press, (g) => smooth(g, [[-8, 44], [34, 48], [42, 100], [-12, 104]]), SKIN_SH);
    put(press, (g) => smooth(g, [[-26, 76], [22, 72], [60, 80], [62, 104], [8, 108], [-28, 104]]), LINEN);
    put(press, (g) => poly(g, [[48, 82], [66, 98], [56, 106], [44, 98]]), LINEN);
    line(press, [[-20, 90], [24, 86], [56, 92]], taper(2.6), LINEN_SH);
    // the face: round, a broad nose with a rounded tip, full lips under the moustache
    const face = [[-44, -62], [0, -80], [36, -80], [52, -64], [58, -40], [56, -28], [63, -12], [72, 3], [80, 13], [78, 21], [70, 24], [68, 34], [66, 44], [70, 50], [64, 58], [64, 68], [56, 80], [34, 88], [2, 86], [-28, 64], [-48, 26], [-54, -20]];
    put(press, (g) => smooth(g, face), SKIN);
    press.save();
    press.clip((g) => smooth(g, face));
    put(press, (g) => smooth(g, [[-70, -60], [-16, -54], [-2, -20], [-8, 20], [4, 58], [28, 98], [-80, 110]]), SKIN_SH, { knock: false });
    put(press, (g) => smooth(g, [[18, -34], [50, -30], [54, -14], [28, -10], [14, -20]]), { 'pink.s': 0.2, 'yellow.s': 0.12 }, { knock: false });
    put(press, (g) => smooth(g, [[52, -18], [62, -2], [70, 16], [60, 20], [50, 4]]), SKIN_SH, { knock: false });
    put(press, ellipse(32, 24, 19, 13), { 'pink.s': 0.3, 'yellow.s': 0.1 }, { knock: false });
    put(press, (g) => smooth(g, [[14, 72], [42, 78], [62, 70], [52, 94], [4, 96]]), SKIN_DK, { knock: false });
    press.restore();
    // ear, half under the hair
    put(press, (g) => smooth(g, [[-30, -18], [-14, -26], [-6, -8], [-10, 16], [-22, 20], [-32, 4]]), SKIN_SH);
    line(press, [[-14, -16], [-20, -4], [-14, 8]], taper(2.4), LINE);
    // features: the nose's line and nostril, lips, chin, brow, eye
    line(press, [[55, -28], [63, -12], [72, 3], [80, 13]], taper(4, 0.2, 0.2), LINE);
    line(press, [[68, 20], [62, 18], [60, 12]], taper(4.5), INK);
    put(press, (g) => smooth(g, [[58, 46], [68, 46], [68, 52], [60, 53]]), { 'pink.s': 0.45, 'yellow.s': 0.15 });
    line(press, [[52, 46], [60, 47], [68, 45]], taper(4, 0.4, 0.1), INK);
    line(press, [[44, 64], [56, 62], [62, 58]], taper(3), LINE);
    const bu = o.brow ?? 0;
    line(press, [[10, -30 - bu], [30, -40 - bu * 1.4], [56, -34 - bu]], taper(10, 0.2, 0.3), HAIR_DK);
    line(press, [[14, -33 - bu], [32, -41 - bu * 1.4]], taper(3, 0.3, 0.3), HAIR_LT);
    Cast.eye(press, 40, -14, 31, o.look ?? [1, 0.3]);
    if (o.blink) {
        put(press, (g) => smooth(g, [[22, -24], [42, -26], [60, -18], [58, -8], [40, -6], [22, -10]]), SKIN);
        line(press, [[24, -12], [42, -8], [58, -12]], taper(3.5, 0.2, 0.2), INK);
    }
    line(press, [[16, 2], [34, 8], [48, 6]], taper(2.4), { 'pink.s': 0.5, 'navy.s': 0.15 });
    // the moustache: full and dark, covering the upper lip, strands combed down
    const mo = [[42, 24], [58, 20], [70, 22], [80, 30], [78, 40], [66, 42], [52, 44], [40, 40], [36, 30]];
    put(press, (g) => smooth(g, mo), HAIR);
    for (const [a, b] of [[[48, 26], [46, 40]], [[58, 24], [58, 40]], [[68, 26], [70, 39]]]) line(press, [a, b], taper(2.2), HAIR_LT);
    line(press, [[40, 38], [56, 43], [76, 38]], taper(2.4), HAIR_DK);
    // hair: a thick, wavy dark mass brushed up and back off the brow (the 1910s portraits),
    // full over the ear and at the back, a few wisps lifting at the crown
    const wv = o.hairWave ?? 0;
    put(press, (g) => smooth(g, [[42, -64], [50, -84], [48, -102], [40, -118], [26, -130], [16, -134], [-2, -140], [-22, -134], [-40, -138], [-60, -126], [-78, -120], [-90, -104], [-104, -92], [-106, -72], [-114, -54], [-110, -34], [-114, -14], [-104, 6], [-100, 24], [-86, 36], [-72, 48], [-56, 40], [-44, 16], [-36, -20], [-14, -54], [10, -64], [36, -62]]), HAIR);
    const L = (pts, w, oo) => lock(press, pts, w, { ...oo, lit: false });
    // from the brow up and back over the crown, in waves
    L([[44, -68], [44, -98], [22, -122], [-8, -130], [-44, -124], [-78, -104]], 28, { a: 0.15, b: 0.3 });
    L([[32, -68], [26, -94], [4, -110], [-26, -110], [-58, -100], [-90, -80]], 24, { a: 0.15, b: 0.3 });
    L([[20, -68], [4, -88], [-24, -92], [-54, -80], [-84, -58], [-100, -30]], 24, { a: 0.15, b: 0.3 });
    // over the ear and down the back to the nape, the ends turning out
    L([[-30, -60], [-58, -52], [-84, -30], [-98, 0], [-94, 26], [-80, 42]], 26, { a: 0.1, b: 0.35 });
    L([[-24, -40], [-42, -24], [-52, 2], [-66, 26], [-60, 44]], 20, { a: 0.1, b: 0.4 });
    L([[-12, -58], [-28, -38], [-34, -12], [-40, 12]], 13, { a: 0.1, b: 0.5 });
    // wisps lifting off the crown and the back (tousled, soft, never spikes)
    for (const [pts, w] of [
        [[[8, -130], [18, -144 + wv], [32, -148 + wv]], 10],
        [[[-22, -132], [-26, -148 + wv], [-14, -158 + wv]], 10],
        [[[-70, -116], [-88, -126 + wv], [-100, -122 + wv]], 9],
        [[[-104, -40], [-118, -34 + wv * 0.5], [-122, -20]], 8],
    ]) line(press, Ph.sample(pts, false, 6), taper(w, 0.15, 0.6), HAIR);
    // waves: crescent strands catching the light, dark partings between the locks
    for (const [x, y, a] of [[16, -112, 0.1], [-24, -116, 0.0], [-60, -110, 0.4], [-12, -96, 0.1], [-48, -90, 0.3], [-88, -56, 1.1], [-94, -8, 1.5], [-62, 8, 1.8], [36, -104, -0.9]]) {
        line(press, Ph.sample([[x - 11 * Math.cos(a), y - 11 * Math.sin(a)], [x + 4 * Math.sin(a), y - 4 * Math.cos(a)], [x + 11 * Math.cos(a), y + 11 * Math.sin(a)]], false, 5), taper(3.4, 0.3, 0.3), HAIR_LT);
    }
    for (const pts of [[[38, -84], [16, -104], [-20, -104]], [[-38, -104], [-70, -92], [-92, -64]], [[-64, -68], [-84, -34], [-86, 6]], [[-44, -30], [-54, -4], [-66, 22]]]) line(press, pts, taper(2.6, 0.2, 0.3), HAIR_DK);
}
// Cast keeps its lock drawer private; the same drawer here
function lock(press, pts, w, o = {}) {
    line(press, pts, taper(w, o.a ?? 0.25, o.b ?? 0.35), HAIR);
    const off = (d) => pts.map(([x, y], i) => {
        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
        const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
        return [x - (dy / l) * d, y + (dx / l) * d];
    });
    if (o.lit !== false) line(press, off(-w * 0.18).slice(0, -1), taper(w * 0.22, 0.3, 0.3), HAIR_LT);
    line(press, off(w * 0.3).slice(1), taper(w * 0.12, 0.3, 0.4), HAIR_DK);
}

// the whole group: desk, Einstein standing at it, his near hand resting on the lid with a
// pencil. o: { tq, look, blink, brow }
function einsteinGroup(press, o) {
    const tq = o.tq;
    const br = Math.sin(tq * TAU / 3.2) * 2;
    deskBack(press);
    const head = [0, -HEAD_Y + br * 0.6];
    Ph.cam(press, head[0], head[1], 1, () => {
        press.each((g) => g.rotate(o.tilt ?? 0));
        einsteinBody(press, { ...o, breath: br });
    });
    deskFront(press, tq);
    // the near arm: shoulder → elbow → wrist on the lid, the hand holding a pencil
    const tap = Math.max(0, Math.sin(Math.min(1, Math.max(0, (tq - 4.3) / 0.5)) * Math.PI)) * 6;
    const wx = 190, wr = [wx, deskTopY(wx + 50) - 50 - tap];
    const sh = [head[0] - 30, head[1] + 140];
    const el = ik(sh, wr, 176, 168, 1);
    sleeve(press, sh, el, [wr[0] - 4, wr[1] + 2], 60);
    put(press, (g) => smooth(g, [[wr[0] - 22, wr[1] - 24], [wr[0] + 2, wr[1] - 22], [wr[0] + 8, wr[1] + 24], [wr[0] - 16, wr[1] + 28]]), Cast.LINEN);
    const rot = Math.atan2(DESK.yHi - DESK.yLo, DESK.x1 - DESK.x0) + 0.12;
    const hand = (part) => Ph.cam(press, wr[0] + 4, wr[1], 1, () => { press.each((g) => g.rotate(rot)); Cast.pinchHand(press, 0.15, part); });
    hand('thumb');
    // the pencil: between the thumb (behind) and the index (in front), its point on the paper
    Ph.cam(press, wr[0] + 4, wr[1], 1, () => {
        press.each((g) => g.rotate(rot));
        line(press, [[26, -30], [70, 50]], 8, { yellow: 1, 'pink.s': 0.35 });
        line(press, [[26, -30], [70, 50]], 2.4, { 'pink.s': 0.7, 'yellow.s': 0.3, 'navy.s': 0.2 });
        put(press, (g) => poly(g, [[66, 45], [75, 44], [74, 58]]), { 'yellow.s': 0.3, 'pink.s': 0.2 });
        line(press, [[72, 53], [74, 58]], 2.4, { navy: 1 });
        put(press, (g) => poly(g, [[22, -36], [31, -39], [33, -28], [25, -25]]), { pink: 1, 'yellow.s': 0.2 });
        line(press, [[25, -26], [33, -29]], 2.6, BRASS);
    });
    hand('front');
}

// ── background stars and their lensed images ──────────────────────────────────────────────
function buildStars() {
    const r = Motion.rng('ein-sky'), out = [];
    for (let i = 0; i < 170; i++) {
        const yaw = -0.95 + r() * 1.9, pit = -0.55 + r() * 0.95;
        out.push({ v: [Math.sin(yaw) * Math.cos(pit), Math.sin(pit), -Math.cos(yaw) * Math.cos(pit)], s: r() > 0.85 ? 4.6 : 2.4 + r() * 1.4, t: r() * 0.35, c: r() });
    }
    return out;
}
// small distant galaxies placed near the line of sight to the mass as the orbit ends, so the
// orbit itself brings them into line behind it
function buildGalaxies() {
    const c = camAt(4.6, warp([HERO.i * SP, 0, HERO.k * SP], 1)), d = norm(sub([0, 0, 0], c.E));
    return [[14, -0.7, 15], [46, 2.3, 13], [84, -0.2, 10], [120, 1.2, 8]].map(([b, a, rs], i) => {
        const v = norm([d[0] + (c.rt[0] * Math.cos(a) + c.up[0] * -Math.sin(a)) * b / F, d[1] + (c.rt[1] * Math.cos(a) + c.up[1] * -Math.sin(a)) * b / F, d[2] + (c.rt[2] * Math.cos(a) + c.up[2] * -Math.sin(a)) * b / F]);
        return { v, s: rs, t: 0.1 + i * 0.05, c: 0.6, gal: true };
    });
}
const projDir = (c, v) => { const z = dot(v, c.fw); return z <= 0.05 ? null : [800 + F * dot(v, c.rt) / z, 450 - F * dot(v, c.up) / z]; };

// ── the segment ───────────────────────────────────────────────────────────────────────────
function scene(press, tq, st, opts = {}) {
    const clear = opts.atlas ? 1 : 1 - Ease.inOut(seg(tq, TM.clear[0], TM.clear[1]));
    const m = opts.atlas ? 1 : Ease.inOut(seg(tq, TM.curve[0], TM.curve[1]));
    const heroMid = warp([HERO.i * SP, 0, HERO.k * SP], m);
    const c = opts.cam ?? camAt(tq, heroMid);
    const bf = opts.atlas ? 1 : Ease.out(seg(tq, TM.build[0], TM.build[1]));  // the build round the beam
    const rf = (opts.atlas ? 1 : Ease.out(seg(tq, 0.2, 0.6))) * clear;
    const Mq = proj(c, [0, 0, 0]), mR = F * MASS_R / Mq[2];
    const massGrow = opts.atlas ? 1 : Ease.out(seg(tq, TM.massIn[0], TM.massIn[1]));

    // 1 · the night beyond the room: stars (only where the room has dissolved) and, from 4 s,
    // their lensed images round the mass
    if (tq > 0 && clear > 0) {
        const bnd = proj(c, [-260, 0, WALL])[0];
        // the Einstein radius (angular, in screen units): on as soon as the mass is there; the
        // arcs appear when the orbit brings distant sources into line behind it (4–5 s)
        const thE = 0.062 * F * m * massGrow;
        for (const s of st.stars) {
            const p = projDir(c, s.v);
            if (!p || p[0] < -20 || p[0] > 1620 || p[1] < -20 || p[1] > 920) continue;
            const vis = sstep(bnd - 60, bnd + 160, p[0]) * sstep(s.t, s.t + 0.3, bf) * clear;
            if (vis <= 0.02) continue;
            const tw = 0.75 + 0.25 * Motion.noise1('es' + s.c, tq * 2.4);
            lensed(press, p, s.s * tw, Mq, thE, mR, s.gal ? { 'yellow.s': 0.45 * vis, 'pink.s': 0.42 * vis } : { 'yellow.s': (s.s > 4 ? 0.55 : 0.32) * vis, 'blue.s': 0.2 * s.c * vis }, (s.gal ? 1 : 0.85) * vis, s.gal);
        }
    }

    // 2 · the room
    if (!opts.atlas && rf > 0.01) room(press, c, tq, rf);

    // 3 · the lattice, the light paths and the mass, depth ordered (at 0: the beam alone)
    if (tq <= 0) drawRays(press, c, tq, m, bf, clear, opts);
    else {
        const items = [];
        const pr = (p) => proj(c, p);
        const zMid = Mq[2];
        for (const s of st.lat.segs) {
            if (opts.atlas && (Math.abs(s.a[0]) > 220 || Math.abs(s.b[0]) > 220)) continue;
            const pts = [0, 0.25, 0.5, 0.75, 1].map((u) => pr(warp([lerp(s.a[0], s.b[0], u), lerp(s.a[1], s.b[1], u), lerp(s.a[2], s.b[2], u)], m)));
            if (pts.some((q) => q[2] < 40)) continue;
            const z = (pts[0][2] + pts[4][2]) / 2;
            const zc = (s.a[2] + s.b[2]) / 2;
            items.push({ grp: zc < 0 ? 0 : zc === 0 ? 1 : 2, z, pts, s });
        }
        items.sort((a, b) => a.grp - b.grp || b.z - a.z);
        // build order: from the beam outwards
        const segBuild = (s) => {
            if (opts.atlas) return 1;
            const d = (Math.abs((s.a[1] + s.b[1]) / 2 + 85) / 330 + Math.abs((s.a[2] + s.b[2]) / 2) / 220 + Math.abs((s.a[0] + s.b[0]) / 2) / 660) / 2.2;
            return Ease.out(seg(tq, TM.build[0] + d * 0.3, TM.build[0] + d * 0.3 + 0.28));
        };
        const endU = seg(tq, TM.clear[0] + 0.12, TM.end);
        // lines of one look are printed together: one knockout and one inking per bucket
        // (a union, so crossings do not double up), flushed at each depth layer
        const buckets = new Map();
        const q20 = (v) => Math.round(v * 20) / 20;
        const bucket = (ol, kA, spec) => {
            const key = q20(kA) + '|' + Object.entries(spec).map(([k, v]) => k + q20(v)).join('|');
            let bk = buckets.get(key);
            if (!bk) buckets.set(key, (bk = { kA: q20(kA), spec: Object.fromEntries(Object.entries(spec).map(([k, v]) => [k, q20(v)])), polys: [] }));
            bk.polys.push(ol);
        };
        const flush = () => {
            for (const bk of buckets.values()) {
                const path = (g) => { for (const ol of bk.polys) { g.moveTo(ol[0][0], ol[0][1]); for (let i = 1; i < ol.length; i++) g.lineTo(ol[i][0], ol[i][1]); g.closePath(); } };
                if (bk.kA > 0) press.knockout((g) => { g.fillStyle = Riso.tone(bk.kA); g.beginPath(); path(g); g.fill(); });
                ink(press, path, bk.spec);
            }
            buckets.clear();
        };
        const drawItem = (it) => {
            const b = segBuild(it.s);
            if (b <= 0) return;
            const depthF = Math.max(0, Math.min(1, (it.z - (zMid - 330)) / 660));
            let kA = lerp(0.95, 0.5, depthF) * b, w = Math.max(2.4, Math.min(40, 3.6 * F / it.z));
            let spec = { 'blue.s': 0.45 * b };
            // strain: segments near the mass are tinted a little warmer as the lattice is pulled in
            const r = Math.hypot((it.s.a[0] + it.s.b[0]) / 2, (it.s.a[1] + it.s.b[1]) / 2, (it.s.a[2] + it.s.b[2]) / 2);
            const strain = m * Math.max(0, 1 - r / 300);
            if (strain > 0.02) spec['pink.s'] = 0.4 * strain * b;
            let pts2 = it.pts.map((q) => [q[0], q[1]]);
            if (it.s.hero && !opts.atlas) {
                // the hero line straightens into the edge of the next scene
                const u = Ease.inOut(endU);
                const top = it.s.b[1] === NJ * SP, bot = it.s.a[1] === -NJ * SP;
                pts2 = pts2.map(([x, y], i) => {
                    const v = (it.s.a[1] + (it.s.b[1] - it.s.a[1]) * (i / 4) + NJ * SP) / (2 * NJ * SP); // 0 bottom .. 1 top
                    const ty = lerp(930, -30, v);
                    return [lerp(x, 800, u), lerp(y, ty, u)];
                });
                if (top) pts2[4] = [lerp(pts2[4][0], 800, u), Math.min(pts2[4][1], lerp(pts2[4][1], -60, u))];
                if (bot) pts2[0] = [lerp(pts2[0][0], 800, u), Math.max(pts2[0][1], lerp(pts2[0][1], 960, u))];
                w = lerp(w, 10, u);
                kA = lerp(kA, 1, u);
                spec = { 'blue.s': 0.45 };
            } else if (clear < 1) {
                kA *= clear;
                spec = Object.fromEntries(Object.entries(spec).map(([k, v]) => [k, v * clear]));
                if (clear <= 0.01) return;
            }
            bucket(Ph.outline(pts2, w), kA, spec);
        };
        const nodes = () => {
            for (const n of st.lat.nodes) {
                if (opts.atlas && Math.abs(n[0]) > 220) continue;
                const q = pr(warp(n, m));
                if (q[2] < 40) continue;
                const b = segBuild({ a: n, b: n }) * clear;
                if (b <= 0.02) continue;
                const depthF = Math.max(0, Math.min(1, (q[2] - (zMid - 330)) / 660));
                const rr = Math.min(12, 4.4 * F / q[2]);
                const ring = Array.from({ length: 12 }, (_, k) => [q[0] + Math.cos(k / 12 * TAU) * rr, q[1] + Math.sin(k / 12 * TAU) * rr]);
                bucket(ring, lerp(1, 0.6, depthF) * b, { 'blue.s': 0.25 * b, 'yellow.s': 0.12 * b });
            }
            flush();
        };
        let i = 0;
        for (; i < items.length && items[i].grp === 0; i++) drawItem(items[i]);
        flush();
        for (; i < items.length && items[i].grp === 1; i++) drawItem(items[i]);
        flush();
        // the light paths
        drawRays(press, c, tq, m, bf, clear, opts);
        // the mass
        if (massGrow > 0 && clear > 0) star(press, [Mq[0], Mq[1]], mR * massGrow * Math.sqrt(clear), tq, Math.min(1, clear * 1.6), 1);
        for (; i < items.length; i++) drawItem(items[i]);
        flush();
        nodes();
        // the lines in front of the star are seen against its light: re-ink its disc in
        // yellow over them, so they read as pale threads and the star stays whole
        if (massGrow > 0 && clear >= 1) {
            const g = press.plate('blue', 'screen');
            g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000';
            circle(Mq[0], Mq[1], mR * massGrow * 0.98)(g); g.fill(); g.restore();
            ink(press, circle(Mq[0], Mq[1], mR * massGrow * 0.98), { yellow: 0.8 });
        }
    }

    // 4 · Einstein at his desk (in front of the stage)
    if (!opts.atlas && rf > 0.01 && tq < TM.clear[1]) {
        const look = tq < 1.4 ? [1, 0.15] : tq < 3 ? [1, 0.45] : [1, 0.3];
        const blink = (tq >= 2.33 && tq < 2.5) || (tq >= 4.67 && tq < 4.84);
        const brow = 5 * Ease.inOut(seg(tq, 1.8, 2.4)) * (1 - Ease.inOut(seg(tq, 3.4, 4.0)));
        const o = { tq, look, blink, brow, tilt: -0.03 * Ease.inOut(seg(tq, 1.6, 2.4)), hairWave: Math.sin(tq * 3) * 1.5 };
        if (rf >= 1) bb(press, c, EIN, () => { press.each((g) => g.scale(GS, GS)); einsteinGroup(press, o); });
        else {
            // fading: screens only and no knockouts, so the dots thin out over the night
            const pf = faded(press, rf);
            bb(pf, c, EIN, () => { press.each((g) => g.scale(GS, GS)); einsteinGroup(pf, o); });
            press.each((g) => { g.globalAlpha = 1; });
        }
    }

    // 5 · the last drawings: only the edge of the next scene
    if (!opts.atlas && tq >= TM.end) {
        press.knockout((g) => g.rect(0, 0, 1600, 900));
        Ph.ink(press, (g) => g.rect(0, 0, 1600, 900), { blue: 0.9 });
        Ph.ink(press, (g) => g.rect(0, 0, 1600, 900), { 'navy.s': (g) => Riso.radial(g, 820, 420, 120, 1000, 0.5, 0.95) });
        put(press, (g) => g.rect(795, -20, 10, 940), EDGE);
    }
}

// a press that prints everything drawn through it as screens at a fraction f of their tone,
// with no knockouts: a whole figure fading into dots
function faded(press, f) {
    press.each((g) => { g.globalAlpha = f; });
    return {
        plate: (ink) => press.plate(ink, 'screen'),
        knockout: (fn) => press.knockout(fn),   // at globalAlpha f: a partial knockout
        save: () => press.save(), restore: () => press.restore(),
        clip: (fn) => press.clip(fn), each: (fn) => press.each(fn),
    };
}

// a star (or a distant source) seen past the mass: with θE > 0 its image is pushed out to
// θ+ and stretched tangentially into an arc (and a fainter inner image for the source)
function lensed(press, p, rs, M, thE, mR, spec, kA, both = false) {
    const dx = p[0] - M[0], dy = p[1] - M[1], b = Math.hypot(dx, dy);
    // a star is a round dot; a galaxy a small tilted smudge with a brighter core
    const dot1 = (x, y, r) => {
        const sh = both ? ellipse(x, y, r * 1.1, r * 0.45, 0.6) : circle(x, y, r);
        press.knockout((g) => { g.fillStyle = Riso.tone(kA * (both ? 0.6 : 1)); sh(g); g.fill(); });
        ink(press, sh, spec);
        if (both) press.knockout((g) => { g.fillStyle = Riso.tone(kA); ellipse(x, y, r * 0.35, r * 0.2, 0.6)(g); g.fill(); });
    };
    if (thE <= 0.5 || b > thE * 4.5) { if (b > mR * 1.05) dot1(p[0], p[1], rs); return; }
    const ang = Math.atan2(dy, dx), root = Math.sqrt(b * b + 4 * thE * thE);
    const imgs = [[(b + root) / 2, ang, 1]];
    if (both) imgs.push([(root - b) / 2, ang + Math.PI, 0.6]);
    for (const [th, a, k] of imgs) {
        if (th < mR * 1.1) continue;
        const half = Math.min(1.1, rs / Math.max(b, 1)) * (k < 1 ? 0.7 : 1);   // tangential stretch θ/β
        const wR = Math.max(2, rs * 0.6 * (1 + b / root)) * (k < 1 ? 0.8 : 1);
        if (half * th < rs * 1.15) { dot1(M[0] + Math.cos(a) * th, M[1] + Math.sin(a) * th, rs); continue; }
        const pts = [];
        for (let i = 0; i <= 16; i++) { const aa = a - half + 2 * half * i / 16; pts.push([M[0] + Math.cos(aa) * th, M[1] + Math.sin(aa) * th]); }
        lightLine(press, pts, taper(wR * 2, 0.45, 0.45), kA * k, Object.fromEntries(Object.entries(spec).map(([kk, v]) => [kk, typeof v === 'number' ? v * k : v])));
    }
}

function drawRays(press, c, tq, m, bf, clear, opts) {
    for (let r = 0; r < RAYS.length; r++) {
        const R = RAYS[r];
        let pts = rayPath(R.b, m, opts.atlas ? 420 : 1150);
        if (opts.atlas) pts = pts.filter((p) => p[0] >= -420);
        // the far ray is drawn on from the left, a travelling front
        let on = 1;
        if (!opts.atlas && r === 1) on = Ease.inOut(seg(tq, TM.ray2[0], TM.ray2[1]));
        if (on <= 0) continue;
        const xf = lerp(-1600, 1500, on);
        let q = pts.filter((p) => p[0] <= xf).map((p) => proj(c, p)).filter((p) => p[2] > 40).map((p) => [p[0], p[1]]);
        if (q.length < 2) continue;
        const spec = clear < 1 ? fade(AMBER, clear) : AMBER;
        // at t = 0 the near beam is exactly the join line: 8 wide, straight, at y = 450
        const w = opts.atlas ? 9 : 8;
        line(press, q, on < 1 ? taper(w, 0.0001, 0.06) : w, spec, { knock: clear });
        if (clear < 1) continue;
        // pulses of light running along the path (the light is travelling)
        if (tq > 0.05) {
            let L = 0;
            const cum = [0];
            for (let i = 1; i < q.length; i++) { L += Math.hypot(q[i][0] - q[i - 1][0], q[i][1] - q[i - 1][1]); cum.push(L); }
            const at = (s) => {
                let j = 1;
                while (j < cum.length - 1 && cum[j] < s) j++;
                const u = (s - cum[j - 1]) / Math.max(1e-6, cum[j] - cum[j - 1]);
                return [lerp(q[j - 1][0], q[j][0], u), lerp(q[j - 1][1], q[j][1], u), Math.atan2(q[j][1] - q[j - 1][1], q[j][0] - q[j - 1][0])];
            };
            const sp = 900, gap = 420;
            for (let s0 = ((tq * sp + r * 170) % gap) - gap; s0 < L; s0 += gap) {
                if (s0 < 0) continue;
                const [x, y, a] = at(s0), k = Math.min(1, bf * 1.4);
                press.knockout((g) => { g.fillStyle = Riso.radial(g, x, y, 4, 40, 0.95 * k, 0); g.beginPath(); g.ellipse(x, y, 40, 9, a, 0, TAU); g.fill(); });
                ink(press, (g) => { g.beginPath(); g.ellipse(x, y, 40, 9, a, 0, TAU); }, { 'yellow.s': (g) => Riso.radial(g, x, y, 4, 40, 0.5 * k, 0) });
                press.knockout((g) => { g.beginPath(); g.ellipse(x, y, 16, 2.6, a, 0, TAU); g.fill(); });
            }
            // the front of the far ray, while it is drawn on
            if (on < 1) {
                const [x, y] = q[q.length - 1];
                press.knockout((g) => { g.fillStyle = Riso.radial(g, x, y, 1, 22, 0.9, 0); g.beginPath(); g.arc(x, y, 22, 0, TAU); g.fill(); });
                ink(press, circle(x, y, 8), { yellow: 1 });
                press.knockout(circle(x, y, 3.5));
            }
        }
    }
}

Seg.einstein = {
    init() {
        return { lat: buildLattice(), stars: buildStars().concat(buildGalaxies()) };
    },
    draw(press, tq, st) {
        if (!st.lat) Object.assign(st, Seg.einstein.init());
        scene(press, tq, st);
    },
    // the finale's vignette: Einstein at his desk beside a small lattice with the star and a
    // bent beam; the lattice turns slowly, pulses run along the beam, his pipe smokes
    atlas(press, tq, st) {
        if (!st.lat) Object.assign(st, Seg.einstein.init());
        atlasView(press, tq, st);
    },
    TM,
};

function atlasView(press, tq, st) {
    // a small stage inside the lens (r 400 round (800, 450)): the lattice's middle with the
    // star and both beams to the right, turning slowly; Einstein at his desk to the left
    const yaw = -0.42 + 0.07 * Math.sin(tq * 0.8);
    const T = [0, -20, 0], D = 2150, pitch = 0.2;
    const E = [T[0] + D * Math.sin(yaw) * Math.cos(pitch), T[1] + D * Math.sin(pitch), T[2] + D * Math.cos(yaw) * Math.cos(pitch)];
    const c0 = lookAt(E, T);
    press.save();
    press.each((g) => { g.translate(120, -10); });
    scene(press, tq + 3, st, { atlas: true, cam: c0 });
    press.restore();
    Ph.cam(press, 565, 725, 0.6, () => einsteinGroupAtlas(press, tq));
}
function einsteinGroupAtlas(press, tq) {
    const look = [1, 0.35];
    const blink = (tq % 3.4) > 3.25;
    // the floorboards he stands on
    put(press, (g) => g.rect(-60, -6, 560, 26), WOOD_DK);
    put(press, (g) => g.rect(-60, -8, 560, 6), WOOD_LT);
    for (const x of [30, 200, 370]) line(press, [[x, 0], [x + 4, 18]], 2.4, { navy: 1 });
    einsteinGroup(press, { tq, look, blink, brow: 2, hairWave: Math.sin(tq * 3) * 1.5 });
}
})();
