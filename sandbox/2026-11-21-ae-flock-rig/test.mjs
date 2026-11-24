// test.mjs · checks the flock rig outside After Effects. It loads the built Flock.jsx,
// takes the very expression strings it writes on a bird, and runs them against a mock of
// AE's expression objects, then compares them with flock-math.js called directly; and it
// checks the simulation's turn-arounds.
//
//   node sandbox/2026-11-21-ae-flock-rig/build.mjs && node sandbox/2026-11-21-ae-flock-rig/test.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const $ = { global: { FLOCK_NO_UI: true } };
new Function('$', fs.readFileSync(path.join(dir, 'Flock.jsx'), 'utf8'))($);
const RIG = $.global.FlockRig;
const M = new Function(RIG.math + '\nreturn { flockShape, flockClump, flockWindow, flockSumAt, flockMean, flockScatterSpeed, flockFacing, flockSize, flockScale, flockOrient, flockCycle };')();
const FlockSim = new Function(fs.readFileSync(path.join(dir, 'flock-sim.js'), 'utf8') + '\nreturn FlockSim;')();

let fails = 0, checks = 0;
const ok = (cond, what) => {
    checks++;
    if (!cond) {
        fails++;
        console.log('FAIL ' + what);
    }
};
const near = (a, b, eps = 1e-6) => (Array.isArray(a) ? a.every((x, i) => Math.abs(x - b[i]) <= eps) : Math.abs(a - b) <= eps);

// ---- the test flag is used up: one left in an AE session must not stop the user's run ----
ok($.global.FLOCK_NO_UI === false, 'loading Flock.jsx uses up FLOCK_NO_UI');
{
    let alerted = '';
    const again = { global: $.global };       // the same session: the flag is now false
    const app = { project: { activeItem: null } };
    new Function('$', 'app', 'alert', 'CompItem', fs.readFileSync(path.join(dir, 'Flock.jsx'), 'utf8'))(again, app, (m) => (alerted = m), function CompItem() {});
    ok(/open the composition/.test(alerted), `the next load in the same session runs the tool (it asked for a comp: "${alerted}")`);
}

// ---- a mock of AE: like AE, effect("X")(1) and transform.x are Property objects, not
// numbers (arithmetic converts them, === does not); .value gives the number. A keyed
// property is given as a function of time; it answers valueAtTime too.
const prop = (v, time) => {
    if (typeof v === 'function') return { value: v(time), valueAtTime: (t) => v(t) };
    return Array.isArray(v) ? Object.assign([...v], { value: [...v] }) : { value: v, valueOf: () => v };
};
function layer(effects, position, time) {
    return {
        effect: (n) => {
            if (!(n in effects)) throw new Error(`no effect "${n}"`);
            return () => prop(effects[n], time);
        },
        transform: { position: prop(position || [0, 0], time) },
    };
}
const NAME = 'Flock';
function controls(over) {
    const fx = {};
    for (const c of RIG.controls) fx[c.name] = c.value;
    for (const k in over || {}) fx[RIG.controls.find((c) => c.key === k).name] = over[k];
    return fx;
}
// run an expression the way AE does: the value of its last statement
const run = new Function('__ctx', '__code', 'with (__ctx) { return eval(__code); }');
function evalExpr(code, { ctl, center, bird, value, time = 1, others = {} }) {
    let seed = 0, timeless = false, n = 0;
    const rnd = () => {
        const x = Math.sin(seed * 12.9898 + (timeless ? 0 : time * 78.233) + ++n * 37.719) * 43758.5453;
        return x - Math.floor(x);
    };
    const ctx = {
        value: prop(value).value ?? value,
        time,
        // like AE, a layer that isn't there is an error, not null
        thisComp: {
            layer: (n) => {
                if (n === NAME + ' Controls') return layer(ctl, null, time);
                if (n === NAME + ' Center') return layer(center.fx, center.pos, time);
                if (n in others) return others[n];
                throw new Error(`Layer "${n}" not found`);
            },
        },
        effect: (n) => () => prop(bird[n], time),
        seedRandom: (s, tl) => ((seed = s), (timeless = !!tl), (n = 0)),
        random: (a, b) => a + (b - a) * rnd(),
        wiggle: (f, a) => value.map((v, i) => v + a * Math.sin(time * f * 6.2832 + seed + i)),
        sub: (a, b) => a.map((v, i) => v - b[i]),
        Math,
    };
    return run(ctx, code);
}

// ---- one bird's expressions against flock-math.js, over random control values ----------
const cycle = { start: 0, length: 0.5 }, turn = { start: 0.5, length: 0.5 };
const BAKE = { t0: 0, t1: 191 / 24, dt: 1 / 24, radius: 85, cruise: 600 };
const SHAPE_BUDGET = 0.35;       // flock-ae.jsx
for (const hasTurn of [false, true]) {
    const k = { name: NAME, id: 7, faces: 1, size: -0.37, offset: 0.62, cycle, turn: hasTurn ? turn : null, ...BAKE };
    const ex = RIG.expressions(k);
    for (let t = 0; t < 300; t++) {
        const r = (a, b) => a + (b - a) * ((Math.sin(t * 91.7 + a * 3.1 + b) + 1) / 2);
        const over = {
            spread: r(20, 200), length: r(20, 300), width: r(20, 300), angle: r(-180, 180), clump: r(-90, 150),
            scatter: t % 3 ? 0 : r(0, 40), scatterSpeed: t % 2 ? 0 : r(0.1, 3), scatterSeed: Math.round(r(1, 9)),
            size: r(30, 200), sizeVar: r(0, 60), persp: r(0, 150), orient: r(0, 100),
            turnWidth: r(0, 100), headOn: r(0, 100), flapSpeed: r(20, 200), desync: r(0, 100),
        };
        if (t % 10 === 0) Object.assign(over, { spread: 100, length: 100, width: 100, clump: 0 });   // defaults: W is 2 frames
        const ctl = controls(over);
        // keyed running sums: a drift plus wobble, like a flock's (the mean offset and axis move)
        const ox = r(-200, 200), oy = r(-200, 200), aa = r(-3, 3);
        const offsetSum = (tt) => [ox * tt + 30 * Math.sin(1.7 * tt + aa), oy * tt + 30 * Math.cos(1.1 * tt - aa)];
        const axisSum = (tt) => [0.6 * Math.sin(0.8 * tt + aa) / 0.8, -0.6 * Math.cos(0.8 * tt + aa) / 0.8 + 0.2 * tt];
        const R0 = r(40, 300), radiusSum = (tt) => R0 * tt + 20 * Math.sin(0.9 * tt + aa);
        const center = { pos: [r(0, 1920), r(0, 1080)], fx: { Radius: r(40, 300), Heading: r(-400, 400), 'Axis Sum': axisSum, 'Radius Sum': radiusSum } };
        const bird = { Facing: r(-1, 1), 'Flap Phase': r(0, 30), 'Offset Sum': offsetSum };
        const pos = [r(0, 1920), r(0, 1080)], depth = r(25, 300);
        const env = { ctl, center, bird };
        // Flock Center's own expressions (window, mean axis, mean radius) at time tt, as AE
        // evaluates them before a bird reads them
        const atTime = (tt) => {
            const fx = center.fx;
            fx['Shape Window'] = evalExpr(ex.window, { ctl, center, bird: fx, value: 0, time: tt });
            fx['Shape Axis'] = evalExpr(ex.axis, { ctl, center, bird: fx, value: [0, 0], time: tt });
            fx['Shape Radius'] = evalExpr(ex.radius, { ctl, center, bird: fx, value: 0, time: tt });
            return env;
        };
        // what the position expression should give, called on flock-math.js directly
        const shapeAt = (tt) => {
            const W = Math.max(2 * BAKE.dt, M.flockWindow(over.spread, over.length, over.width, over.clump, BAKE.radius, SHAPE_BUDGET * BAKE.cruise));
            const A = M.flockMean(axisSum, tt, W, BAKE.t0, BAKE.t1, BAKE.dt), d = M.flockMean(offsetSum, tt, W, BAKE.t0, BAKE.t1, BAKE.dt);
            const R = M.flockMean((u) => [radiusSum(u), 0], tt, W, BAKE.t0, BAKE.t1, BAKE.dt)[0];
            const o = M.flockShape(d[0], d[1], pos[0] - center.pos[0], pos[1] - center.pos[1], A[0], A[1], R,
                over.spread, over.length, over.width, over.angle, over.clump);
            return [center.pos[0] + o[0], center.pos[1] + o[1]];
        };

        // position: shape (scatter off for the exact comparison), at times inside and past the bake
        if (!over.scatter) {
            const tt = r(-1, 9);
            ok(near(evalExpr(ex.position, { ...atTime(tt), value: pos, time: tt }), shapeAt(tt), 1e-6), `position ${t}`);
            if (over.spread === 100 && over.length === 100 && over.width === 100 && over.clump === 0)
                ok(near(evalExpr(ex.position, { ...atTime(tt), value: pos, time: tt }), pos, 0), `default controls: exactly the simulated position (${t})`);
        } else {
            const a = evalExpr(ex.position, { ...atTime(1), value: pos, time: 1 }), b = evalExpr(ex.position, { ...atTime(2), value: pos, time: 2 });
            const sa = shapeAt(1), sb = shapeAt(2), wa = [a[0] - sa[0], a[1] - sa[1]], wb = [b[0] - sb[0], b[1] - sb[1]];
            if (over.scatterSpeed === 0) ok(near(wa, wb, 1e-9), `still scatter must not move (${t})`);
            const d = Math.hypot(wa[0], wa[1]);
            ok(d <= over.scatter * Math.SQRT2 + 1e-6, `scatter stays within its amount (${t}: ${d.toFixed(2)} > ${over.scatter.toFixed(2)})`);
        }
        // scale (the baked y carries the upside-down pose's sign)
        const f = M.flockFacing(bird.Facing, 1, over.turnWidth / 100, over.headOn / 100, hasTurn);
        const s = M.flockSize(depth / 100, over.persp, over.size, over.sizeVar, k.size);
        const up = t % 2 ? -1 : 1;
        ok(near(evalExpr(ex.scale, { ...env, value: [depth, depth * up] }), M.flockScale(f, s, up), 1e-6), `scale ${t}`);
        // rotation
        const rv = r(-400, 400);
        ok(near(evalExpr(ex.rotation, { ...env, value: rv }), M.flockOrient(rv, over.orient)), `rotation ${t}`);
        // time remap: inside the right cycle
        const tr = evalExpr(ex.timeRemap, { ...env, value: 0 });
        const qq = M.flockCycle(bird['Flap Phase'], k.offset, over.flapSpeed, over.desync);
        ok(near(tr, f[1] ? turn.start + qq * turn.length : cycle.start + qq * cycle.length), `time remap ${t}`);
        if (!hasTurn) ok(tr >= 0 && tr < 0.5, `side cycle only without a turn drawing (${t})`);
    }
}

// ---- the controls mean what their names say ---------------------------------------------
// a bird sitting on its mean offset (mx = dx), the flock travelling along hd (axis length n)
const S = (ox, oy, o) => {
    const h = ((o.hd ?? 0) * Math.PI) / 90, n = o.n ?? 1;
    return M.flockShape(ox, oy, ox, oy, n * Math.cos(h), n * Math.sin(h), o.R ?? 100, o.spread ?? 100, o.len ?? 100, o.wid ?? 100, o.ang ?? 0, o.clump ?? 0);
};
ok(near(S(10, 5, {}), [10, 5]), 'defaults leave the flock as simulated');
ok(near(S(10, 5, { len: 200 }), [20, 5]), 'Length stretches along the travel axis');
ok(near(S(10, 5, { len: 200, hd: 90 }), [10, 10]), 'Length follows the travel axis (90°: along y)');
ok(near(S(10, 5, { len: 200, hd: 270 }), [10, 10]), 'an axis has no front: 270° stretches like 90°');
ok(near(S(10, 5, { wid: 50 }), [10, 2.5]), 'Width squeezes across the travel axis');
ok(near(S(10, 5, { len: 200, ang: 90 }), [10, 10]), 'Shape Angle turns the stretch axis');
ok(near(S(10, 5, { len: 200, n: 0.6 }), [20, 5]), 'a fairly steady axis (mean length 0.6) stretches in full');
ok(near(S(10, 5, { len: 200, n: 0.25 }), [17.5, 6.25]) && near(S(10, 5, { len: 200, n: 0 }), [15, 7.5]),
    'where the flock keeps turning or stops, the stretch fades (axis below 0.5) to a round mean');
ok(near(S(50, 0, { clump: 100 }), [25, 0]), 'Clumping pulls the core in');
ok(near(S(200, 0, { clump: 100 }), [400, 0]), 'Clumping pushes stragglers out');
ok(near(S(500, 0, { clump: 100 }), [1500, 0]), 'Clumping is capped at 3× for far stragglers');
ok(near(S(50, 0, { clump: -50 }), [50 * Math.pow(0.5, -0.5), 0]), 'negative Clumping evens out');
ok(near(S(10, 5, { spread: 50 }), [5, 2.5]), 'Spread scales the whole flock');
ok(near(M.flockShape(10, 0, 13, 4, 1, 0, 100, 200, 100, 100, 0, 0), [23, 4]),
    'the shape moves the mean offset; the bird keeps its own motion around it, unscaled');
ok(near(M.flockShape(10, 0, 13, 4, 0.3, 0.8, 100, 100, 100, 100, 0, 0), [13, 4]), 'at the default shape a bird is exactly where it was simulated');
ok(M.flockWindow(100, 100, 100, 0, 85, 210) === 0, 'default controls: no window (nothing to average)');
ok(M.flockWindow(300, 100, 100, 0, 85, 210) > M.flockWindow(200, 100, 100, 0, 85, 210), 'a bigger flock averages over longer');
ok(M.flockWindow(100, 250, 55, 0, 85, 210) > M.flockWindow(100, 150, 100, 0, 85, 210), 'a longer, thinner flock turns its axis slower');
const lin = (tt) => [3 * tt + 1, -2 * tt];
ok(near(M.flockMean(lin, 4, 2, 0, 8, 1 / 24), [3, -2]) && near(M.flockMean(lin, 7.5, 6, 0, 8, 1 / 24), [3, -2]),
    'a window reaching past the bake carries the sums on at their own rate');
ok(near(M.flockScatterSpeed(0.5, 12, 60), 0.5) && near(M.flockScatterSpeed(3, 40, 60), 60 / 160), 'Scatter Speed is capped for big amounts');
const F = (face, minW, headOn, turnOn) => M.flockFacing(face, 1, minW, headOn, turnOn);
ok(near(F(1, 0.3, 0.6, false), [1, 0]) && near(F(-1, 0.3, 0.6, false), [-1, 0]), 'full width when not turning');
ok(near(F(0.1, 0.3, 0.6, false), [0.37, 0]) && near(F(-0.1, 0.3, 0.6, false), [-0.37, 0]), 'Turn Width is the narrowest a bird gets');
ok(near(F(0, 0, 0.6, false)[0], 0), 'Turn Width 0 = edge-on, as in round 1');
ok(near(F(0.3, 0.3, 0.6, true), [1, 1]), 'mid-turn shows the head-on drawing, unmirrored');
ok(near(F(-0.8, 0.3, 0.6, true), [-0.65, 0]), 'side view resumes past the head-on share');
ok(near(F(0.3, 0.3, 0, true), [0.3 + 0.7 * 0.3, 0]), 'Head-On 0 = never use the turn drawing');
ok(near(M.flockScale([0.5, 0], 80, 1), [40, 80]) && near(M.flockScale([0.5, 0], 80, -1), [40, -80]), 'the upside-down pose keeps its vertical sign');
ok(near(M.flockScale([1, 1], 80, -1), [-80, -80]), 'head-on drawing stays upright in the upside-down pose');
ok(near(M.flockOrient(30, 0), 0) && near(M.flockOrient(190, 0), 180) && near(M.flockOrient(-170, 50), -175), 'Orient levels towards the nearest 0 / 180');
ok(near(M.flockOrient(397, 100), 397), 'Orient 100 = as simulated');
ok(near(M.flockCycle(3.62, 0.62, 100, 100), 0.62), 'defaults: the baked phase');
ok(near(M.flockCycle(3.62, 0.62, 100, 0), 0), 'Desync 0: every bird in unison');

// ---- the leader check: the viewer says so when the leader no longer matches the bake ----
{
    const k = { name: NAME, id: 0, faces: 1, size: 0, offset: 0, cycle: null, turn: null, ...BAKE, leader: 'Leader' };
    const ex = RIG.expressions(k);
    const baked = (t) => [300 + 200 * t, 500 - 40 * Math.sin(t)];             // the path the sim saw
    const leaderLayer = (path) => ({
        anchorPoint: { value: [0, 0], valueAtTime: () => [0, 0] },
        toComp: (p, t) => { const q = path(t); return [q[0] + p[0], q[1] + p[1], 0]; },
    });
    const center = { pos: [0, 0], fx: { 'Leader Path': baked } };
    const check = (others) => [evalExpr(ex.checkOpacity, { center, others, value: 100 }), evalExpr(ex.checkText, { center, others, value: '' })];
    const same = check({ Leader: leaderLayer(baked) });
    ok(same[0] === 0, 'leader check hidden while the leader matches the bake');
    // the first key moved 300 px left, blending back into the old path by 2 s (what the user did)
    const moved = check({ Leader: leaderLayer((t) => { const p = baked(t), w = Math.max(0, 1 - t / 2); return [p[0] - 300 * w, p[1]]; }) });
    ok(moved[0] === 100 && /moved since the bake \(up to 300 px\)/.test(moved[1]), `leader check shows a moved leader (${moved[1]})`);
    const tiny = check({ Leader: leaderLayer((t) => [baked(t)[0] + 1, baked(t)[1]]) });
    ok(tiny[0] === 0, 'a 1 px difference is not a moved leader');
    const gone = check({});
    ok(gone[0] === 100 && /can't find the leader "Leader"/.test(gone[1]), `leader check shows a missing leader (${gone[1]})`);
    console.log(`leader check: ${moved[1]}`);
}

// ---- simulation: turn-arounds are staggered ---------------------------------------------
const fps = 24, FR = 8 * fps;
const LX = [], LY = [];
for (let f = 0; f <= FR + 12; f++) {
    // out and back: right for 3 s, a U-turn, left
    const t = f / fps, u = Math.min(1, Math.max(0, (t - 2.5) / 1.5));
    LX.push(t < 2.5 ? 200 + 400 * t : 1200 - 800 * (t - 2.5) * (u < 1 ? u : 1) + 0);
    LY.push(540 - 120 * Math.sin(Math.PI * u));
}
const sim = FlockSim.run({ leaderX: LX, leaderY: LY, frames: FR, lead: 0.4, fps, count: 80, spacing: 40, seed: 3 });
let worst = 0, worstAt = 0, everTurned = 0;
for (let f = 0; f < FR; f++) {
    let thin = 0;
    for (const b of sim.birds) if (Math.abs(b.face[f]) < 0.3) thin++;
    if (thin / sim.birds.length > worst) (worst = thin / sim.birds.length), (worstAt = f);
}
// turned around = its nose went from pointing right to pointing left (or back)
const noseX = (b, f) => Math.cos((b.rot[f] * Math.PI) / 180) * Math.sign(b.face[f] || 1);
for (const b of sim.birds) if (b.rot.some((_, f) => noseX(b, f) > 0.3) && b.rot.some((_, f) => noseX(b, f) < -0.3)) everTurned++;
console.log(`U-turn: ${everTurned}/80 birds turn around; at most ${(worst * 100).toFixed(0)} % are mid-turn (|facing| < 0.3) in one frame (f${worstAt})`);
ok(everTurned > 40, 'most birds turn around on a U-turn');
ok(worst < 0.5, 'turn-arounds are staggered: fewer than half the flock mid-turn at once');
for (const k of ['radius', 'heading']) ok(sim.center[k].every((v) => isFinite(v)), `center ${k} is finite`);

// every bird: rotation never jumps, the nose points where it flies, the back stays up
let rotJump = 0, noseOff = 0, noseN = 0, upsideDown = 0, levelN = 0;
for (const b of sim.birds) {
    for (let f = 0; f < FR; f++) {
        if (f) rotJump = Math.max(rotJump, Math.abs(b.rot[f] - b.rot[f - 1]));
        const a = (b.rot[f] * Math.PI) / 180, sx = b.face[f], up = b.up[f];
        const nose = [Math.cos(a) * Math.sign(sx), Math.sin(a) * Math.sign(sx)];
        const back = [Math.sin(a) * up, -Math.cos(a) * up];              // R(rot) · (0, -up)
        const vx = b.vx[f], vy = b.vy[f], vxy = Math.hypot(vx, vy), v3 = Math.hypot(vx, vy, b.vz[f]);
        if (Math.abs(sx) === 1 && vxy > 0.6 * v3) {
            noseN++;
            if ((nose[0] * vx + nose[1] * vy) / vxy < Math.cos((35 * Math.PI) / 180)) noseOff++;
        }
        if (Math.abs(vy) < 0.5 * vxy) {
            levelN++;
            if (back[1] > 0.2) upsideDown++;
        }
    }
}
console.log(`pose: max rotation change ${rotJump.toFixed(1)}° per frame; nose more than 35° off its flight ${(100 * noseOff / noseN).toFixed(1)} %; upside down in level flight ${(100 * upsideDown / levelN).toFixed(1)} %`);
ok(rotJump <= 25.01, 'rotation never spins between frames (turn-arounds included)');
ok(noseOff / noseN < 0.05, 'birds point where they fly');
ok(upsideDown === 0, 'no bird flies upside down');
let hdJump = 0;
for (let f = 1; f < FR; f++) hdJump = Math.max(hdJump, Math.abs(sim.center.heading[f] - sim.center.heading[f - 1]));
console.log(`heading: max change ${hdJump.toFixed(1)}° per frame; radius ${Math.min(...sim.center.radius).toFixed(0)}–${Math.max(...sim.center.radius).toFixed(0)} px`);
ok(hdJump < 15, 'the shape axis turns smoothly');

// ---- speed: the live shape never makes birds fly faster than birds fly ------------------
// The demo's path (a swoop and a loop), baked like Flock.jsx bakes it, then the very position
// expression run on every 4th bird for shapes that used to send edge birds racing round.
const KEYS = [[0.0, -160, 640], [1.2, 420, 520], [2.4, 900, 300], [3.3, 1180, 420], [4.1, 1010, 640],
    [4.9, 760, 520], [5.8, 1040, 330], [6.8, 1500, 380], [8.0, 2100, 260]];
const leaderAt = (t) => {
    let k = 0;
    while (k < KEYS.length - 2 && t > KEYS[k + 1][0]) k++;
    const p0 = KEYS[Math.max(0, k - 1)], p1 = KEYS[k], p2 = KEYS[k + 1], p3 = KEYS[Math.min(KEYS.length - 1, k + 2)];
    const u = Math.min(1, Math.max(0, (t - p1[0]) / (p2[0] - p1[0])));
    const cr = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
    return [cr(p0[1], p1[1], p2[1], p3[1]), cr(p0[2], p1[2], p2[2], p3[2])];
};
const DX = [], DY = [];
for (let f = 0; f <= FR + 10; f++) {
    const p = leaderAt(f / fps);
    DX.push(p[0]);
    DY.push(p[1]);
}
const demo = FlockSim.run({ leaderX: DX, leaderY: DY, frames: FR, lead: 0.4, fps, count: 80, spacing: 45, seed: 7 });
const cruise = demo.stats.cruise, DC = demo.center;
const keyed = (X, Y) => (tt) => {
    const u = Math.min(FR - 1, Math.max(0, tt * fps)), j = Math.min(FR - 2, Math.floor(u)), w = u - j;
    return [X[j] + (X[j + 1] - X[j]) * w, Y[j] + (Y[j + 1] - Y[j]) * w];
};
const radiusSum = (tt) => keyed(DC.radiusSum, DC.radiusSum)(tt)[0];
const pct = (a, p) => [...a].sort((x, y) => x - y)[Math.min(a.length - 1, Math.floor(p * a.length))];
// within a frame, birds of a flock fly at nearly one speed (the simulation's band)
const band = [];
for (let f = 1; f < FR - 1; f++) {
    const sp = demo.birds.map((b) => Math.hypot(b.x[f + 1] - b.x[f - 1], b.y[f + 1] - b.y[f - 1], b.z[f + 1] - b.z[f - 1]) * fps / 2);
    const mean = sp.reduce((a, b) => a + b) / sp.length;
    for (const s of sp) band.push(s / mean);
}
console.log(`simulation: bird speed / the flock's mean speed that frame, p1 ${pct(band, 0.01).toFixed(2)} … p99 ${pct(band, 0.99).toFixed(2)}`);
ok(pct(band, 0.01) > 0.85 && pct(band, 0.99) < 1.15, 'birds of a flock fly at nearly the same speed');
const demoK = { name: NAME, faces: 1, size: 0, offset: 0, cycle, turn: null, t0: 0, t1: (FR - 1) / fps, dt: 1 / fps,
    radius: Math.round(DC.radiusRef * 100) / 100, cruise: Math.round(cruise) };
const SHAPES = [
    ['Defaults (the simulation)', {}], ['Spread 200', { spread: 200 }], ['Spread 300', { spread: 300 }], ['Spread 50', { spread: 50 }],
    ['Length 250 Width 55', { length: 250, width: 55 }], ['Sky shaped', { length: 250, width: 55, clump: 60 }],
    ['Spread 200 Length 250 Width 55', { spread: 200, length: 250, width: 55 }],
    ['Length 300 Width 30 Angle 90', { length: 300, width: 30, angle: 90 }],
    ['Clumping 150', { clump: 150 }], ['Clumping -90', { clump: -90 }],
];
for (const [label, over] of SHAPES) {
    const ctl = controls(over), extra = [], ratio = [], size = [], elong = [];
    const P = {};
    // Flock Center, frame by frame: its keys, then its own expressions
    const cex = RIG.expressions({ ...demoK, id: 0 }), CF = [];
    for (let f = 0; f < FR; f++) {
        const fx = { Radius: DC.radius[f], 'Axis Sum': keyed(DC.axisX, DC.axisY), 'Radius Sum': radiusSum };
        const center = { pos: [DC.x[f], DC.y[f]], fx };
        fx['Shape Window'] = evalExpr(cex.window, { ctl, center, bird: fx, value: 0, time: f / fps });
        fx['Shape Axis'] = evalExpr(cex.axis, { ctl, center, bird: fx, value: [0, 0], time: f / fps });
        fx['Shape Radius'] = evalExpr(cex.radius, { ctl, center, bird: fx, value: 0, time: f / fps });
        CF.push(center);
    }
    for (let n = 0; n < demo.order.length; n += 4) {
        const i = demo.order[n], b = demo.birds[i];
        const ex = RIG.expressions({ ...demoK, id: n + 1 });
        const bird = { Facing: 1, 'Offset Sum': keyed(b.sumX, b.sumY) };
        P[i] = [];
        for (let f = 0; f < FR; f++) P[i].push(evalExpr(ex.position, { ctl, center: CF[f], bird, value: [b.x[f], b.y[f]], time: f / fps }));
    }
    for (let f = 1; f < FR - 1; f++) {
        // how big and how elongated the shaped flock is (sampled birds, its own principal axes)
        let xx = 0, yy = 0, xy = 0, s0 = 0, n0 = 0;
        for (const i in P) {
            const ox = P[i][f][0] - DC.x[f], oy = P[i][f][1] - DC.y[f], b = demo.birds[i];
            xx += ox * ox; yy += oy * oy; xy += ox * oy; n0++;
            s0 += (b.x[f] - DC.x[f]) ** 2 + (b.y[f] - DC.y[f]) ** 2;
        }
        const tr = (xx + yy) / 2, de = Math.sqrt(((xx - yy) / 2) ** 2 + xy * xy);
        size.push(Math.sqrt((xx + yy) / s0));
        elong.push(Math.sqrt((tr + de) / Math.max(1e-9, tr - de)));
        let mean = 0;
        for (const b of demo.birds) mean += Math.hypot(b.x[f + 1] - b.x[f - 1], b.y[f + 1] - b.y[f - 1]) * fps / 2 / demo.birds.length;
        for (const i in P) {
            const b = demo.birds[i], p = P[i];
            const vx = (p[f + 1][0] - p[f - 1][0]) * fps / 2, vy = (p[f + 1][1] - p[f - 1][1]) * fps / 2;
            const sx = (b.x[f + 1] - b.x[f - 1]) * fps / 2, sy = (b.y[f + 1] - b.y[f - 1]) * fps / 2;
            extra.push(Math.hypot(vx - sx, vy - sy) / cruise);
            ratio.push(Math.hypot(vx, vy) / mean);
        }
    }
    console.log(`${label.padEnd(31)} speed added by the shape: p99 ${pct(extra, 0.99).toFixed(2)}, max ${pct(extra, 1).toFixed(2)} × cruise; bird / flock speed p99 ${pct(ratio, 0.99).toFixed(2)}, max ${pct(ratio, 1).toFixed(2)} | size ×${pct(size, 0.5).toFixed(2)}, elongation ${pct(elong, 0.5).toFixed(2)}`);
    ok(pct(extra, 0.99) <= SHAPE_BUDGET, `${label}: the shape adds less than its budget to a bird's speed`);
    ok(pct(ratio, 1) < 1.8, `${label}: no bird flies far faster than the flock`);
}

console.log(`${checks - fails}/${checks} checks passed`);
process.exit(fails ? 1 : 0);
