// check-ae.mjs · compares what After Effects baked and computed with Node running the same
// code. make-demo.jsx (test mode) writes ae-dump.json: the leader as AE sampled it, and for a
// few comps every bird's baked and final position and running sums. Here:
//   1. the simulation, run in Node on that leader, against AE's baked keys;
//   2. the position expression's math (flock-math.js, as Flock.jsx carries it), run in Node
//      on AE's own baked keys, against AE's final positions.
// Plausible numbers are not enough: a misread ?: once baked a different flock in AE for two
// rounds while every check inside AE passed.
//
//   node sandbox/2026-11-21-ae-flock-rig/check-ae.mjs sandbox/2026-11-21-ae-flock-rig/out/ae-test-r3
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = process.argv[2];
if (!out) throw new Error('usage: node check-ae.mjs <the test output folder>');
const D = JSON.parse(fs.readFileSync(path.join(out, 'ae-dump.json'), 'utf8'));
const $ = { global: { FLOCK_NO_UI: true } };
new Function('$', fs.readFileSync(path.join(dir, 'Flock.jsx'), 'utf8'))($);
const RIG = $.global.FlockRig;
const M = new Function(RIG.math + '\nreturn { flockShape, flockWindow, flockMean };')();
const FlockSim = new Function(fs.readFileSync(path.join(dir, 'flock-sim.js'), 'utf8') + '\nreturn FlockSim;')();

let fails = 0;
const report = (what, err, limit, unit) => {
    const pass = err <= limit;
    if (!pass) fails++;
    console.log(`${pass ? 'ok  ' : 'FAIL'} ${what}: max ${err.toPrecision(3)} ${unit} (limit ${limit})`);
};
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

// ---- 1. the simulation, as make-demo.jsx builds it ----------------------------------------
const fps = 24, F = 192;
const sim = FlockSim.run({
    leaderX: D.leader.map((p) => p[0]), leaderY: D.leader.map((p) => p[1]), frames: F, lead: 0.4, fps,
    count: 80, spacing: 45, follow: 50, turbulence: 40, glide: 50, seed: 7, preroll: 3, faces: 1, cycle: 0.5,
});
const sky = D.comps[0];
let ePos = 0, eSum = 0, eC = 0, eR = 0, eA = 0;
sky.birds.forEach((b, n) => {
    const s = sim.birds[sim.order[n]];
    for (let f = 0; f < F; f++) {
        ePos = Math.max(ePos, dist(b.pre[f], [s.x[f], s.y[f]]));
        eSum = Math.max(eSum, dist(b.sum[f], [s.sumX[f], s.sumY[f]]));
    }
});
for (let f = 0; f < F; f++) {
    eC = Math.max(eC, dist(sky.center[f], [sim.center.x[f], sim.center.y[f]]));
    eR = Math.max(eR, Math.abs(sky.radiusSum[f] - sim.center.radiusSum[f]));
    eA = Math.max(eA, dist(sky.axisSum[f], [sim.center.axisX[f], sim.center.axisY[f]]));
}
console.log(`simulation (${sky.birds.length} birds × ${F} frames, Node on the leader AE sampled):`);
report('bird positions', ePos, 0.5, 'px');
report('flock centre', eC, 0.5, 'px');
report('offset running sums', eSum, 0.5, 'px·s');
report('radius running sum', eR, 0.5, 'px·s');
report('axis running sum', eA, 0.01, 's');

// ---- 2. the position expression, on AE's own keys ------------------------------------------
const KEY = {};
for (const c of RIG.controls) KEY[c.name] = c.key;
for (const C of D.comps) {
    const ctl = {};
    for (const n in C.controls) ctl[KEY[n]] = C.controls[n];
    // the constants the build wrote into the expressions
    const win = C.windowExpression.match(/Math\.max\(([^,]+), flockWindow\(.*, ([^,]+), ([^,)]+)\)\);/);
    const tm = C.expression.match(/time, W, ([^,]+), ([^,]+), ([^)]+)\)/);
    if (!win || !tm) throw new Error(`${C.name}: the expressions have changed shape; update check-ae.mjs`);
    const [minW, radius, budget] = win.slice(1).map(Number), [t0, t1, dt] = tm.slice(1).map(Number);
    // AE's keys are one a frame; between them read linearly, as the sliders do
    const keyed = (V) => (t) => {
        const u = Math.min(F - 1, Math.max(0, (t - t0) * fps)), j = Math.min(F - 2, Math.floor(u)), w = u - j;
        const a = V[j], b = V[j + 1];
        return Array.isArray(a) ? [a[0] + (b[0] - a[0]) * w, a[1] + (b[1] - a[1]) * w] : [a + (b - a) * w, 0];
    };
    const W = Math.max(minW, M.flockWindow(ctl.spread, ctl.length, ctl.width, ctl.clump, radius, budget));
    let err = 0, worst = '', eW = 0, eA = 0, eR = 0;
    const errs = [];
    for (let f = 0; f < F; f++) {
        const t = t0 + f / fps;
        const A = M.flockMean(keyed(C.axisSum), t, W, t0, t1, dt), R = M.flockMean(keyed(C.radiusSum), t, W, t0, t1, dt)[0];
        // Flock Center's own expressions: the window, the mean axis and the mean radius
        const sh = C.shape[f];
        eW = Math.max(eW, Math.abs(sh[0] - W));
        eA = Math.max(eA, dist([sh[1], sh[2]], A));
        eR = Math.max(eR, Math.abs(sh[3] - R));
        for (const b of C.birds) {
            const d = M.flockMean(keyed(b.sum), t, W, t0, t1, dt), m = C.center[f], p = b.pre[f];
            const o = M.flockShape(d[0], d[1], p[0] - m[0], p[1] - m[1], A[0], A[1], R,
                ctl.spread, ctl.length, ctl.width, ctl.angle, ctl.clump);
            const e = dist(b.post[f], [m[0] + o[0], m[1] + o[1]]);
            errs.push(e);
            if (e > err) (err = e), (worst = `${b.name} at frame ${f}`);
        }
    }
    errs.sort((a, b) => a - b);
    console.log(`${C.name} (Spread ${ctl.spread}, Length ${ctl.length}, Width ${ctl.width}, Angle ${ctl.angle}, Clumping ${ctl.clump}; window ${W.toFixed(2)} s): ` +
        `AE vs Node p99 ${errs[Math.floor(errs.length * 0.99)].toPrecision(3)} px, worst ${worst}`);
    report(`${C.name}: shape window`, eW, 1e-6, 's');
    report(`${C.name}: mean axis of travel`, eA, 1e-4, '');
    report(`${C.name}: mean radius`, eR, 0.01, 'px');
    report(`${C.name}: final positions`, err, 0.05, 'px');
}
process.exit(fails ? 1 : 0);
