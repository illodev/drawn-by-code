// test.mjs - checks the rig outside After Effects:
//  1. the timing (drawon-time.js) on hostile inputs: in every timing mode, order and setting
//     every stroke being drawn moves at the speed (finite differences), nothing draws before
//     its turn or flashes, the drawing ends when Drawing time says, Fit hits its duration,
//     draw-off and rewind run backwards cleanly;
//  2. the geometry (drawon-geom.js) against what After Effects measured (probe/*.txt): the
//     group transform, where its rectangles, ellipses and stars start and which way they run,
//     arc lengths, and the stretch table that keeps a stretched stroke even;
//  3. the very expression strings the built script writes, run against a mock of AE's
//     expression objects (Property objects that convert in arithmetic but fail ===, a Layer
//     Control that hands out a layer, trim keys), compared with drawon-time.js called directly.
//
//   node sandbox/2026-11-23-ae-draw-on-rig/build.mjs && node sandbox/2026-11-23-ae-draw-on-rig/test.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const read = (f) => fs.readFileSync(path.join(dir, f), 'utf8');
const T = new Function(read('drawon-time.js') + '\nreturn { dsEase, dsWarp, dsBegin, dsOn, dsMap, dsTrim, dsBefore, dsTotal, dsFit };')();
const DG = new Function(read('drawon-geom.js') + '\nreturn DG;')();
const $ = { global: { DRAWON_NO_UI: true }, fileName: '', os: 'Windows' };
new Function('$', read('out/test-build/Constant Speed Draw-On.jsx'))($);
const DO = $.global.DrawOn;

let fails = 0, checks = 0;
function check(what, ok, detail = '') {
    checks++;
    if (!ok) {
        fails++;
        console.log(`FAIL ${what}${detail ? ' · ' + detail : ''}`);
    }
}
function near(a, b, tol) {
    return Math.abs(a - b) <= tol;
}
// Park-Miller, for repeatable "random" cases
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

// ---- 1. timing ----
// a set of strokes with lengths and positions; ranks per order from the real DG.orders
function makeStrokes(n, spread) {
    const L = [], info = [];
    for (let k = 0; k < n; k++) {
        const len = k === 0 && spread === 'zero' ? 0 : Math.round((20 + rnd() * (spread === 'wide' ? 2000 : 300)) * 1000) / 1000;
        L.push(len);
        const c = [rnd() * 1920, rnd() * 1080], a = rnd() * 6.283;
        info.push({ stack: k, center: c, first: [c[0] - Math.cos(a) * 50, c[1] - Math.sin(a) * 50], last: [c[0] + Math.cos(a) * 50, c[1] + Math.sin(a) * 50], closed: rnd() < 0.2 });
    }
    const ord = DG.orders(info, 1), strokes = [];
    for (let k = 0; k < n; k++) {
        const s = { len: L[k], rank: [], before: [], flip: [], map: 0, own: rnd() * 2 };
        for (let o = 0; o < ord.rank.length; o++) {
            s.rank.push(ord.rank[o][k]);
            s.before.push(T.dsBefore(L, ord.rank[o])[k]);
            s.flip.push(ord.flip[o][k]);
        }
        strokes.push(s);
    }
    return { L, R: ord.rank, strokes };
}
function controls(o) {
    return Object.assign({ mode: 2, order: 1, dir: 1, after: 1, start: 0.5, gap: 0, stagger: 0.1, ease: 0, easeAll: 0, hold: 1, speed: 400, fit: 0, duration: 2 }, o);
}
const FPS = 24, DT = 1e-5;     // the functions are smooth inside a stroke: a tiny step stays inside it
let worstSpeed = 0;
for (const spread of ['narrow', 'wide', 'zero']) {
    for (const n of [1, 2, 7, 25]) {
        const S = makeStrokes(n, spread);
        for (let mode = 1; mode <= 4; mode++) {
            for (let order = 1; order <= 9; order += mode === 2 ? 1 : 4) {
                for (const gap of mode === 2 ? [0, 0.25, -0.15] : [0]) {
                    for (const stagger of mode === 3 ? [0, 0.08, -1] : [0.1]) {
                        const c = controls({ mode, order, gap, stagger });
                        c.total = T.dsTotal(c, S.L, S.R, c.speed);
                        const tag = `${spread} n${n} mode${mode} order${order} gap${gap} stagger${stagger}`;
                        let lastEnd = 0, early = 0, late = 0, notMonotone = 0;
                        for (let k = 0; k < n; k++) {
                            const s = S.strokes[k], t0 = T.dsBegin(c, s), d = s.len / c.speed;
                            lastEnd = Math.max(lastEnd, t0 + d);
                            // constant speed while drawing (finite differences inside the stroke)
                            for (let f = 0.05; f < 0.95 && d > 0; f += 0.1) {
                                const t = t0 + f * d, v = ((T.dsOn(c, s, t + DT) - T.dsOn(c, s, t - DT)) * s.len) / (2 * DT);
                                worstSpeed = Math.max(worstSpeed, Math.abs(v - c.speed) / c.speed);
                            }
                            for (let t = 0; t < t0 + d + 1; t += 1 / FPS) {
                                const p = T.dsOn(c, s, t);
                                if (t < t0 - 1e-9 && p > 0) early++;
                                if (t > t0 + d + 1e-9 && p < 1) late++;
                                if (p < T.dsOn(c, s, t - 1 / FPS) - 1e-12) notMonotone++;
                            }
                        }
                        check(`${tag}: nothing draws before its start`, early === 0, early);
                        check(`${tag}: every stroke is complete after len / speed`, late === 0, late);
                        check(`${tag}: drawn length never goes back`, notMonotone === 0, notMonotone);
                        if (mode !== 4) check(`${tag}: Drawing time = when the last stroke ends`, near(c.start + c.total, lastEnd, 1e-9), `${c.start + c.total} vs ${lastEnd}`);
                        if (mode === 2 && gap === 0) {
                            // one after another, no gap: the pen is always in exactly one stroke
                            let off = 0;
                            for (let t = c.start; t < c.start + c.total; t += 1 / 97) {
                                let drawn = 0;
                                for (const s of S.strokes) drawn += T.dsOn(c, s, t) * s.len;
                                off = Math.max(off, Math.abs(drawn - (t - c.start) * c.speed));
                            }
                            check(`${tag}: the pen draws speed x time, without pause or overlap`, off < 1e-6, off);
                        }
                        // Fit to duration
                        if (mode !== 4 && (mode !== 3 || stagger >= 0)) {
                            for (const D of [1.3, 4]) {
                                const v = T.dsFit(c, S.L, S.R, D), tot = T.dsTotal(c, S.L, S.R, v);
                                const feasible = mode === 2 ? (n - 1) * Math.max(gap, 0) < D : mode === 3 ? (n - 1) * Math.max(stagger, 0) < D : true;
                                if (feasible && S.L.some((x) => x > 0)) check(`${tag}: Fit ${D} s takes ${D} s`, near(tot, D, 1e-9), tot);
                            }
                        }
                    }
                }
            }
        }
    }
}
check(`constant speed in every stroke (worst ${(worstSpeed * 100).toFixed(4)} %)`, worstSpeed < 1e-6);

// whole-drawing ease: at any moment every stroke being drawn moves at the same speed
{
    const S = makeStrokes(12, 'wide');
    for (const mode of [1, 2, 3]) {
        const c = controls({ mode, easeAll: 70, stagger: 0.2 });
        c.total = T.dsTotal(c, S.L, S.R, c.speed);
        let worst = 0, outside = 0;
        for (let t = c.start + 0.01; t < c.start + c.total - 0.01; t += 0.037) {
            const v = [];
            for (const s of S.strokes) {
                const p = T.dsOn(c, s, t);
                if (p > 0.001 && p < 0.999) v.push(((T.dsOn(c, s, t + DT) - T.dsOn(c, s, t - DT)) * s.len) / (2 * DT));
            }
            for (const x of v) worst = Math.max(worst, Math.abs(x - v[0]) / (Math.abs(v[0]) + 1e-9));
        }
        for (const s of S.strokes) if (T.dsOn(c, s, c.start + c.total + 1e-6) < 1) outside++;
        check(`ease whole drawing, mode ${mode}: strokes drawing together share one speed`, worst < 1e-4, worst);
        check(`ease whole drawing, mode ${mode}: done when the drawing is`, outside === 0);
        const mid = T.dsWarp(c.start + c.total / 2, c.start, c.total, 70), edge = T.dsWarp(c.start + 0.001, c.start, c.total, 70);
        check(`ease whole drawing, mode ${mode}: the middle stays put, the start is slow`, near(mid, c.start + c.total / 2, 1e-9) && edge - c.start < 0.001);
    }
}
// per-stroke ease keeps the stroke's duration and its end points
{
    const S = makeStrokes(5, 'narrow'), c = controls({ ease: 100 });
    c.total = T.dsTotal(c, S.L, S.R, c.speed);
    for (const s of S.strokes) {
        const t0 = T.dsBegin(c, s), d = s.len / c.speed;
        check('ease each stroke: 0 at its start, 1 at its end, half at half time', T.dsOn(c, s, t0) === 0 && T.dsOn(c, s, t0 + d) === 1 && near(T.dsOn(c, s, t0 + d / 2), 0.5, 1e-12));
    }
    check('dsEase(x, 0) is linear', near(T.dsEase(0.3, 0), 0.3, 1e-15) && T.dsEase(-1, 50) === 0 && T.dsEase(2, 50) === 1);
}
// draw off and rewind
{
    const S = makeStrokes(9, 'wide');
    for (const mode of [1, 2, 3, 4]) {
        for (const after of [2, 3]) {
            for (const dir of [1, 2, 3]) {
                const c = controls({ mode, after, dir, hold: 0.7, stagger: 0.15 });
                c.total = T.dsTotal(c, S.L, S.R, c.speed);
                let bad = 0, shown = 0, left = 0;
                const endAll = mode === 4 ? Math.max(...S.strokes.map((s) => T.dsBegin(c, s) + s.len / c.speed)) : c.start + c.total;
                for (const s of S.strokes) {
                    for (let t = 0; t < endAll + c.hold + c.total + 3; t += 1 / FPS) {
                        const [a, b] = T.dsTrim(c, s, t);
                        if (a > b + 1e-9 || a < -1e-9 || b > 100 + 1e-9) bad++;
                    }
                    const tHold = mode === 4 ? T.dsBegin(c, s) + s.len / c.speed + c.hold / 2 : c.start + c.total + c.hold / 2;
                    const [a1, b1] = T.dsTrim(c, s, tHold);
                    if (a1 < 1e-9 && b1 > 100 - 1e-9) shown++;
                    const tGone = (mode === 4 ? T.dsBegin(c, s) + 2 * s.len / c.speed : c.start + 2 * c.total) + c.hold + 1e-6;
                    const [a2, b2] = T.dsTrim(c, s, tGone + (mode === 4 && after === 3 ? 0 : 0));
                    if (b2 - a2 > 1e-6) left++;
                }
                check(`mode ${mode} after ${after} dir ${dir}: Start <= End, both 0-100`, bad === 0, bad);
                check(`mode ${mode} after ${after} dir ${dir}: everything drawn during Hold`, shown === S.strokes.length, shown);
                check(`mode ${mode} after ${after} dir ${dir}: nothing left at the end`, left === 0, left);
            }
        }
    }
    // rewind is the draw-on played backwards
    const c = controls({ mode: 2, after: 3, hold: 0.5 });
    c.total = T.dsTotal(c, S.L, S.R, c.speed);
    let worst = 0;
    for (const s of S.strokes) for (let u = 0; u < c.total; u += 0.05) {
        const on = T.dsTrim(c, s, c.start + u), back = T.dsTrim(c, s, c.start + 2 * c.total + c.hold - u);
        worst = Math.max(worst, Math.abs(on[1] - back[1]));
    }
    check('rewind mirrors the draw-on in time', worst < 1e-9, worst);
}
// direction: Reversed draws the same amount from the other end
{
    const s = { len: 300, rank: [0, 0, 0, 0, 0, 0, 0, 0, 0], before: [0, 0, 0, 0, 0, 0, 0, 0, 0], flip: [0, 0, 1, 0, 0, 0, 0, 0, 0], map: 0, own: 0 };
    const c = controls({ mode: 1, total: 0.75, speed: 400 });
    const f = T.dsTrim(c, s, 0.5 + 0.3), r = T.dsTrim(Object.assign({}, c, { dir: 2 }), s, 0.5 + 0.3);
    check('Reversed: [100 - End, 100 - Start]', near(r[0], 100 - f[1], 1e-12) && near(r[1], 100 - f[0], 1e-12));
    const fo = T.dsTrim(Object.assign({}, c, { dir: 3, order: 3 }), s, 0.8), fo1 = T.dsTrim(Object.assign({}, c, { dir: 3, order: 1 }), s, 0.8);
    check('Follow the order: flips only where the order says', near(fo[0], r[0], 1e-12) && near(fo1[1], f[1], 1e-12));
}
// hostile: a stroke of length 0, speed near 0
{
    const s = { len: 0, rank: [0, 0, 0, 0, 0, 0, 0, 0, 0], before: [0, 0, 0, 0, 0, 0, 0, 0, 0], flip: [0, 0, 0, 0, 0, 0, 0, 0, 0], map: 0, own: 0 };
    const c = controls({ mode: 2, total: 0 });
    check('a stroke of length 0 is hidden before its start, shown after', T.dsTrim(c, s, 0.4)[1] === 0 && T.dsTrim(c, s, 0.6)[1] === 100);
    const c2 = controls({ speed: 0.001, total: 1e6 }), s2 = Object.assign({}, s, { len: 500 });
    const v = T.dsTrim(c2, s2, 3);
    check('speed near 0: finite values', isFinite(v[0]) && isFinite(v[1]));
    check('dsFit with no length: 1 px/s', T.dsFit(controls(), [0, 0], [[0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1]], 2) === 1);
    check('dsMap keeps 0 and 1 and is monotone', T.dsMap([0, 0.2, 1], 0) === 0 && T.dsMap([0, 0.2, 1], 1) === 1 && T.dsMap([0, 0.2, 1], 0.25) < T.dsMap([0, 0.2, 1], 0.5));
}

// ---- 2. geometry against After Effects ----
function probe(file) {
    const P = {};
    for (const line of read(file).split(/\r?\n/)) {
        const m = /^(\S+) = (.*)$/.exec(line);
        if (m) P[m[1]] = m[2];
    }
    return (k) => (P[k] === undefined ? undefined : new Function('return ' + P[k])());
}
const p1 = probe('probe/trim-probe.txt'), p2 = probe('probe/trim-probe2.txt');
// the exact box of the first fraction f of a path: the segment and t where that arc length
// ends (bisection), every bezier sampled densely up to there
function boxTo(P, f, M = DG.ID) {
    const segs = DG.segs(DG.mapPath(M, P)), len = (c, a, b) => {
        let s = 0;
        for (let q = 0; q < 16; q++) s += DG.arc(c, a + ((b - a) * q) / 16, a + ((b - a) * (q + 1)) / 16);
        return s;
    };
    const lens = segs.map((c) => len(c, 0, 1)), total = lens.reduce((x, y) => x + y, 0);
    let d = f * total;
    const xs = [], ys = [];
    for (let k = 0; k < segs.length; k++) {
        let tEnd = 1;
        if (d < lens[k]) {
            let lo = 0, hi = 1;
            for (let it = 0; it < 50; it++) {
                const m = (lo + hi) / 2;
                if (len(segs[k], 0, m) < d) lo = m;
                else hi = m;
            }
            tEnd = (lo + hi) / 2;
        }
        for (let s = 0; s <= 800; s++) {
            const p = DG.point(segs[k], (tEnd * s) / 800);
            xs.push(p[0]);
            ys.push(p[1]);
        }
        d -= lens[k];
        if (d <= 0) break;
    }
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)];
}
function boxErr(a, b) {
    return Math.max(...a.map((x, k) => Math.abs(x - b[k])));
}
{
    // the group transform reproduces AE's boxes
    const [V, I, O] = p1('xform.path'), P = { v: V, i: I, o: O, closed: true };
    let worst = 0;
    for (let k = 0; k < 8; k++) worst = Math.max(worst, boxErr(boxTo(P, 1, DG.groupMatrix(p1('xform.case' + k))), p1('xform.rect' + k)));
    check(`group transform = AE's (worst box ${worst.toFixed(3)} px)`, worst < 0.05);
    // parametric shapes: start, direction, length, as AE trims them
    const shapes = [
        ['Q0', DG.rect([200, 100], [0, 0], 0, 1)], ['Q1', DG.ellipse([200, 100], [0, 0], 1)], ['Q2', DG.star(1, 5, [0, 0], 0, 50, 100, 1)],
    ];
    for (const [name, P2] of shapes) {
        let w = 0;
        for (const e of [5, 10, 25, 40, 50, 60, 75, 90]) w = Math.max(w, boxErr(boxTo(P2, e / 100), p1(`${name}.end${e}`)));
        check(`${name} starts and runs like AE's (worst box ${w.toFixed(3)} px)`, w < 0.1);
    }
    const shapes2 = [
        ['round', DG.rect([200, 100], [0, 0], 20, 1), [1, 2, 5, 10, 25, 50]], ['rect3', DG.rect([200, 100], [0, 0], 0, 3), [5, 25, 50]],
        ['ell3', DG.ellipse([200, 100], [0, 0], 3), [5, 25, 50]], ['ell2', DG.ellipse([200, 100], [0, 0], 2), [5, 25, 50]],
        ['bez3', DG.reverse({ v: [[0, 0], [100, 0], [100, 100]], i: [[0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0]], closed: false }), [5, 25, 50]],
    ];
    for (const [name, P3, ends] of shapes2) {
        let w = 0;
        for (const e of ends) w = Math.max(w, boxErr(boxTo(P3, e / 100), p2(`${name}.end${e}`)));
        check(`${name} starts and runs like AE's (worst box ${w.toFixed(3)} px)`, w < 0.1);
    }
    // arc length on uneven beziers
    const A = { v: [[0, 0], [300, 0]], i: [[0, 0], [0, 0]], o: [[250, 0], [0, 0]], closed: false };
    const C = { v: [[0, 0], [300, 0]], i: [[0, 0], [-150, 300]], o: [[150, -300], [0, 0]], closed: false };
    let w = 0;
    for (const e of [5, 10, 25, 50, 75, 90]) w = Math.max(w, boxErr(boxTo(A, e / 100), p1(`A.end${e}`)), boxErr(boxTo(C, e / 100), p1(`C.end${e}`)));
    check(`arc length on uneven handles = AE's trim (worst box ${w.toFixed(3)} px)`, w < 0.1);
    const circle = DG.measure([{ P: DG.ellipse([200, 200], [0, 0], 1), M: DG.ID }]);
    check('a circle of radius 100 is 2 pi r long (within 0.03 %)', near(circle.len, 200 * Math.PI, 200 * Math.PI * 3e-4), circle.len);
    check('rectangle perimeter', near(DG.measure([{ P: DG.rect([200, 100], [5, 5], 0, 1), M: DG.ID }]).len, 600, 1e-6));
}
{
    // a scaled and rotated stroke: the same map (none), the length times the scale
    const P = { v: [[0, 0], [120, 10], [60, 90]], i: [[0, 0], [-30, -20], [20, 0]], o: [[40, -30], [0, 30], [0, 0]], closed: true };
    const a = DG.measure([{ P, M: DG.ID }]), b = DG.measure([{ P, M: DG.groupMatrix({ a: [3, 4], p: [100, 50], s: [150, 150], k: 0, ka: 0, r: 33 }) }]);
    check('uniform scale: length scales, no map', near(b.len, a.len * 1.5, a.len * 1e-6) && a.map === 0 && b.map === 0, `${b.len} vs ${a.len * 1.5}`);
    // stretched: the map makes equal visual steps
    const M = DG.groupMatrix({ a: [0, 0], p: [0, 0], s: [300, 60], k: 25, ka: 10, r: 15 }), m = DG.measure([{ P, M }]);
    check('stretched: a map is baked', m.map && m.map.length === DG.KNOTS + 1);
    const S = DG.sample([{ P, M }]), tL = S.T[S.T.length - 1];
    const at = (tf) => {
        // visual distance at trim fraction tf
        let j = 0;
        while (j < S.T.length - 2 && S.T[j + 1] < tf * tL) j++;
        const u = (tf * tL - S.T[j]) / (S.T[j + 1] - S.T[j] || 1);
        return S.V[j] + (S.V[j + 1] - S.V[j]) * u;
    };
    let worst = 0, worstNone = 0, worstStep = 0;
    const vL = S.V[S.V.length - 1], K = DG.KNOTS;
    for (let x = 0; x <= 1; x += 0.001) {
        worst = Math.max(worst, Math.abs(at(T.dsMap(m.map, x)) / vL - x));
        worstNone = Math.max(worstNone, Math.abs(at(x) / vL - x));
    }
    // the average speed over each step of the table (a stretch makes the speed jump at a
    // corner, where the path turns: no table is smooth across that)
    for (let k = 0; k < K; k++) worstStep = Math.max(worstStep, Math.abs((at(T.dsMap(m.map, (k + 1) / K)) - at(T.dsMap(m.map, k / K))) / (vL / K) - 1));
    check(`stretched: the pen is where it should be (off by ${(worst * 100).toFixed(2)} % of the length at worst; ${(worstNone * 100).toFixed(1)} % without the table)`, worst < 0.003 && worstNone > 0.02);
    check(`stretched: even speed over every 1/${K} of the stroke (worst ${(worstStep * 100).toFixed(2)} %)`, worstStep < 0.01);
    // a root trim over a group scaled 200 %: Trim Paths shares by unscaled length (probe 2)
    const line1 = { v: [[0, 0], [100, 0]], i: [[0, 0], [0, 0]], o: [[0, 0], [0, 0]], closed: false };
    const line2 = { v: [[0, 100], [300, 100]], i: [[0, 0], [0, 0]], o: [[0, 0], [0, 0]], closed: false };
    const two = DG.measure([{ P: line1, M: [2, 0, 0, 2, 0, 0] }, { P: line2, M: DG.ID }]);
    check('two paths, one scaled 200 %: 500 px seen', near(two.len, 500, 1e-6), two.len);
    // AE at End 10 %: 40 unscaled px of the first line, 80 px seen ([0, 0, 80, 100] in probe 2)
    check('the share Trim Paths gives a scaled group matches AE (End 10 % reaches 80 px)', near(p2('scaled.end10')[2], 80, 0.01));
    // and the map sends the pen's first 80 / 500 of the way to trim fraction 40 / 400
    check('the map turns seen distance into Trim Paths\' unscaled share', near(T.dsMap(two.map, 80 / 500), 40 / 400, 0.002), T.dsMap(two.map, 80 / 500));
}
{
    // orders: permutations, ties by timeline order, flips only for open strokes
    const S = makeStrokes(30, 'wide');
    let ok = true;
    for (const r of S.R) {
        const seen = new Set(r);
        if (seen.size !== r.length || Math.min(...r) !== 0 || Math.max(...r) !== r.length - 1) ok = false;
    }
    check('every order is a permutation', ok);
    const same = DG.orders([{ stack: 0, center: [5, 5], first: [0, 0], last: [9, 0], closed: false }, { stack: 1, center: [5, 5], first: [9, 0], last: [0, 0], closed: false }, { stack: 2, center: [5, 5], first: [9, 0], last: [0, 0], closed: true }], 1);
    check('ties go by timeline order', same.rank[2].join() === '0,1,2');
    check('Left to right flips the stroke drawn right to left, not a closed one', same.flip[2].join() === '0,1,0');
    check('the shuffle is the same every time', DG.shuffle(10, 1).join() === DG.shuffle(10, 1).join() && DG.shuffle(10, 1).join() !== DG.shuffle(10, 2).join());
}

// ---- 3. the expressions the script writes, in a mock of AE ----
// Like AE, effect("X")(1) is a Property object: arithmetic converts it, === does not, .value is
// the number (dropdowns 1-based, checkboxes 0/1); a Layer Control's property is the layer.
const propOf = (v, keys) => ({ value: v, valueOf: () => v, numKeys: keys ? keys.length : 0, key: (i) => ({ time: keys[i - 1] }) });
function mockLayer(values, extra) {
    const L = {
        inPoint: 0,
        effect(n) {
            if (n in values) return () => propOf(typeof values[n] === 'function' ? values[n]() : values[n]);
            if (extra && n in extra) return () => extra[n];
            throw new Error(`no effect "${n}"`);
        },
    };
    return L;
}
function run(src, env) {
    const f = new Function('effect', 'thisLayer', 'thisProperty', 'time', 'value', '__src', 'return eval(__src);');
    return f(env.effect, env.thisLayer, env.thisProperty, env.time, env.value, src);
}
{
    const S = makeStrokes(6, 'wide'), rig = 'Draw-On', N = DO.CTL;
    const sliders = { mode: 2, order: 3, dir: 3, after: 2, start: 0.4, gap: 0.1, stagger: 0.12, ease: 30, easeAll: 20, hold: 0.6, speed: 650, fit: 0, duration: 2 };
    const values = {};
    for (const k in sliders) values[N[k]] = sliders[k];
    const nullLayer = mockLayer(values);
    // the null's two computed sliders, run through their own expressions
    const speedSrc = DO.speedExpr(rig, S.L, S.R), totalSrc = DO.totalExpr(rig, S.L, S.R);
    values[N.speedUsed] = () => run(speedSrc, { effect: nullLayer.effect, thisLayer: nullLayer, time: 0 });
    values[N.total] = () => run(totalSrc, { effect: nullLayer.effect, thisLayer: nullLayer, time: 0 });
    const c = Object.assign({}, sliders);
    c.speed = 650;
    c.total = T.dsTotal(c, S.L, S.R, 650);
    check('the Speed used expression = Speed', near(values[N.speedUsed](), 650, 1e-12));
    check('the Drawing time expression = dsTotal', near(values[N.total](), c.total, 1e-9), values[N.total]());
    values[N.fit] = 1;
    check('Fit to duration: the Speed used expression = dsFit', near(values[N.speedUsed](), T.dsFit(c, S.L, S.R, 2), 1e-9));
    values[N.fit] = 0;
    // a stroke's Start and End expressions, its trim keyed at 0.8 s and 2 s (own start 0.8)
    let worst = 0, errors = 0;
    for (let k = 0; k < S.strokes.length; k++) {
        const s = S.strokes[k], d = { index: k, count: S.strokes.length, len: s.len, rank: s.rank, before: s.before, flip: s.flip, map: k % 2 ? [0, 0.1, 0.3, 0.6, 1] : 0, added: k % 2, type: 1 };
        const trimProps = [propOf(0, []), propOf(100, [0.8, 2])];
        const env = { effect: mockLayer({}, { [rig + ' Controls']: nullLayer }).effect, thisLayer: { inPoint: 0.25 }, thisProperty: { propertyGroup: () => (i) => trimProps[i - 1] }, value: 0 };
        const exStart = DO.strokeExpr(rig, d, 0), exEnd = DO.strokeExpr(rig, d, 1);
        check('the expression starts with the rig\'s mark', exStart.indexOf(DO.MARK + rig + '"') === 0 && exEnd.indexOf(DO.MARK + rig + '"') === 0);
        check('the keep line says what Remove needs', /\n\/\/ keep: added=[01] type=1\n/.test(exEnd));
        for (const mode of [1, 2, 3, 4]) {
            values[N.mode] = mode;
            c.mode = mode;
            c.total = T.dsTotal(c, S.L, S.R, 650);
            const sd = Object.assign({}, s, { map: d.map, own: 0.8 });
            for (let t = 0; t < 9; t += 0.13) {
                env.time = t;
                const a = run(exStart, env), b = run(exEnd, env), want = T.dsTrim(c, sd, t);
                if (typeof a !== 'number' || typeof b !== 'number') errors++;
                worst = Math.max(worst, Math.abs(a - want[0]), Math.abs(b - want[1]));
            }
        }
    }
    check(`the Start / End expressions = drawon-time.js (worst ${worst})`, worst < 1e-9 && errors === 0, errors);
    // a stroke whose trim has no keys starts, in My own start times, when its layer does
    {
        const s = S.strokes[0], d = { index: 0, count: 1, len: s.len, rank: s.rank, before: s.before, flip: s.flip, map: 0, added: 1, type: 1 };
        values[N.mode] = 4;
        c.mode = 4;
        const trimProps = [propOf(0), propOf(100)];
        const env = { effect: mockLayer({}, { [rig + ' Controls']: nullLayer }).effect, thisLayer: { inPoint: 1.5 }, thisProperty: { propertyGroup: () => (i) => trimProps[i - 1] }, value: 0, time: 1.5 + s.len / 650 / 2 };
        check('no keys: My own start times starts at the layer\'s in point', near(run(DO.strokeExpr(rig, d, 1), env), T.dsTrim(c, Object.assign({}, s, { own: 1.5 }), env.time)[1], 1e-9));
        // the controls gone (Layer Control re-aimed at a layer without them): the stroke shows whole
        const env2 = Object.assign({}, env, { effect: mockLayer({}, { [rig + ' Controls']: mockLayer({}) }).effect });
        check('controls gone: End 100, Start 0 (the stroke shows whole)', run(DO.strokeExpr(rig, d, 1), env2) === 100 && run(DO.strokeExpr(rig, d, 0), env2) === 0);
    }
    // Property objects: a dropdown read without .value would fail === (the mock would catch it)
    check('the expressions read every control with .value', !/effect\("[^"]+"\)\(1\)\s*[=!]==/.test(DO.strokeExpr(rig, { index: 0, count: 1, len: 1, rank: [0], before: [0], flip: [0], map: 0, added: 0, type: 1 }, 1)));
    // names of the controls fit AE's 28 characters, and the expressions are ASCII
    check('control names fit in 28 characters', DO.CONTROLS.every((c2) => c2[1].length <= 28));
    check('expressions are ASCII', !/[^\x00-\x7f]/.test(DO.strokeExpr(rig, { index: 0, count: 1, len: 1, rank: [0], before: [0], flip: [0], map: 0, added: 0, type: 1 }, 1) + speedSrc));
}
// the guide talks to the person animating
{
    const jargon = /\b(expression|matchName|ExtendScript|arc length|affine|bezier|array|param|toComp|ES3|null object)\b/i;
    const words = DO.info;
    check('the guide has no jargon', !jargon.test(words), (words.match(jargon) || [])[0]);
    check('the guide fits lines of 80 characters', DO.wrap(words, 80).every((l) => l.length <= 80));
}

console.log(`${checks - fails}/${checks} checks passed${fails ? `, ${fails} FAILED` : ''}`);
process.exit(fails ? 1 : 0);
