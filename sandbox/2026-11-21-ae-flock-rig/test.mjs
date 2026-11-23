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
const M = new Function(RIG.math + '\nreturn { flockShape, flockFacing, flockSize, flockScale, flockOrient, flockCycle };')();
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

// ---- a mock of AE: like AE, effect("X")(1) and transform.x are Property objects, not
// numbers (arithmetic converts them, === does not); .value gives the number.
const prop = (v) => (Array.isArray(v) ? Object.assign([...v], { value: [...v] }) : { value: v, valueOf: () => v });
function layer(effects, position) {
    return {
        effect: (n) => {
            if (!(n in effects)) throw new Error(`no effect "${n}"`);
            return () => prop(effects[n]);
        },
        transform: { position: prop(position || [0, 0]) },
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
function evalExpr(code, { ctl, center, bird, value, time = 1 }) {
    let seed = 0, timeless = false, n = 0;
    const rnd = () => {
        const x = Math.sin(seed * 12.9898 + (timeless ? 0 : time * 78.233) + ++n * 37.719) * 43758.5453;
        return x - Math.floor(x);
    };
    const ctx = {
        value: prop(value).value ?? value,
        time,
        thisComp: { layer: (n) => (n === NAME + ' Controls' ? layer(ctl) : n === NAME + ' Center' ? layer(center.fx, center.pos) : null) },
        effect: (n) => () => prop(bird[n]),
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
for (const hasTurn of [false, true]) {
    const k = { name: NAME, id: 7, faces: 1, size: -0.37, offset: 0.62, cycle, turn: hasTurn ? turn : null };
    const ex = RIG.expressions(k);
    for (let t = 0; t < 300; t++) {
        const r = (a, b) => a + (b - a) * ((Math.sin(t * 91.7 + a * 3.1 + b) + 1) / 2);
        const over = {
            spread: r(20, 200), length: r(20, 300), width: r(20, 300), angle: r(-180, 180), clump: r(-90, 150),
            scatter: t % 3 ? 0 : r(0, 40), scatterSpeed: t % 2 ? 0 : r(0.1, 3), scatterSeed: Math.round(r(1, 9)),
            size: r(30, 200), sizeVar: r(0, 60), persp: r(0, 150), orient: r(0, 100),
            turnWidth: r(0, 100), headOn: r(0, 100), flapSpeed: r(20, 200), desync: r(0, 100),
        };
        const ctl = controls(over);
        const center = { pos: [r(0, 1920), r(0, 1080)], fx: { Radius: r(40, 300), Heading: r(-400, 400) } };
        const bird = { Facing: r(-1, 1), 'Flap Phase': r(0, 30) };
        const pos = [r(0, 1920), r(0, 1080)], depth = r(25, 300);
        const env = { ctl, center, bird };

        // position: shape (scatter off for the exact comparison)
        if (!over.scatter) {
            const o = M.flockShape(pos[0] - center.pos[0], pos[1] - center.pos[1], center.fx.Radius, center.fx.Heading,
                over.spread, over.length, over.width, over.angle, over.clump);
            ok(near(evalExpr(ex.position, { ...env, value: pos }), [center.pos[0] + o[0], center.pos[1] + o[1]], 1e-6), `position ${t}`);
        } else {
            const a = evalExpr(ex.position, { ...env, value: pos, time: 1 }), b = evalExpr(ex.position, { ...env, value: pos, time: 2 });
            if (over.scatterSpeed === 0) ok(near(a, b, 1e-9), `still scatter must not move (${t})`);
            const o = M.flockShape(pos[0] - center.pos[0], pos[1] - center.pos[1], center.fx.Radius, center.fx.Heading,
                over.spread, over.length, over.width, over.angle, over.clump);
            const d = Math.hypot(a[0] - center.pos[0] - o[0], a[1] - center.pos[1] - o[1]);
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
const S = (ox, oy, o) => M.flockShape(ox, oy, o.R ?? 100, o.hd ?? 0, o.spread ?? 100, o.len ?? 100, o.wid ?? 100, o.ang ?? 0, o.clump ?? 0);
ok(near(S(10, 5, {}), [10, 5]), 'defaults leave the flock as simulated');
ok(near(S(10, 5, { len: 200 }), [20, 5]), 'Length stretches along the heading');
ok(near(S(10, 5, { len: 200, hd: 90 }), [10, 10]), 'Length follows the heading (90°: along y)');
ok(near(S(10, 5, { wid: 50 }), [10, 2.5]), 'Width squeezes across the heading');
ok(near(S(10, 5, { len: 200, ang: 90 }), [10, 10]), 'Shape Angle turns the stretch axis');
ok(near(S(50, 0, { clump: 100 }), [25, 0]), 'Clumping pulls the core in');
ok(near(S(200, 0, { clump: 100 }), [400, 0]), 'Clumping pushes stragglers out');
ok(near(S(500, 0, { clump: 100 }), [1500, 0]), 'Clumping is capped at 3× for far stragglers');
ok(near(S(50, 0, { clump: -50 }), [50 * Math.pow(0.5, -0.5), 0]), 'negative Clumping evens out');
ok(near(S(10, 5, { spread: 50 }), [5, 2.5]), 'Spread scales the whole flock');
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

console.log(`${checks - fails}/${checks} checks passed`);
process.exit(fails ? 1 : 0);
