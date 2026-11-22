// test.mjs - checks morph-math.js in Node, on the demo's keys and on random paths:
//   node sandbox/2026-11-21-ae-morph-fixer/test.mjs
// Every key keeps its exact shape (each sample of the fixed path projected onto the original
// curve, and back), every key ends with the same number of points and the same direction, a
// second run changes nothing, and the morph travels less.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const load = (f, name) => new Function(fs.readFileSync(path.join(dir, f), 'utf8') + `\nreturn ${name};`)();
const MF = load('morph-math.js', 'MF');
const MD = load('demo-spec.js', 'MD');

let fails = 0, checks = 0;
function check(what, ok, detail) {
    checks++;
    if (!ok) {
        fails++;
        if (fails < 25) console.log(`FAIL ${what}${detail !== undefined ? ' · ' + detail : ''}`);
    }
}

function same(A, B) {
    if (A.v.length !== B.v.length || A.closed !== B.closed) return Infinity;
    let d = 0;
    for (let k = 0; k < A.v.length; k++)
        for (const key of ['v', 'i', 'o'])
            for (let c = 0; c < 2; c++) d = Math.max(d, Math.abs(A[key][k][c] - B[key][k][c]));
    return d;
}

// brute force, for confirming a failure that MF.deviation reports: B's samples against 2000
// samples per segment of A, then a golden-section refinement around the best one
function brute(A, B) {
    const segs = [], dense = [];
    for (let k = 0; k < MF.segCount(A); k++) {
        const c = MF.seg(A, k);
        segs.push(c);
        for (let j = 0; j <= 2000; j++) dense.push({ k, t: j / 2000, p: MF.bez(c, j / 2000) });
    }
    const d2 = (c, t, q) => {
        const p = MF.bez(c, Math.max(0, Math.min(1, t)));
        return (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2;
    };
    let worst = 0;
    for (let k = 0; k < MF.segCount(B); k++) {
        const c = MF.seg(B, k);
        for (let j = 0; j <= 16; j++) {
            const q = MF.bez(c, j / 16);
            let best = null;
            for (const s of dense) {
                const d = (s.p[0] - q[0]) ** 2 + (s.p[1] - q[1]) ** 2;
                if (!best || d < best.d) best = { d, s };
            }
            let lo = best.s.t - 1 / 2000, hi = best.s.t + 1 / 2000;
            for (let it = 0; it < 50; it++) {
                const m1 = lo + (hi - lo) / 3, m2 = hi - (hi - lo) / 3;
                if (d2(segs[best.s.k], m1, q) < d2(segs[best.s.k], m2, q)) hi = m2;
                else lo = m1;
            }
            worst = Math.max(worst, Math.sqrt(Math.min(best.d, d2(segs[best.s.k], (lo + hi) / 2, q))));
        }
    }
    return worst;
}

// the angle (deg) between a point's in handle and its out handle reversed: 0 = smooth
function kink(P, j) {
    const a = P.i[j], b = P.o[j], la = Math.hypot(a[0], a[1]), lb = Math.hypot(b[0], b[1]);
    if (la < 1e-9 || lb < 1e-9) return null;
    return Math.acos(Math.max(-1, Math.min(1, -(a[0] * b[0] + a[1] * b[1]) / (la * lb)))) * 180 / Math.PI;
}

let worstKink = 0, fellBack = 0;
function verify(label, keys, opt) {
    const t0 = process.hrtime.bigint();
    const r = MF.fix(keys, opt);
    const exact = (opt && opt.mode === 'exact') || r.fellBack, tol = exact ? 0.01 : ((opt && opt.tolerance) || 0.1) + 0.005;
    if (r.fellBack) fellBack++;
    const ms = Number(process.hrtime.bigint() - t0) / 1e6;
    const n = r.paths[0].v.length;
    let worstShape = 0, sign = 0;
    if (keys[0].closed) for (const P of r.paths) if (!sign) sign = MF.winding(P);
    for (let k = 0; k < keys.length; k++) {
        const P = r.paths[k];
        check(`${label}: key ${k} has ${n} points`, P.v.length === n, P.v.length);
        // exact: the operations are exact splits (0.01 px = the measure's own limit on cusps);
        // smooth: the rebuilt key stays within the tolerance
        let dev = Math.max(MF.deviation(keys[k], P), MF.deviation(P, keys[k]));
        // MF.deviation can overshoot near cusps of wild random curves: confirm by brute force
        if (dev >= tol) dev = Math.max(brute(keys[k], P), brute(P, keys[k]));
        worstShape = Math.max(worstShape, dev);
        check(`${label}: key ${k} keeps its shape within ${tol.toFixed(3)} px`, dev < tol, dev);
        if (dev >= tol && process.env.DUMP) fs.writeFileSync(path.join(dir, 'out', `fail-${label.replace(/\W+/g, '-')}.json`), JSON.stringify({ keys, opt, k, dev, fellBack: r.fellBack, mode: r.mode }));
        const w = keys[0].closed ? MF.winding(P) : 0;
        if (w && sign && (!opt || opt.direction !== false)) check(`${label}: key ${k} drawn in the reference direction`, w === sign);
        if (opt && opt.minPoints) check(`${label}: at least ${opt.minPoints} points`, P.v.length >= opt.minPoints, P.v.length);
        if (!exact && !r.matched) {
            // every corner of the original is still a point, exactly where it was
            const cs = MF.corners(keys[k], MF.measure(keys[k]));
            let missing = 0;
            for (const c of cs) {
                const q = keys[k].v[c.k];
                if (!P.v.some((p) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 1e-9)) missing++;
            }
            check(`${label}: key ${k} keeps its ${cs.length} corners`, missing === 0, `${missing} missing`);
        }
    }
    // smooth: halfway through each morph, points smooth in both keys stay smooth
    if (!exact && !r.matched) {
        for (let k = 1; k < keys.length; k++) {
            if (keys[k] === keys[k - 1]) continue;
            const A = r.paths[k - 1], B = r.paths[k], H = MF.lerp(A, B, 0.5);
            for (let j = 0; j < H.v.length; j++) {
                const ka = kink(A, j), kb = kink(B, j), kh = kink(H, j);
                if (ka === null || kb === null || kh === null || ka > 0.5 || kb > 0.5) continue;
                worstKink = Math.max(worstKink, kh);
                if (kh > 1) check(`${label}: morph ${k} point ${j} smooth halfway`, false, `${kh.toFixed(2)} deg`);
            }
        }
    }
    // a second run changes nothing
    const again = MF.fix(r.paths, opt);
    let drift = 0;
    for (let k = 0; k < keys.length; k++) drift = Math.max(drift, same(r.paths[k], again.paths[k]));
    check(`${label}: a second run changes nothing`, drift < 1e-9, drift);
    if (drift >= 1e-9 && process.env.DUMP) fs.writeFileSync(path.join(dir, 'out', 'fail-rerun-' + label.replace(/[^a-z0-9]+/gi, '-') + '.json'), JSON.stringify({ keys, opt }));
    return { r, ms, worstShape, n };
}

// ---- the demo ---------------------------------------------------------------------------
{
    const keys = MD.keys.map(([, s]) => MD.shapes[s]);
    const ex = verify('demo exact', keys, { mode: 'exact' });
    console.log(`demo, exact: points ${keys.map((k) => k.v.length).join('/')} -> ${ex.n} each, ${ex.ms.toFixed(0)} ms, worst shape change ${ex.worstShape.toExponential(1)} px`);
    const { r, ms, worstShape, n } = verify('demo', keys, { minPoints: MD.minPoints });
    console.log(`demo, smooth: -> ${n} each, ${ms.toFixed(0)} ms, worst shape change ${worstShape.toFixed(3)} px (tolerance 0.1)`);
    for (let k = 1; k < keys.length; k++) {
        const K = r.keys[k];
        if (MD.keys[k][1] === MD.keys[k - 1][1]) {
            check(`demo: hold ${k} stays still`, K.after < 1e-6, K.after);
            continue;
        }
        console.log(`  key ${k}: ${K.reversed ? 'reversed, ' : ''}${K.moved ? 'start moved, ' : ''}+${K.added} points · travel ${K.before.toFixed(1)} -> ${K.after.toFixed(1)} px`);
        check(`demo: key ${k} travels less`, K.after <= K.before + 1e-9, `${K.before} -> ${K.after}`);
    }
    // the star and the heart are drawn the other way round: both must be reversed
    check('demo: star reversed', r.keys[2].reversed);
    check('demo: heart reversed', r.keys[6].reversed);
}

// ---- random paths -------------------------------------------------------------------------
let seed = 4242;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
function randomPath(closed) {
    const n = 2 + Math.floor(rnd() * (closed ? 10 : 7)), cx = rnd() * 1500, cy = rnd() * 900, R = 40 + rnd() * 300;
    const P = { v: [], i: [], o: [], closed };
    const dir = rnd() < 0.5 ? 1 : -1, a0 = rnd() * Math.PI * 2;
    for (let k = 0; k < n; k++) {
        const a = a0 + dir * (k / n) * Math.PI * 2 * (closed ? 1 : 0.8), rr = R * (0.5 + rnd() * 0.7);
        P.v.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
        const smooth = rnd() < 0.6, t = (rnd() * 0.5) * R;
        const tx = -Math.sin(a) * dir * t, ty = Math.cos(a) * dir * t;
        P.i.push(smooth ? [-tx, -ty] : [0, 0]);
        P.o.push(smooth ? [tx, ty] : [0, 0]);
    }
    if (rnd() < 0.15 && n > 2) {                  // a duplicated vertex (zero-length segment)
        P.v.splice(1, 0, P.v[1].slice());
        P.i.splice(1, 0, [0, 0]);
        P.o.splice(1, 0, [0, 0]);
    }
    return P;
}
let worstRandom = 0, slowest = 0, maxPts = 0;
const TRIALS = 360;
for (let trial = 0; trial < TRIALS; trial++) {
    const closed = rnd() < 0.75, nk = 2 + Math.floor(rnd() * 4), keys = [];
    for (let k = 0; k < nk; k++) keys.push(rnd() < 0.1 && k ? keys[k - 1] : randomPath(closed));
    // every 6th trial rebuilds (the full deviation measure on hundreds of points is slow)
    const opt = trial % 6 === 0 ? { minPoints: rnd() < 0.3 ? 40 : 0 } : { mode: 'exact', minPoints: rnd() < 0.2 ? 12 + Math.floor(rnd() * 30) : 0 };
    const { ms, worstShape, n } = verify(`random ${trial}`, keys, opt);
    worstRandom = Math.max(worstRandom, worstShape);
    slowest = Math.max(slowest, ms);
    maxPts = Math.max(maxPts, n);
}
console.log(`${TRIALS} random morphs (1 in 6 rebuilt): worst shape change ${worstRandom.toFixed(4)} px, slowest fix ${slowest.toFixed(0)} ms (Node), up to ${maxPts} points; worst halfway kink at points smooth in both keys ${worstKink.toFixed(3)} deg; ${fellBack} rebuild(s) fell back to keeping the points`);

// options off: no reversal, no start move
{
    const keys = [MD.shapes[0], MD.shapes[1]];
    const r = MF.fix(keys, { mode: 'exact', start: false, direction: false });
    check('options off: not reversed', !r.keys[1].reversed);
    check('options off: start kept', !r.keys[1].moved);
    check('options off: still same count', r.paths[0].v.length === r.paths[1].v.length);
}
// open and closed keys can't be mixed
{
    let threw = false;
    try {
        MF.fix([MD.shapes[0], Object.assign({}, MD.shapes[1], { closed: false })]);
    } catch (e) {
        threw = /open/.test(e.message);
    }
    check('mixed open/closed keys refused', threw);
}

// ---- the After Effects half, against a mock path property ---------------------------------
{
    class Shape {
        constructor() {
            this.vertices = [];
            this.inTangents = [];
            this.outTangents = [];
            this.closed = true;
        }
    }
    const env = {
        $: { global: { MORPH_NO_UI: true } },
        Shape,
        PropertyType: { PROPERTY: 6212, INDEXED_GROUP: 6213, NAMED_GROUP: 6214 },
        PropertyValueType: { SHAPE: 6419 },
    };
    const src = fs.readFileSync(path.join(dir, 'MorphFixer.jsx'), 'utf8');
    new Function(...Object.keys(env), src)(...Object.values(env));
    const FX = env.$.global.MorphFixer;
    const toShape = (P) => Object.assign(new Shape(), { vertices: P.v, inTangents: P.i, outTangents: P.o, closed: P.closed });
    function mockPath(keys, extra = {}) {
        const layer = { name: 'Shape Layer 1', index: 1 };
        const prop = {
            name: 'Path', matchName: 'ADBE Vector Shape', propertyType: 6212, propertyValueType: 6419, propertyDepth: 1,
            expression: '', expressionEnabled: true, selectedKeys: [], numKeys: keys.length,
            values: keys.map(toShape), times: keys.map((_, k) => k * 0.5),
            keyValue(k) { return this.values[k - 1]; },
            setValueAtKey(k, s) { this.values[k - 1] = s; },
            propertyGroup() { return layer; },
            parentProperty: null,
            ...extra,
        };
        return prop;
    }
    const keys = MD.keys.map(([, s]) => MD.shapes[s]);
    let p = mockPath(keys);
    let rep = FX.fix(p);
    check('AE half: all keys fixed', rep.keys === keys.length && rep.to >= 40, FX.summary(rep));
    check('AE half: every key written with the same points', p.values.every((s) => s.vertices.length === rep.to));
    console.log('AE half report: ' + FX.summary(rep));
    p = mockPath(keys, { selectedKeys: [3, 4, 5] });
    rep = FX.fix(p);
    check('AE half: only the selected keys', rep.keys === 3 && p.values[0].vertices.length === 4 && p.values[2].vertices.length === p.values[4].vertices.length, FX.summary(rep));
    p = mockPath(keys, { expression: 'wiggle(1,1)' });
    rep = FX.fix(p);
    check('AE half: a path with an expression is skipped', !!rep.skipped && p.values[2].vertices.length === 10, FX.summary(rep));
    p = mockPath(keys);
    p.values[1].featherSegLocs = [1];
    rep = FX.fix(p);
    check('AE half: a mask with feather points is skipped', /feather/.test(rep.skipped || ''), FX.summary(rep));
    p = mockPath([MD.shapes[0], Object.assign({}, MD.shapes[1], { closed: false })]);
    rep = FX.fix(p);
    check('AE half: mixed open/closed keys are skipped', /open/.test(rep.skipped || ''), FX.summary(rep));
}

// ---- the keys After Effects stored (written by make-demo.jsx in test mode), if present ----
{
    const f = path.join(dir, 'out', 'ae', 'ae-keys.txt');
    if (fs.existsSync(f)) {
        // the file holds AE's inputs (the Before keys) then its outputs (the After keys)
        const rows = fs.readFileSync(f, 'utf8').trim().split(/\r?\n/).map((l) => new Function('return ' + l)());
        const n = rows.length / 2, input = rows.slice(0, n), ae = rows.slice(n);
        const node = MF.fix(input, { minPoints: MD.minPoints }).paths;
        let worst = 0;
        for (let k = 0; k < node.length; k++) worst = Math.max(worst, same(node[k], ae[k]));
        check('Node, fixing the keys AE held, computes what AE stored (to 32-bit float)', worst < 1e-4, worst);
        console.log(`keys stored by After Effects vs Node on the same inputs: largest difference ${worst.toExponential(1)} px over ${ae.length} keys of ${ae[0].v.length} points`);
    }
}

console.log(fails ? `${fails} of ${checks} checks FAILED` : `all ${checks} checks pass`);
process.exit(fails ? 1 : 0);
