// test.mjs - checks morph-math.js in Node, on the demo's keys and on random paths:
//   node sandbox/2026-11-21-ae-morph-fixer/test.mjs
// Every key keeps its exact shape (each sample of the fixed path projected onto the original
// curve, and back), every key ends with the same number of points and the same direction, a
// second run changes nothing, and the morph travels less.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CASES as ART_CASES, build as buildArt } from './art/cases.mjs';

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

let worstKink = 0, fellBack = 0, capped = 0;
function verify(label, keys, opt) {
    const t0 = process.hrtime.bigint();
    let r = MF.fix(keys, opt);
    const exact = (opt && opt.mode === 'exact') || r.fellBack;
    // exact: 0.01 (the measure's own limit on cusps); smooth: the tolerance, or, when the
    // max points stopped it first, about the distance it reported (on wild random shapes held
    // to few points the check reads up to ~25 % low, so AE words it "about")
    const tol = exact ? 0.01 : r.capped ? r.deviation * 1.35 + 0.005 : ((opt && opt.tolerance) || 0.1) + 0.005;
    if (r.fellBack) fellBack++;
    if (r.capped) capped++;
    const ms = Number(process.hrtime.bigint() - t0) / 1e6;
    // with a turn, r.paths are the keys unturned around their centres: check the keys as placed
    if (r.placed) r = Object.assign({}, r, { paths: r.placed });
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
        if (!exact) {
            // at most maxPoints, unless the corners alone need more (each keeps a point)
            let corners = 1;
            for (const K of keys) corners += MF.corners(K, MF.measure(K)).length;
            const cap = Math.max((opt && opt.maxPoints) || 100, corners);
            check(`${label}: key ${k} has at most ${cap} points`, P.v.length <= cap, P.v.length);
        }
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
    const again = MF.fix(r.paths, opt), againP = again.placed || again.paths;
    let drift = 0;
    for (let k = 0; k < keys.length; k++) drift = Math.max(drift, same(r.paths[k], againP[k]));
    check(`${label}: a second run changes nothing`, drift < 1e-9, drift);
    if (drift >= 1e-9 && process.env.DUMP) fs.writeFileSync(path.join(dir, 'out', 'fail-rerun-' + label.replace(/[^a-z0-9]+/gi, '-') + '.json'), JSON.stringify({ keys, opt }));
    return { r, ms, worstShape, n };
}

// ---- the demo ---------------------------------------------------------------------------
{
    const keys = MD.keys.map(([, s]) => MD.shapes[s]);
    const ex = verify('demo exact', keys, { mode: 'exact' });
    console.log(`demo, exact: points ${keys.map((k) => k.v.length).join('/')} -> ${ex.n} each, ${ex.ms.toFixed(0)} ms, worst shape change ${ex.worstShape.toExponential(1)} px`);
    const { r, ms, worstShape, n } = verify('demo', keys, { maxPoints: MD.maxPoints });
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
    // a max that bites: at most 24 points, short of 0.1 px, and it says how far it got
    const c = verify('demo max 24', keys, { maxPoints: 24 });
    check('demo max 24: at most 24 points', c.n <= 24, c.n);
    check('demo max 24: reports the cap and the distance', c.r.capped && c.r.deviation > 0.1, `${c.r.capped} ${c.r.deviation}`);
    console.log(`demo, max 24: ${c.n} points each, measured ${c.r.deviation.toFixed(2)} px (true worst ${c.worstShape.toFixed(2)} px)`);
}

// ---- turning: the F, turned a quarter at a time -------------------------------------------
// The reference for a turn: what a hand-made group turn would show a fraction u (eased) into
// the step from key k: the local path blended, turned by the Rotation, around the group's
// Anchor, at its Position. In a step that turns about a point, anchor and position hold; in a
// slide they blend. The fixer writes exactly this into the path (MF.swing, one key a frame).
function shown(r, k, u) {
    const L = MF.lerp(r.paths[k], r.paths[k + 1], u), T = r.turn, A = T.anchor[k];
    const P0 = T.position[k], P1 = T.hold[k] ? P0 : T.position[k + 1];
    const pos = [P0[0] + (P1[0] - P0[0]) * u, P0[1] + (P1[1] - P0[1]) * u];
    const moved = { v: L.v.map((p) => [p[0] - A[0], p[1] - A[1]]), i: L.i, o: L.o, closed: L.closed };
    return MF.turnPath(moved, pos, T.angles[k] + (T.angles[k + 1] - T.angles[k]) * u);
}
{
    const keys = MD.turn.keys.map(([, s]) => MD.turn.shapes[s]);
    for (const mode of ['smooth', 'exact']) {
        const r = MF.fix(keys, { mode, rotate: true });
        check(`turn ${mode}: the turn is taken out`, !!r.turn, JSON.stringify(r.keys.map((k) => k.turn)));
        if (!r.turn) continue;
        const want = MD.turn.keys.map(([, s]) => 90 * s);
        const worstAngle = Math.max(...r.turn.angles.map((a, k) => Math.abs(a - want[k])));
        check(`turn ${mode}: angles 0, 90, 180, 270, 360`, worstAngle < 0.5, r.turn.angles.map((a) => a.toFixed(2)).join(' '));
        let worstLocal = 0, worstPlaced = 0;
        for (let k = 0; k < keys.length; k++) {
            if (k) worstLocal = Math.max(worstLocal, MF.rms(r.paths[k - 1], r.paths[k]));
            // at each key, both ends of the steps around it show the key as drawn
            const shapes = [];
            if (k < keys.length - 1) shapes.push(shown(r, k, 0));
            if (k > 0) shapes.push(shown(r, k - 1, 1));
            for (const P of shapes) worstPlaced = Math.max(worstPlaced, MF.deviation(keys[k], P), MF.deviation(P, keys[k]));
        }
        check(`turn ${mode}: nothing left to deform (local keys alike)`, worstLocal < 0.5, worstLocal.toFixed(3) + ' px');
        check(`turn ${mode}: each key shown exactly where it was drawn`, worstPlaced < (mode === 'exact' ? 0.01 : 0.105), worstPlaced.toFixed(4) + ' px');
        // halfway through the first quarter turn: the F keeps its area (straight lines shrink it)
        const a0 = Math.abs(MF.area(keys[0]));
        const turnedArea = Math.abs(MF.area(shown(r, 1, 0.5)));
        const plain = MF.fix(keys, { mode }), straightArea = Math.abs(MF.area(MF.lerp(plain.paths[1], plain.paths[2], 0.5)));
        const raw = Math.abs(MF.area(MF.lerp(keys[1], keys[2], 0.5)));
        check(`turn ${mode}: halfway keeps the F's area`, Math.abs(turnedArea / a0 - 1) < 0.01, (turnedArea / a0).toFixed(3));
        if (mode === 'smooth') console.log(`turn: angles ${r.turn.angles.map((a) => a.toFixed(1)).join(' / ')}; halfway area vs drawn: turned ${(turnedArea / a0).toFixed(3)}, as drawn (straight lines) ${(raw / a0).toFixed(3)}, fixed without turn ${(straightArea / a0).toFixed(3)}`);
        const again = MF.fix(r.paths, { mode, rotate: true });
        check(`turn ${mode}: a second run (on the local keys) changes nothing`, again.matched, JSON.stringify(again.keys.map((k) => k.turn)));
    }
    // halfway, the shape shown is the F turned 45 deg (the ideal), not a squashed blend
    {
        const r = MF.fix(keys, { rotate: true }), plain = MF.fix(keys), ideal = MF.turnPath(MF.turnPath(MD.turn.shapes[0], [-10, 0], 0), [10, 0], 45);
        const half = shown(r, 1, 0.5), dTurn = Math.max(MF.deviation(ideal, half), MF.deviation(half, ideal));
        const raw = MF.lerp(keys[1], keys[2], 0.5), dRaw = Math.max(MF.deviation(ideal, raw), MF.deviation(raw, ideal));
        const fixed = MF.lerp(plain.paths[1], plain.paths[2], 0.5), dFix = Math.max(MF.deviation(ideal, fixed), MF.deviation(fixed, ideal));
        check('turn: halfway is the F turned 45 deg', dTurn < 0.2, dTurn.toFixed(3) + ' px');
        console.log(`turn: halfway vs the F turned 45 deg: turned ${dTurn.toFixed(2)} px, as drawn ${dRaw.toFixed(1)} px, fixed without turn ${dFix.toFixed(1)} px`);
    }
    // the turn as written into the path (shape paths and masks alike): MF.swing is exactly
    // what the group transform would show, and AE's eased progress reads back
    {
        const r = MF.fix(keys, { rotate: true });
        let worst = 0;
        for (let k = 0; k + 1 < keys.length; k++) {
            for (const u of [0, 0.25, 0.5, 0.75, 1]) {
                const a = MF.swing(r.turn, r.paths, k, u), b = shown(r, k, u);
                for (let j = 0; j < a.v.length; j++) worst = Math.max(worst, Math.hypot(a.v[j][0] - b.v[j][0], a.v[j][1] - b.v[j][1]));
            }
        }
        check('turn baked: MF.swing shows what the group transform shows', worst < 1e-9, worst);
        const A = r.placed[1], B = r.placed[2], want = [0, 0.1, 0.37, 0.5, 0.93, 1];
        const us = want.map((u) => MF.progressOf(MF.lerp(A, B, u), A, B));
        check('turn baked: AE\'s progress is read back from the blended path', us.every((u, j) => Math.abs(u - want[j]) < 1e-9), us.map((u) => u.toFixed(3)).join(' '));
        const half = MF.swing(r.turn, r.paths, 1, 0.5), ideal = MF.turnPath(MF.turnPath(MD.turn.shapes[0], [-10, 0], 0), [10, 0], 45);
        const d = Math.max(MF.deviation(ideal, half), MF.deviation(half, ideal));
        check('turn baked: the in-between halfway is the F turned 45 deg', d < 0.2, d.toFixed(3) + ' px');
        // fixing again (the AE half removes the in-betweens first): the drawn keys as written
        // are kept point for point, and the same turn comes out, so the same in-betweens
        for (const mode of ['smooth', 'exact']) {
            const first = MF.fix(keys, { mode, rotate: true }), again = MF.fix(first.placed, { mode, rotate: true });
            let dKeys = 0, dSwing = 0;
            for (let k = 0; k < keys.length; k++) dKeys = Math.max(dKeys, ...again.placed[k].v.map((p, j) => Math.hypot(p[0] - first.placed[k].v[j][0], p[1] - first.placed[k].v[j][1])));
            for (let k = 0; k + 1 < keys.length; k++) {
                const a = MF.swing(first.turn, first.paths, k, 0.4), b = MF.swing(again.turn, again.paths, k, 0.4);
                dSwing = Math.max(dSwing, ...a.v.map((p, j) => Math.hypot(p[0] - b.v[j][0], p[1] - b.v[j][1])));
            }
            check(`turn baked ${mode}: fixed again, the keys are kept and the in-betweens come out the same`, again.kept && !!again.turn && dKeys === 0 && dSwing < 1e-6,
                `kept ${again.kept}, keys moved ${dKeys}, in-betweens ${dSwing.toExponential(1)} px`);
        }
    }
    // random shapes turned by random angles about random points: the turn is recovered
    {
        let s2 = 777, worst = 0, found = 0;
        const r2 = () => (s2 = (s2 * 16807) % 2147483647) / 2147483647;
        for (let t = 0; t < 60; t++) {
            const n = 4 + Math.floor(r2() * 8), P = { v: [], i: [], o: [], closed: true };
            for (let k = 0; k < n; k++) {
                const a = (k / n) * Math.PI * 2, rr = 100 + r2() * 120;
                P.v.push([700 + rr * Math.cos(a), 500 + rr * Math.sin(a)]);
                P.i.push([0, 0]);
                P.o.push([0, 0]);
            }
            const ang = (r2() * 2 - 1) * 170, c = [r2() * 1500, r2() * 900];
            const Q = MF.turnPath(MF.turnPath(P, c, 0, true), [c[0] + r2() * 200, c[1] + r2() * 200], ang);   // turned and moved
            const r = MF.fix([P, Q], { rotate: true });
            if (!r.turn) continue;
            found++;
            worst = Math.max(worst, Math.abs(r.turn.angles[1] - ang));
        }
        check('turn: random turns recovered', found >= 55 && worst < 1, `${found}/60, worst ${worst.toFixed(3)} deg`);
        console.log(`turn: ${found} of 60 random turned shapes recovered, worst angle error ${worst.toFixed(3)} deg`);
    }
    // morphs that don't turn stay put with turn on: no spin made up for a circle
    const d = MF.fix(MD.keys.map(([, s]) => MD.shapes[s]), { rotate: true });
    console.log(`morph demo with turn on: ${d.turn ? 'angles ' + d.turn.angles.map((a) => a.toFixed(1)).join(' / ') : 'no turn'}`);
    if (d.turn) check('turn on, circle to star: no turn invented', Math.abs(d.turn.angles[2] - d.turn.angles[1]) < 1, d.turn.angles[2] - d.turn.angles[1]);
}

// ---- pieces: a letter with holes, a piece that grows from a point --------------------------
{
    const sq = (cx, cy, r, ccw) => {
        const v = [[cx - r, cy - r], [cx + r, cy - r], [cx + r, cy + r], [cx - r, cy + r]];
        if (ccw) v.reverse();
        return { v, i: v.map(() => [0, 0]), o: v.map(() => [0, 0]), closed: true };
    };
    const outer = sq(0, 0, 100, false), hole = sq(0, 0, 40, true);
    let res = MF.matchPieces([[outer, hole], [hole, outer]]);
    check('pieces: pieces drawn in the other order are dealt back', res.moved === 2 && res.keys[1][0] === outer && res.keys[1][1] === hole, `moved ${res.moved}`);
    res = MF.matchPieces([[outer, hole], [sq(10, 0, 100, false), sq(10, 0, 40, true)]]);
    check('pieces: an order that already matches is kept', res.moved === 0 && res.grown === 0);
    // O into C: the hole is a dot at the second key, so it shrinks into the dot as a tiny copy
    res = MF.matchPieces([[outer, hole], [outer, sq(5, 5, 0.1, true)]]);
    const gi = MF.pieceInfo(res.keys[1][1]), hi = MF.pieceInfo(hole);
    check('pieces: a dotted piece grows from the dot, as a tiny copy of itself', res.grown === 1 && res.keys[1][1].v.length === hole.v.length &&
        gi.size < 0.01 * hi.size && Math.hypot(gi.c[0] - 5, gi.c[1] - 5) < 0.01 && gi.sign === hi.sign, `size ${gi.size.toFixed(4)} at ${gi.c.map((x) => x.toFixed(2))}`);
    res = MF.matchPieces([[outer, hole], [outer, sq(900, 900, 0.1, true)]]);
    const g2 = MF.pieceInfo(res.keys[1][1]);
    check('pieces: a dot dropped outside the shape grows from the piece\'s own place', Math.hypot(g2.c[0], g2.c[1]) < 0.01, g2.c.map((x) => x.toFixed(2)).join(', '));
    // a B with its body and two holes in another order at the second key
    const body = sq(0, 0, 100, false), top = sq(0, -50, 25, true), bottom = sq(0, 50, 25, true);
    res = MF.matchPieces([[body, top, bottom], [bottom, body, top]]);
    check('pieces: three pieces in any order', res.keys[1][0] === body && res.keys[1][1] === top && res.keys[1][2] === bottom, `moved ${res.moved}`);
    // a lone path collapsed to a dot at one key grows from that dot
    res = MF.matchPieces([[outer], [sq(30, 20, 0.2, false)], [outer]]);
    const g3 = MF.pieceInfo(res.keys[1][0]);
    check('pieces: a lone path drawn as a dot grows from where the dot is', res.grown === 1 && Math.hypot(g3.c[0] - 30, g3.c[1] - 20) < 0.01, g3.c.map((x) => x.toFixed(2)).join(', '));
    // after matching, each property's keys fix cleanly: the grown hole keeps its points and turn
    const fixedHole = MF.fix([hole, MF.matchPieces([[outer, hole], [outer, sq(5, 5, 0.1, true)]]).keys[1][1]]);
    check('pieces: a hole growing from a point fixes like any path', !fixedHole.fellBack && fixedHole.paths[0].v.length === fixedHole.paths[1].v.length, fixedHole.mode);
}

// ---- progress: the fix can be cancelled while it works, before anything is written ----------
{
    let calls = 0, threw = null;
    try {
        MF.fix(MD.keys.map(([, s]) => MD.shapes[s]), { progress: () => ++calls > 3 });
    } catch (e) {
        threw = e;
    }
    check('progress: returning true cancels the fix (it throws, writes nothing)', !!threw && threw.cancelled === true && calls === 4, String(calls));
    let fr = [];
    MF.fix(MD.keys.map(([, s]) => MD.shapes[s]), { progress: (f) => { fr.push(f); return false; } });
    check('progress: fractions climb from 0 towards 1', fr.length > 5 && fr.every((f, j) => f >= 0 && f <= 1 && (j === 0 || f >= fr[j - 1] - 1e-9)), `${fr.length} calls, last ${fr[fr.length - 1].toFixed(2)}`);
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
    const opt = trial % 6 === 0 ? { maxPoints: [100, 40, 512, 24][Math.floor(rnd() * 4)] } : { mode: 'exact' };
    const { ms, worstShape, n } = verify(`random ${trial}`, keys, opt);
    worstRandom = Math.max(worstRandom, worstShape);
    slowest = Math.max(slowest, ms);
    maxPts = Math.max(maxPts, n);
}
console.log(`${TRIALS} random morphs (1 in 6 rebuilt): worst shape change ${worstRandom.toFixed(4)} px, slowest fix ${slowest.toFixed(0)} ms (Node), up to ${maxPts} points; worst halfway kink at points smooth in both keys ${worstKink.toFixed(3)} deg; ${fellBack} rebuild(s) fell back to keeping the points, ${capped} stopped at their max (honest distance reported)`);

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

// ---- symmetry: shapes sharing a mirror axis morph mirror-symmetrically ----------------------
// Symmetric motion keeps the keys' shared axis in every in-between; a swirl keeps the shape
// symmetric but turns its axes (a thin star: 18 -> 27 -> 36 deg), so the test asks for the axis.
const polyPath = (pts) => ({ v: pts, i: pts.map(() => [0, 0]), o: pts.map(() => [0, 0]), closed: true });
const turnPts = (pts, d) => { const a = d * Math.PI / 180; return pts.map(([x, y]) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)]); };
const starPts = (n, R, r, rot) => { const p = []; for (let k = 0; k < 2 * n; k++) { const a = (rot - 90 + k * 180 / n) * Math.PI / 180, rr = k % 2 ? r : R; p.push([rr * Math.cos(a), rr * Math.sin(a)]); } return p; };
const plusPts = (w, L, rot) => turnPts([[-w, -L], [w, -L], [w, -w], [L, -w], [L, w], [w, w], [w, L], [-w, L], [-w, w], [-L, w], [-L, -w], [-w, -w]], rot);
// every in-between checked keeps a mirror axis at deg
function keepsAxis(r, deg) {
    const P = r.placed || r.paths;
    return [0.2, 0.4, 0.6, 0.8].every((u) => {
        const ax = MF.mirrorAxes(MF.lerp(P[0], P[1], u));
        return ax === 'round' || ax.some((a) => { const d = Math.abs(a.phi * 180 / Math.PI - deg) % 180; return Math.min(d, 180 - d) < 2; });
    });
}
{
    // the axis finder
    const star = polyPath(starPts(5, 150, 60, 0)), ax = MF.mirrorAxes(star).map((a) => Math.round(a.phi * 180 / Math.PI)).sort((a, b) => a - b);
    check('symmetry: a star\'s five mirror axes found', ax.join() === '18,54,90,126,162', ax.join());
    check('symmetry: a circle is round, a heart has one axis', MF.mirrorAxes(MD.shapes[0]) === 'round' && MF.mirrorAxes(MD.shapes[3]).length === 1, JSON.stringify(MF.mirrorAxes(MD.shapes[3])));
    // a star drawn by hand (each point off by up to 3 % and 2 px): the quick test (every fix)
    // finds no axis, the thorough one (sym ticked) finds its upright one
    let s3 = 7;
    const r3 = () => (s3 = (s3 * 16807) % 2147483647) / 2147483647, wob = [];
    for (let k = 0; k < 10; k++) {
        const a = (-90 + k * 36) * Math.PI / 180, rr = (k % 2 ? 60 : 150) * (1 + (r3() - 0.5) * 0.06);
        wob.push([rr * Math.cos(a) + (r3() - 0.5) * 4, rr * Math.sin(a) + (r3() - 0.5) * 4]);
    }
    const quickW = MF.mirrorAxes(polyPath(wob)), thoroughW = MF.mirrorAxes(polyPath(wob), true);
    check('symmetry: a hand-drawn star: no axis quick, its upright one thorough (sym)', quickW.length === 0 && thoroughW.some((a) => Math.abs(a.phi * 180 / Math.PI - 90) < 2),
        thoroughW.map((a) => (a.phi * 180 / Math.PI).toFixed(1)).join('/'));
    // the thorough test finds no false axes near the true ones (a rounded square's rise slowly)
    const rsq = MF.mirrorAxes(MD.shapes[2], true).map((a) => Math.round(a.phi * 180 / Math.PI) % 180).sort((a, b) => a - b);
    check('symmetry: a rounded square has exactly its four axes, thorough too', rsq.join() === '0,45,90,135', rsq.join());
    const cases = [
        ['star into the same star turned 36 deg', [star, polyPath(starPts(5, 150, 60, 36))], 1.1],
        ['plus into x', [polyPath(plusPts(30, 140, 0)), polyPath(plusPts(30, 140, 45))], 1.1],
    ];
    for (const [name, keys, most] of cases) {
        const least = MF.fix(keys, { symmetry: false }), r = verify('symmetry ' + name, keys, {}).r;
        check(`symmetry: ${name}: least travel swirls (its axis turns)`, !keepsAxis(least, 90));
        check(`symmetry: ${name}: kept mirror-symmetric about the shared axis, and said`, keepsAxis(r, 90) && r.keys[1].symmetric);
        check(`symmetry: ${name}: for little more travel`, r.keys[1].after <= least.keys[1].after * most, `${least.keys[1].after.toFixed(1)} -> ${r.keys[1].after.toFixed(1)} px`);
        console.log(`symmetry: ${name}: travel ${least.keys[1].after.toFixed(1)} -> ${r.keys[1].after.toFixed(1)} px, mirror-symmetric`);
    }
    // costlier: the default keeps least travel, the option (sym) takes symmetry anyway
    const plus20 = [polyPath(plusPts(20, 150, 0)), polyPath(plusPts(20, 150, 45))];
    const dflt = MF.fix(plus20, {}), forced = verify('symmetry forced', plus20, { symmetry: 'force' }).r;
    check('symmetry: when it costs more than about the same, only the option takes it', !dflt.keys[1].symmetric && !keepsAxis(dflt, 90) && forced.keys[1].symmetric && keepsAxis(forced, 90),
        `${dflt.keys[1].after.toFixed(1)} -> ${forced.keys[1].after.toFixed(1)} px`);
    // already symmetric: left as least travel found it, nothing reported
    const sp = MF.fix([star, polyPath(starPts(5, 110, 110 * Math.cos(Math.PI / 5), 36))], {});
    check('symmetry: a morph already symmetric is left alone', keepsAxis(sp, 90) && !sp.keys[1].symmetric);
    const demo = MF.fix(MD.keys.map(([, s]) => MD.shapes[s]), { maxPoints: MD.maxPoints });
    check('symmetry: the demo (all sharing the upright axis) is mirror-symmetric throughout', demo.paths.every((P, k) => !k || keepsAxis({ paths: [demo.paths[k - 1], P] }, 90)));
}

// ---- keys drawn as a turn of the previous one (Free Transform: the same points, turned) ----
// The fix used to throw the drawn pairing away: a star turned a tip stood still (least travel
// is no motion for a shape the turn maps onto itself), a gear turned half a tooth pulsed.
{
    const travel = (A, B) => A.v.reduce((t, p, k) => t + Math.hypot(p[0] - B.v[k][0], p[1] - B.v[k][1]), 0) / A.v.length;
    const area = (P) => Math.abs(MF.area(P));
    const starDrawn = [polyPath(starPts(5, 150, 60, 0)), polyPath(turnPts(starPts(5, 150, 60, 0), 72))];
    const gearDrawn = [0, 18, 36].map((d) => polyPath(turnPts(starPts(10, 150, 120, 0), d)));
    const fDrawn = [MD.turn.shapes[0], MD.turn.shapes[1]];
    // turn off: kept as drawn (the star by a turn least travel would erase, the gear by a small one)
    let r = verify('drawn turn: star, turn off', starDrawn, {}).r;
    check('drawn turn: a star turned a tip keeps turning (turn off: as drawn)', travel(r.paths[0], r.paths[1]) > 100 && r.keys[1].keptDrawn && Math.round(r.keys[1].drawn) === 72,
        `${travel(r.paths[0], r.paths[1]).toFixed(0)} px`);
    r = verify('drawn turn: gear, turn off', gearDrawn, {}).r;
    check('drawn turn: a gear turned half a tooth a key turns, not pulses (turn off)', r.keys.slice(1).every((k) => k.keptDrawn) && travel(r.paths[0], r.paths[1]) > 40 && !r.keys[1].symmetric,
        `${travel(r.paths[0], r.paths[1]).toFixed(1)} px`);
    // turn on: swung by the drawn angle, whole all the way
    verify('drawn turn: star, turn on', starDrawn, { rotate: true });
    r = MF.fix(starDrawn, { rotate: true });        // r.paths: the keys unturned, as MF.swing takes them
    check('drawn turn: with turn, the star swings 72 deg and keeps its area', r.turn && Math.abs(r.turn.angles[1] - 72) < 0.5 &&
        Math.abs(area(MF.swing(r.turn, r.paths, 0, 0.5)) / area(starDrawn[0]) - 1) < 0.01, r.turn && r.turn.angles.join('/'));
    r = verify('drawn turn: gear, turn on', gearDrawn, { rotate: true }).r;
    check('drawn turn: with turn, the gear swings 18 deg a key', r.turn && r.turn.angles.every((a, k) => Math.abs(a - 18 * k) < 0.5), r.turn && r.turn.angles.join('/'));
    // a big turn of a shape it doesn't map onto itself (the F at 90 deg): least travel, turn suggested
    r = MF.fix(fDrawn, {});
    check('drawn turn: an F turned 90 deg, turn off, takes least travel (blended as drawn it halves)', !r.keys[1].keptDrawn && Math.round(r.keys[1].drawn) === 90 &&
        area(MF.lerp(r.paths[0], r.paths[1], 0.5)) / area(fDrawn[0]) > 0.9);
    // a key only moved (not turned) is not a drawn turn; nor one with a point nudged
    const moved = polyPath(starPts(5, 150, 60, 0).map(([x, y]) => [x + 40, y + 10])), nudged = polyPath(turnPts(starPts(5, 150, 60, 0), 72).map((p, k) => (k ? p : [p[0] + 8, p[1]])));
    check('drawn turn: a moved key, or a turned one with a point nudged, is no drawn turn', !MF.fix([starDrawn[0], moved], {}).keys[1].drawn && !MF.fix([starDrawn[0], nudged], {}).keys[1].drawn);
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
        KeyframeInterpolationType: { LINEAR: 6612, BEZIER: 6613, HOLD: 6614 },
    };
    const src = fs.readFileSync(path.join(dir, 'out', 'test-build', 'Mask Morph Fixer.jsx'), 'utf8');
    new Function(...Object.keys(env), src)(...Object.values(env));
    const FX = env.$.global.MorphFixer;
    // the guide behind ?: plain words, every setting, short lines once wrapped
    check('guide: named Mask Morph Fixer, with its version', FX.name === 'Mask Morph Fixer' && /^\d+\.\d+\.\d+$/.test(FX.version) &&
        FX.info.indexOf('Mask Morph Fixer ' + FX.version + '\n') === 0, FX.info.split('\n')[0]);
    // headings follow After Effects' theme (AE 27: app.getAppTheme)
    FX.themeOverride = 'light';
    const onLight = FX.headingColor().join();
    FX.themeOverride = 'darkest';
    check('guide: headings black on Light, white on the dark themes', onLight === '0,0,0' && FX.headingColor().join() === '1,1,1');
    FX.themeOverride = null;
    // the time estimate: per key, by drawn points (fitted to After Effects 27, bench/ae-bench.jsx)
    const ms = (n, o) => FX.keyMs(n, o);
    check('estimate: grows with points, saturates at the max, Exact cheaper, turn dearer',
        ms(4, {}) < ms(16, {}) && ms(16, {}) < ms(60, {}) && ms(60, {}) === ms(200, {}) && ms(60, { maxPoints: 24 }) < ms(60, {}) &&
        ms(60, { mode: 'exact' }) < ms(60, {}) / 5 && ms(16, { rotate: true }) > ms(16, {}));
    check('guide: explains every setting', ['Smooth', 'Exact', 'max', 'turn', 'sym'].every((s) => FX.guide.settings.some(([n]) => n === s)));
    check('guide: three steps', FX.guide.steps.length === 3);
    check('guide: no jargon', !/procrustes|tangent|vertex|vertices|interpolat|RMS|bezier split|fraction/i.test(FX.info), FX.info);
    const wrapped = FX.wrap(FX.guide.settings[3][1], 58);
    check('guide: wrap keeps every word and the width', wrapped.join(' ') === FX.guide.settings[3][1] && wrapped.every((l) => l.length <= 58), wrapped.join(' | '));
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
    // a layer at a scale: { property('ADBE Transform Group').property('ADBE Scale') }
    const scaledLayer = (sc) => ({
        name: 'Scaled', index: 2, parent: null,
        property: () => ({ property: () => ({ value: [sc, sc, 100], numKeys: 0 }) }),
    });
    const keys = MD.keys.map(([, s]) => MD.shapes[s]);
    let p = mockPath(keys);
    let rep = FX.fix(p);
    check('AE half: all keys fixed', rep.keys === keys.length && rep.to <= 100, FX.summary(rep));
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
    // the 0.1 px promise holds on screen: a layer at 400 % is rebuilt 4x tighter in its own units
    const big = scaledLayer(400);
    p = mockPath(keys, { propertyGroup: () => big });
    rep = FX.fix(p);
    check('on screen: at 400 % the max 100 stops it, and the status says how close (in comp px)', rep.capped && rep.to === 100 &&
        Math.abs(rep.deviation - rep.pathDeviation * 4) < 1e-9 && rep.deviation > 0.1, FX.summary(rep));
    p = mockPath(keys, { propertyGroup: () => big });
    rep = FX.fix(p, { maxPoints: 400 });
    check('on screen: a layer at 400 % is fixed within 0.1 comp px (max 400)', rep.scale === 4 && rep.deviation <= 0.1 && rep.pathDeviation <= 0.025 && rep.to > 64,
        `scale ${rep.scale}, ${rep.pathDeviation.toFixed(4)} units = ${rep.deviation.toFixed(4)} px, ${rep.to} points`);
    check('on screen: the report says so', /on screen \(it is scaled to 400 %\)/.test(FX.summary(rep)), FX.summary(rep));
    const small = scaledLayer(25);
    p = mockPath(keys, { propertyGroup: () => small });
    rep = FX.fix(p);
    check('on screen: a layer at 25 % needs fewer points', rep.scale === 0.25 && rep.deviation <= 0.1 && rep.to < 64, `${rep.to} points, ${rep.deviation.toFixed(4)} px`);
    console.log(`on screen: 400 % -> ${FX.fix(mockPath(keys, { propertyGroup: () => big })).to} points, 100 % -> 64, 25 % -> ${rep.to}`);

    // crossovers in the report, on real type: a into e gets a start that keeps it from pinching
    // into lobes, and the report says so; a step no start can untangle is named
    const artKeys = (name) => MF.matchPieces(buildArt(ART_CASES.find((c) => c.name.startsWith(name)))).keys.map((row) => row[0]);
    rep = FX.fix(mockPath(artKeys('a into e')));
    check('crossover: a into e gets a start chosen so it does not cross itself, and says so', rep.untangled === 1 && !rep.crossing.length &&
        /1 start chosen so the shape does not cross itself/.test(FX.summary(rep)), FX.summary(rep));
    const noX = FX.fix(mockPath(artKeys('a into e')), { crossover: false });
    check('crossover: without the check, a into e keeps the start that travels least', noX.untangled === 0, FX.summary(noX));
    console.log('crossover: ' + FX.summary(rep));
    // symmetry in the report, and the panel's option passed through
    rep = FX.fix(mockPath([polyPath(starPts(5, 150, 60, 0)), polyPath(starPts(5, 150, 60, 36))]));
    check('symmetry: the report says a start was chosen so it morphs symmetrically', rep.symmetric === 1 && /1 start chosen so it morphs symmetrically/.test(FX.summary(rep)), FX.summary(rep));
    const p20 = [polyPath(plusPts(20, 150, 0)), polyPath(plusPts(20, 150, 45))];
    check('symmetry: the option forces it (sym ticked)', FX.fix(mockPath(p20)).symmetric === 0 && FX.fix(mockPath(p20), { symmetry: 'force' }).symmetric === 1);
    // keys drawn as a turn, in the report (turn off)
    rep = FX.fix(mockPath([polyPath(starPts(5, 150, 60, 0)), polyPath(turnPts(starPts(5, 150, 60, 0), 72))]));
    check('drawn turn: the report says it was kept, and that turn would swing it', /drawn as a 72 deg turn, kept that way \(tick turn to swing it without shrinking/.test(FX.summary(rep)), FX.summary(rep));
    rep = FX.fix(mockPath([MD.turn.shapes[0], MD.turn.shapes[1]]));
    check('drawn turn: the report suggests turn for an F turned 90 deg', /drawn as a 90 deg turn: tick turn to swing it/.test(FX.summary(rep)), FX.summary(rep));
    console.log('drawn turn: ' + FX.summary(rep));
    const said = FX.summary({ label: 'L', keys: 3, from: '4', to: '64', reversed: 0, moved: 0, untangled: 0, crossing: ['2-3'], mode: 'smooth', deviation: 0.05, scale: 1 });
    check('crossover: a step no start untangles is named', /still crosses itself between keys 2-3 \(no start avoids it; a key drawn in between can\)/.test(said), said);

    // the turn written into the path, on a mock timeline: labelled in-betweens one a frame, no
    // transform; fixing again replaces them with the same; moving a drawn key and fixing again
    // retimes the turn; fixing without turn takes them away
    const LIN = 6612, BEZ = 6613, HOLD = 6614;
    function mockTimeline(shapes, times, fps = 24) {
        const layer = { name: 'Shape Layer 1', index: 1, containingComp: { frameDuration: 1 / fps } };
        const K = shapes.map((P, k) => ({ t: times[k], v: toShape(P), inT: BEZ, outT: BEZ, label: 0 }));
        const mix = (a, b, u) => a.map((p, j) => [p[0] + (b[j][0] - p[0]) * u, p[1] + (b[j][1] - p[1]) * u]);
        const blend = (a, b, u) => Object.assign(new Shape(), { vertices: mix(a.vertices, b.vertices, u), inTangents: mix(a.inTangents, b.inTangents, u), outTangents: mix(a.outTangents, b.outTangents, u), closed: a.closed });
        return {
            name: 'Path', matchName: 'ADBE Vector Shape', propertyType: 6212, propertyValueType: 6419, propertyDepth: 1,
            expression: '', expressionEnabled: true, selectedKeys: [], parentProperty: null, K,
            get numKeys() { return K.length; },
            keyTime: (k) => K[k - 1].t, keyValue: (k) => K[k - 1].v, setValueAtKey(k, s) { K[k - 1].v = s; },
            keyLabel: (k) => K[k - 1].label, setLabelAtKey(k, l) { K[k - 1].label = l; },
            keyInInterpolationType: (k) => K[k - 1].inT, keyOutInterpolationType: (k) => K[k - 1].outT,
            setInterpolationTypeAtKey(k, a, b = a) { K[k - 1].inT = a; K[k - 1].outT = b; },
            removeKey(k) { K.splice(k - 1, 1); },
            nearestKeyIndex(t) {
                let best = 0;
                K.forEach((q, i) => { if (Math.abs(q.t - t) < Math.abs(K[best].t - t)) best = i; });
                return best + 1;
            },
            setValuesAtTimes(ts, vs) {
                ts.forEach((t, j) => {
                    const q = K.find((x) => Math.abs(x.t - t) < 1e-9);
                    if (q) q.v = vs[j];
                    else K.push({ t, v: vs[j], inT: BEZ, outT: BEZ, label: 0 });
                });
                K.sort((a, b) => a.t - b.t);
            },
            // After Effects' blend: straight lines, the time eased unless both sides are linear
            valueAtTime(t) {
                if (t <= K[0].t) return K[0].v;
                for (let k = 1; k < K.length; k++) {
                    if (t >= K[k].t) continue;
                    const a = K[k - 1], b = K[k];
                    if (a.outT === HOLD) return a.v;
                    let u = (t - a.t) / (b.t - a.t);
                    if (!(a.outT === LIN && b.inT === LIN)) u = u * u * (3 - 2 * u);
                    return blend(a.v, b.v, u);
                }
                return K[K.length - 1].v;
            },
            propertyGroup: () => layer,
        };
    }
    {
        const fShapes = MD.turn.keys.map(([, s]) => MD.turn.shapes[s]), fTimes = MD.turn.keys.map(([t]) => t);
        const inside = (a, b) => Math.round((b - a) * 24) - 1;       // frames strictly between two keys
        let want = 0;
        for (let k = 0; k + 1 < fShapes.length; k++) if (MD.turn.keys[k][1] !== MD.turn.keys[k + 1][1]) want += inside(fTimes[k], fTimes[k + 1]);
        const tl = mockTimeline(fShapes, fTimes);
        const drawnK = () => tl.K.filter((q) => q.label === 0), betweenK = () => tl.K.filter((q) => q.label !== 0);
        let r1 = FX.fix(tl, { rotate: true });
        check('turn into the path: one labelled, linear in-between a frame through every turning step', r1.baked === want && betweenK().length === want &&
            betweenK().every((q) => q.label === 15 && q.inT === LIN && q.outT === LIN), `${r1.baked} of ${want}; ` + FX.summary(r1));
        check('turn into the path: the drawn keys keep their times and easing', drawnK().length === fShapes.length &&
            drawnK().every((q, k) => q.t === fTimes[k] && q.inT === BEZ && q.outT === BEZ));
        const snap = tl.K.map((q) => ({ t: q.t, v: q.v.vertices.map((p) => p.slice()) }));
        let r2 = FX.fix(tl, { rotate: true }), dMax = 0;
        tl.K.forEach((q, i) => q.v.vertices.forEach((p, j) => { dMax = Math.max(dMax, Math.hypot(p[0] - snap[i].v[j][0], p[1] - snap[i].v[j][1])); }));
        check('turn into the path: fixing again replaces the in-betweens with the same ones', r2.removed === want && r2.baked === want && r2.kept &&
            tl.K.length === snap.length && tl.K.every((q, i) => Math.abs(q.t - snap[i].t) < 1e-9) && dMax < 1e-9, `${dMax.toExponential(1)} px; ` + FX.summary(r2));
        console.log('turn into the path, fixed again: ' + FX.summary(r2));
        // retime: the drawn key at 1.5 s moved to 1.25 s, then fixed again
        drawnK().find((q) => q.t === 1.5).t = 1.25;
        tl.K.sort((a, b) => a.t - b.t);
        const r3 = FX.fix(tl, { rotate: true }), want3 = want - inside(0.5, 1.5) + inside(0.5, 1.25);
        const stale = betweenK().filter((q) => q.t > 1.25 && q.t < 2);
        check('turn into the path: move a drawn key and fix again, the turn is retimed', r3.baked === want3 && betweenK().length === want3 && !stale.length,
            `${r3.baked} of ${want3}, ${stale.length} left after the moved key`);
        const r4 = FX.fix(tl);
        check('turn into the path: fixed without turn, the in-betweens go', r4.removed === want3 && tl.K.length === fShapes.length && /removed the/.test(FX.summary(r4)), FX.summary(r4));
    }
}

// ---- the keys After Effects stored (written by make-demo.jsx in test mode), if present ----
{
    const f = path.join(dir, 'out', 'ae', 'ae-keys.txt');
    if (fs.existsSync(f)) {
        // the file holds AE's inputs (the Before keys) then its outputs (the After keys)
        const rows = fs.readFileSync(f, 'utf8').trim().split(/\r?\n/).map((l) => new Function('return ' + l)());
        const n = rows.length / 2, input = rows.slice(0, n), ae = rows.slice(n);
        const node = MF.fix(input, { maxPoints: MD.maxPoints }).paths;
        let worst = 0;
        for (let k = 0; k < node.length; k++) worst = Math.max(worst, same(node[k], ae[k]));
        check('Node, fixing the keys AE held, computes what AE stored (to 32-bit float)', worst < 1e-4, worst);
        console.log(`keys stored by After Effects vs Node on the same inputs: largest difference ${worst.toExponential(1)} px over ${ae.length} keys of ${ae[0].v.length} points`);
    }
}

console.log(fails ? `${fails} of ${checks} checks FAILED` : `all ${checks} checks pass`);
process.exit(fails ? 1 : 0);
