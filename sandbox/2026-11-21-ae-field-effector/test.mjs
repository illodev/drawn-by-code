// test.mjs - checks the rig outside After Effects. It loads the built FieldEffector.jsx,
// takes the very expression strings it writes, and runs them against a mock of AE's
// expression objects (2D layers with parents, effects, layer controls, keyed sliders),
// then compares them with field-math.js called directly.
//
//   node sandbox/2026-11-21-ae-field-effector/build.mjs && node sandbox/2026-11-21-ae-field-effector/test.mjs
//
// What it proves: every channel reads the same weight; Offset and Push moved into the
// anchor point move the layer by exactly that much in comp space whatever its rotation,
// scale and parent; nothing changes at weight 0; the fields, curves and blends behave.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const $ = { global: { FX_NO_UI: true } };
new Function('$', fs.readFileSync(process.env.FX_JSX || path.join(dir, 'FieldEffector.jsx'), 'utf8'))($);
const FE = $.global.FieldEffector;
const M = new Function(FE.math + '\nreturn { fxField, fxEvaluate, fxAnchorShift, fxNoise, fxCurve };')();
const NAME = 'FX';

// ---- a mock of AE's 2D layers ----------------------------------------------------------
// Like AE, effect("X")(1) and transform.x are Property objects, not numbers: arithmetic
// converts them (valueOf), === and if () don't, .value gives the number. (Round 1 in AE:
// `if (P.invert)` on a Property was always true, which the first mock, handing out bare
// numbers, could not catch.)
const rad = (d) => (d * Math.PI) / 180;
const arr = (v) => {
    const a = Array.from(v);
    a.value = Array.from(v);
    return a;
};
const num = (v) => ({ value: v, valueOf: () => v });
let layerCount = 0;
function layer(name, o) {
    const L = {
        name,
        index: ++layerCount,
        transform: { position: arr(o.position), anchorPoint: arr(o.anchor || [0, 0]), rotation: num(o.rotation || 0), scale: arr(o.scale || [100, 100]) },
        parent: o.parent || null,
        effects: o.effects || {},
    };
    L.hasParent = !!L.parent;
    // layer space -> parent space -> comp
    L.toComp = (pt) => {
        const t = L.transform, c = Math.cos(rad(t.rotation)), s = Math.sin(rad(t.rotation));
        const x = ((pt[0] - t.anchorPoint[0]) * t.scale[0]) / 100, y = ((pt[1] - t.anchorPoint[1]) * t.scale[1]) / 100;
        const p = [t.position[0] + x * c - y * s, t.position[1] + x * s + y * c];
        return L.parent ? L.parent.toComp(p) : p;
    };
    L.fromComp = (pt) => {
        const p = L.parent ? L.parent.fromComp(pt) : pt, t = L.transform;
        const c = Math.cos(rad(t.rotation)), s = Math.sin(rad(t.rotation));
        const x = p[0] - t.position[0], y = p[1] - t.position[1];
        return [t.anchorPoint[0] + ((x * c + y * s) * 100) / t.scale[0], t.anchorPoint[1] + ((-x * s + y * c) * 100) / t.scale[1]];
    };
    L.effect = (n) => {
        if (!(n in L.effects)) throw new Error(`${name}: no effect "${n}"`);
        const v = L.effects[n];
        return () => {
            if (v === null || (v && v.toComp)) return v;                 // a Layer Control gives the layer
            if (v && v.numKeys !== undefined) {                           // a keyed slider
                const p = Object.create(v);
                p.value = v.valueAtTime(0);
                p.valueOf = () => p.value;
                return p;
            }
            return Array.isArray(v) ? arr(v) : num(v);
        };
    };
    return L;
}

// a keyed slider: keys [[t, v], ...], eased like AE's Easy Ease (influence 1/3, speed 0)
function keyed(keys) {
    const ease = (u) => {
        // cubic bezier (1/3, 0) (2/3, 1) solved for x = u
        let a = 0, b = 1;
        for (let i = 0; i < 50; i++) {
            const m = (a + b) / 2, x = 3 * m * (1 - m) * (1 - m) / 3 + 3 * m * m * (1 - m) * 2 / 3 + m * m * m;
            if (x < u) a = m; else b = m;
        }
        const m = (a + b) / 2;
        return 3 * m * m * (1 - m) + m * m * m;
    };
    return {
        numKeys: keys.length,
        key: (i) => ({ time: keys[i - 1][0], value: keys[i - 1][1] }),
        valueAtTime: (t) => {
            if (t <= keys[0][0]) return keys[0][1];
            for (let i = 1; i < keys.length; i++) {
                if (t <= keys[i][0]) {
                    const [t0, v0] = keys[i - 1], [t1, v1] = keys[i];
                    return v0 + (v1 - v0) * ease((t - t0) / (t1 - t0));
                }
            }
            return keys[keys.length - 1][1];
        },
    };
}

function fieldLayer(name, o) {
    const fx = Object.assign({
        Shape: 1, Size: 300, Falloff: 50, Curve: 2, 'Custom Curve': keyed([[0, 0], [1, 100]]), Strength: 100,
        Invert: 0, 'Edge Noise': 0, 'Noise Size': 150, 'Noise Speed': 0.5, Seed: 1, Blend: 1,
    }, o.fx || {});
    return layer(name, { position: o.position, anchor: [50, 50], rotation: o.rotation || 0, scale: o.scale || [100, 100], effects: fx });
}

function effectorLayer(fields, ch) {
    const fx = Object.assign({
        Strength: 100, 'Offset X': 0, 'Offset Y': 0, Push: 0, Scale: 150, Rotation: 0, Opacity: 100, Tint: 0, 'Tint Color': [1, 0.42, 0.16, 1],
    }, ch || {});
    fields.forEach((F, i) => (fx['Field ' + (i + 1)] = F));
    return layer(NAME + ' Effector', { position: [90, 110], anchor: [50, 50], effects: fx });
}

// AE gives the value of the expression's last statement
const run = new Function('__ctx', '__code', 'with (__ctx) { return eval(__code); }');
function evalOn(L, comp, code, value, t) {
    return run({ thisComp: comp, thisLayer: L, transform: L.transform, hasParent: L.hasParent, parent: L.parent, time: t, value, effect: L.effect }, code);
}

// applies the rig's expressions to target T in the order AE resolves them
function evaluate(T, comp, K, t) {
    const pre = { anchor: Array.from(T.transform.anchorPoint), scale: Array.from(T.transform.scale), rotation: +T.transform.rotation, opacity: 100 };
    T.effects[NAME + ' Weight'] = evalOn(T, comp, FE.expr.weight(NAME, K), 0, t);
    const scale = evalOn(T, comp, FE.expr.scale(NAME), pre.scale, t);
    const rotation = evalOn(T, comp, FE.expr.rotation(NAME), pre.rotation, t);
    const opacity = evalOn(T, comp, FE.expr.opacity(NAME), pre.opacity, t);
    const tint = evalOn(T, comp, FE.expr.tintAmount(NAME, 1), 0, t);
    const tintColor = evalOn(T, comp, FE.expr.tintColor(NAME), [0, 0, 0, 1], t);
    const time = evalOn(T, comp, FE.expr.time(NAME, 0, 0.958333, true), 0, t);
    T.transform.scale = arr(scale);
    T.transform.rotation = num(rotation);
    const anchor = evalOn(T, comp, FE.expr.anchor(NAME, K), pre.anchor, t);
    T.transform.anchorPoint = arr(anchor);
    // where the layer's own anchor point ends up on screen = where the layer is drawn
    const drawn = T.toComp(pre.anchor);
    T.transform.anchorPoint = arr(pre.anchor);
    T.transform.scale = arr(pre.scale);
    T.transform.rotation = num(pre.rotation);
    for (const [what, v] of [['weight', T.effects[NAME + ' Weight']], ['rotation', rotation], ['opacity', opacity], ['tint', tint], ['time', time]])
        if (typeof v !== 'number' || !isFinite(v)) throw new Error(`${what} is not a finite number: ${v}`);
    for (const [what, v] of [['scale', scale], ['anchor', anchor], ['tint colour', tintColor]])
        if (!Array.isArray(v) || v.some((x) => typeof x !== 'number' || !isFinite(x))) throw new Error(`${what} is not an array of numbers: ${v}`);
    return { w: T.effects[NAME + ' Weight'], scale, rotation, opacity, tint, tintColor, time, anchor, drawn };
}

// the same thing straight from field-math.js
function expected(T, E, fields, t) {
    const rest = T.parent ? T.parent.toComp(T.transform.position) : T.transform.position;
    const list = fields.map((F) => {
        const A = F.transform.anchorPoint, l = F.fromComp(rest), c = F.toComp(A), x1 = F.toComp([A[0] + 1, A[1]]);
        const al = Math.hypot(x1[0] - c[0], x1[1] - c[1]);
        const P = {
            shape: F.effects.Shape, size: F.effects.Size, falloff: F.effects.Falloff, curve: F.effects.Curve, strength: F.effects.Strength,
            invert: F.effects.Invert, edgeNoise: F.effects['Edge Noise'], noiseSize: F.effects['Noise Size'], noiseSpeed: F.effects['Noise Speed'],
            seed: F.effects.Seed, blend: F.effects.Blend,
        };
        const C = F.effects['Custom Curve'];
        const custom = (u) => (C.valueAtTime(C.key(1).time + u * (C.key(C.numKeys).time - C.key(1).time)) - C.key(1).value) / (C.key(C.numKeys).value - C.key(1).value);
        return { P, lx: l[0] - A[0], ly: l[1] - A[1], cx: c[0], cy: c[1], ax: (x1[0] - c[0]) / al, ay: (x1[1] - c[1]) / al, custom };
    });
    const r = M.fxEvaluate(list, rest[0], rest[1], t);
    const w = (r[0] * E.effects.Strength) / 100;
    const push = E.effects.Push;
    const D = [(E.effects['Offset X'] + push * r[1]) * w, (E.effects['Offset Y'] + push * r[2]) * w];
    return { w: w * 100, rest, D, drawn: [rest[0] + D[0], rest[1] + D[1]] };
}

// ---- checks -----------------------------------------------------------------------------
let fails = 0, checks = 0;
function check(what, ok, detail) {
    checks++;
    if (!ok) {
        fails++;
        console.log(`FAIL ${what}${detail ? ' · ' + detail : ''}`);
    }
}
const near = (a, b, e = 1e-6) => Math.abs(a - b) <= e;

// Park-Miller, for repeatable random scenes
let seed = 12345;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const pick = (a) => a[Math.floor(rnd() * a.length)];

let worstW = 0, worstPos = 0, worstParentPos = 0;
for (let trial = 0; trial < 3000; trial++) {
    const nf = 1 + Math.floor(rnd() * 3), fields = [];
    for (let i = 0; i < nf; i++) {
        fields.push(fieldLayer(`${NAME} Field ${i + 1}`, {
            position: [rnd() * 1920, rnd() * 1080],
            rotation: rnd() < 0.5 ? 0 : rnd() * 360 - 180,
            scale: rnd() < 0.5 ? [100, 100] : [40 + rnd() * 200, 40 + rnd() * 200],
            fx: {
                Shape: 1 + Math.floor(rnd() * 4), Size: 50 + rnd() * 500, Falloff: pick([0, 25, 50, 100, rnd() * 100]),
                Curve: 1 + Math.floor(rnd() * 5), Strength: pick([100, 50, 140]), Invert: rnd() < 0.2 ? 1 : 0,
                'Edge Noise': rnd() < 0.3 ? rnd() * 80 : 0, Seed: Math.floor(rnd() * 9), Blend: 1 + Math.floor(rnd() * 5),
                'Custom Curve': keyed([[0.5, 0], [0.9, 120], [1.5, 100]]),
            },
        }));
    }
    const E = effectorLayer(fields, {
        Strength: pick([100, 60]), 'Offset X': rnd() * 200 - 100, 'Offset Y': rnd() * 200 - 100, Push: pick([0, 80, -40]),
        Scale: pick([150, 60, 0.5]), Rotation: pick([0, 90, -30]), Opacity: pick([100, 0, 40]),
    });
    const parented = rnd() < 0.4;
    const P = parented ? layer('Group', { position: [rnd() * 1920, rnd() * 1080], anchor: [rnd() * 100, rnd() * 100], rotation: rnd() * 360, scale: [30 + rnd() * 150, 30 + rnd() * 150] }) : null;
    const T = layer('Tile', {
        position: [rnd() * 1920, rnd() * 1080], anchor: [rnd() * 80 - 40, rnd() * 80 - 40], rotation: rnd() * 360 - 180,
        scale: [20 + rnd() * 200, 20 + rnd() * 200], parent: P, effects: {},
    });
    const byName = { [E.name]: E };
    const comp = { layer: (n) => { if (!byName[n]) throw new Error('no layer ' + n); return byName[n]; } };
    const t = rnd() * 6;
    const got = evaluate(T, comp, nf, t), want = expected(T, E, fields, t);
    worstW = Math.max(worstW, Math.abs(got.w - want.w));
    const dp = Math.hypot(got.drawn[0] - want.drawn[0], got.drawn[1] - want.drawn[1]);
    if (parented) worstParentPos = Math.max(worstParentPos, dp);
    else worstPos = Math.max(worstPos, dp);
    check(`trial ${trial}: weight`, near(got.w, want.w, 1e-9), `${got.w} vs ${want.w}`);
    check(`trial ${trial}: drawn position`, dp < 1e-6, `off by ${dp.toExponential(2)} px (parent ${parented})`);
    const w = got.w / 100;
    check(`trial ${trial}: scale`, near(got.scale[0], T.transform.scale[0] * (1 + (E.effects.Scale / 100 - 1) * w), 1e-9));
    check(`trial ${trial}: rotation`, near(got.rotation, T.transform.rotation + E.effects.Rotation * w, 1e-9));
    check(`trial ${trial}: time`, got.time >= 0 && got.time <= 0.958333 + 1e-12);
}

// neutral: a field far away changes nothing, to the bit
{
    const F = fieldLayer(`${NAME} Field 1`, { position: [-5000, -5000], fx: { Size: 100 } });
    const E = effectorLayer([F], { 'Offset X': 50, Push: 30, Scale: 200, Rotation: 45, Opacity: 0, Tint: 100 });
    const T = layer('Tile', { position: [800, 500], anchor: [12, -7], rotation: 33, scale: [80, 120], effects: {} });
    const comp = { layer: (n) => E };
    const got = evaluate(T, comp, 1, 1);
    check('neutral: weight 0', got.w === 0);
    check('neutral: anchor unchanged', got.anchor[0] === 12 && got.anchor[1] === -7, String(got.anchor));
    check('neutral: scale unchanged', got.scale[0] === 80 && got.scale[1] === 120);
    check('neutral: rotation unchanged', got.rotation === 33);
    check('neutral: opacity unchanged', got.opacity === 100);
    check('neutral: tint 0', got.tint === 0);
}

// inside a sphere at full weight: the whole channel set, by hand
{
    const F = fieldLayer(`${NAME} Field 1`, { position: [1000, 500], fx: { Size: 300, Falloff: 50, Curve: 1 } });
    const E = effectorLayer([F], { 'Offset Y': -40, Push: 0, Scale: 150, Rotation: 90, Opacity: 50, Tint: 80 });
    const T = layer('Tile', { position: [1050, 500], effects: {} });
    const got = evaluate(T, { layer: () => E }, 1, 0);
    check('full: weight 100 inside the full radius', near(got.w, 100), String(got.w));
    check('full: scale 150', near(got.scale[0], 150));
    check('full: rotation 90', near(got.rotation, 90));
    check('full: opacity 50', near(got.opacity, 50));
    check('full: tint 0.8', near(got.tint, 0.8));
    check('full: lifted 40 px', near(got.drawn[0], 1050, 1e-9) && near(got.drawn[1], 460, 1e-9), String(got.drawn));
    // halfway down the falloff ring (150 ... 300 px): linear 0.5
    T.transform.position = arr([1000 + 225, 500]);
    check('ramp: linear falloff halfway = 50', near(evaluate(T, { layer: () => E }, 1, 0).w, 50));
}

// push points away from a sphere's centre and along a linear field's X axis
{
    const F = fieldLayer(`${NAME} Field 1`, { position: [1000, 500], fx: { Size: 400, Falloff: 100, Curve: 1 } });
    const E = effectorLayer([F], { Push: 100, Scale: 100 });
    const T = layer('Tile', { position: [1000 + 100, 500 - 100], effects: {} });
    const got = evaluate(T, { layer: () => E }, 1, 0);
    const d = [got.drawn[0] - 1100, got.drawn[1] - 400];
    check('push: away from the centre', d[0] > 0 && d[1] < 0 && near(d[0], -d[1], 1e-6), String(d));
    const L = fieldLayer(`${NAME} Field 1`, { position: [1000, 500], rotation: 90, fx: { Shape: 3, Size: 200, Falloff: 100, Curve: 1 } });
    const E2 = effectorLayer([L], { Push: 100, Scale: 100 });
    // rotated 90 deg: the field's +X points down the screen; "inside" is above the null
    const T2 = layer('Tile', { position: [1000, 400], effects: {} });
    const g2 = evaluate(T2, { layer: () => E2 }, 1, 0);
    check('linear: weight 0.5 halfway into the ramp', near(g2.w, 50), String(g2.w));
    check('linear: push along the field X axis (down)', near(g2.drawn[0], 1000, 1e-6) && g2.drawn[1] > 400, String(g2.drawn));
}

// blends, invert, custom curve with overshoot, the effector's master strength
{
    const A = fieldLayer(`${NAME} Field 1`, { position: [0, 0], fx: { Size: 100, Falloff: 0 } });     // 1 at the origin
    const B = fieldLayer(`${NAME} Field 2`, { position: [0, 0], fx: { Size: 100, Falloff: 0, Strength: 30, Blend: 3 } });
    const T = layer('Tile', { position: [0, 0], effects: {} });
    let E = effectorLayer([A, B]);
    check('blend: subtract', near(evaluate(T, { layer: () => E }, 2, 0).w, 70));
    B.effects.Blend = 4;
    check('blend: multiply', near(evaluate(T, { layer: () => E }, 2, 0).w, 30));
    B.effects.Blend = 2;
    check('blend: add goes past 100', near(evaluate(T, { layer: () => E }, 2, 0).w, 130));
    B.effects.Blend = 5;
    check('blend: min', near(evaluate(T, { layer: () => E }, 2, 0).w, 30));
    A.effects.Invert = 1;
    B.effects.Blend = 1;
    check('invert + max', near(evaluate(T, { layer: () => E }, 2, 0).w, 30));
    E = effectorLayer([A], { Strength: 50 });
    A.effects.Invert = 0;
    check('effector strength', near(evaluate(T, { layer: () => E }, 1, 0).w, 50));
    const C = fieldLayer(`${NAME} Field 1`, { position: [0, 0], fx: { Size: 200, Falloff: 100, Curve: 5, 'Custom Curve': keyed([[2, 0], [2.6, 115], [3, 100]]) } });
    E = effectorLayer([C]);
    let peak = 0;
    for (let x = 0; x <= 200; x += 2) {
        T.transform.position = arr([x, 0]);
        peak = Math.max(peak, evaluate(T, { layer: () => E }, 1, 0).w);
    }
    check('custom curve overshoots past 100', peak > 110, String(peak));
    // a Layer Control left on None (the field null deleted) is skipped, not an error
    const E3 = effectorLayer([]);
    E3.effects['Field 1'] = null;
    check('deleted field: weight 0, no error', evaluate(T, { layer: () => E3 }, 1, 0).w === 0);
    // AE re-aims a Layer Control when its layer is deleted: at a layer that is not a field
    // (skipped), or at a field already counted (counted once)
    const A1 = fieldLayer(`${NAME} Field 1`, { position: [0, 0], fx: { Size: 100, Falloff: 0, Strength: 40, Blend: 2 } });
    const E4 = effectorLayer([A1]);
    E4.effects['Field 2'] = layer('Tile 9', { position: [0, 0], effects: {} });
    T.transform.position = arr([0, 0]);
    check('re-aimed at a non-field layer: skipped', near(evaluate(T, { layer: () => E4 }, 2, 0).w, 40));
    E4.effects['Field 2'] = A1;
    check('re-aimed at a field already counted: counted once', near(evaluate(T, { layer: () => E4 }, 2, 0).w, 40));
    // a checkbox or menu left at 0 / 1 must read as off / its item, not as "a Property object"
    A1.effects.Invert = 0;
    A1.effects.Shape = 1;
    check('Invert 0 reads as off', near(evaluate(T, { layer: () => effectorLayer([A1]) }, 1, 0).w, 40));
}

// noise: in range, centred, repeatable, moves with time
{
    let lo = 1, hi = -1, sum = 0, n = 0;
    for (let i = 0; i < 20000; i++) {
        const v = M.fxNoise(rnd() * 50 - 25, rnd() * 50 - 25, rnd() * 50);
        lo = Math.min(lo, v);
        hi = Math.max(hi, v);
        sum += v;
        n++;
    }
    check('noise: within -1 ... 1', lo >= -1 && hi < 1, `${lo} ${hi}`);
    check('noise: centred', Math.abs(sum / n) < 0.03, String(sum / n));
    check('noise: repeatable', M.fxNoise(1.3, -2.7, 0.4) === M.fxNoise(1.3, -2.7, 0.4));
    check('noise: continuous', Math.abs(M.fxNoise(1.3, 2.7, 0.4) - M.fxNoise(1.3001, 2.7, 0.4)) < 0.01);
}

// cost of one weight expression (Node; AE's engine is slower, this only tracks regressions)
{
    const fields = [fieldLayer(`${NAME} Field 1`, { position: [900, 500] }), fieldLayer(`${NAME} Field 2`, { position: [300, 500], fx: { Shape: 4, Blend: 2 } })];
    const E = effectorLayer(fields), T = layer('Tile', { position: [700, 450], effects: {} });
    const code = FE.expr.weight(NAME, 2), t0 = process.hrtime.bigint();
    for (let i = 0; i < 2000; i++) evalOn(T, { layer: () => E }, code, 0, i / 24);
    const us = Number(process.hrtime.bigint() - t0) / 1000 / 2000;
    console.log(`weight expression, 2 fields: ${us.toFixed(1)} µs per evaluation in Node (with parsing)`);
}

console.log(`worst weight error ${worstW.toExponential(2)} · worst drawn-position error ${worstPos.toExponential(2)} px (no parent), ${worstParentPos.toExponential(2)} px (parented)`);
console.log(fails ? `${fails} of ${checks} checks FAILED` : `all ${checks} checks pass`);
process.exit(fails ? 1 : 0);
