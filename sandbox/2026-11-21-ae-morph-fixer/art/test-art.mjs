// test-art.mjs - the real-artwork regression set (cases.mjs) through the fixer in Node: pieces
// matched between keys, then every Path property fixed. Checks each case and writes
// out/art/report.md, plus out/art/cases.js (the keys, for art/make-art.jsx to build in AE).
//   node sandbox/2026-11-21-ae-morph-fixer/art/test-art.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CASES, build } from './cases.mjs';

const here = path.dirname(fileURLToPath(import.meta.url)), dir = path.join(here, '..');
const MF = new Function(fs.readFileSync(path.join(dir, 'morph-math.js'), 'utf8') + '\nreturn MF;')();
let fails = 0, checks = 0;
const check = (what, ok, detail) => {
    checks++;
    if (!ok) {
        fails++;
        console.log(`FAIL ${what}${detail !== undefined ? ' · ' + detail : ''}`);
    }
};

// crossovers: an in-between whose outline crosses itself (the shape pinches into lobes). Exact
// enough: each bezier drawn as 4 chords per segment, the morph checked at 19 in-betweens, every
// pair of chords compared. Turned paths are checked on their local keys (the swing turns the
// whole in-between, which can't make it cross). -> steps that cross, where the keys don't
function crossesItself(pts) {
    const n = pts.length;
    for (let i = 0; i < n; i++) {
        const a = pts[i], b = pts[(i + 1) % n];
        for (let j = i + 2; j < n; j++) {
            if (i === 0 && j === n - 1) continue;
            const p = pts[j], q = pts[(j + 1) % n];
            const d1 = (q[0] - p[0]) * (a[1] - p[1]) - (q[1] - p[1]) * (a[0] - p[0]), d2 = (q[0] - p[0]) * (b[1] - p[1]) - (q[1] - p[1]) * (b[0] - p[0]);
            const d3 = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]), d4 = (b[0] - a[0]) * (q[1] - a[1]) - (b[1] - a[1]) * (q[0] - a[0]);
            if (((d1 > 0) !== (d2 > 0)) && ((d3 > 0) !== (d4 > 0))) return true;
        }
    }
    return false;
}
function chords(P) {
    const out = [];
    for (let k = 0; k < MF.segCount(P); k++) {
        const s = MF.seg(P, k);
        for (let t = 0; t < 4; t++) out.push(MF.bez(s, t / 4));
    }
    return out;
}
function crossingSteps(paths) {
    let n = 0;
    for (let k = 0; k + 1 < paths.length; k++) {
        const A = paths[k], B = paths[k + 1];
        if (!A.closed || crossesItself(chords(A)) || crossesItself(chords(B))) continue;
        for (let u = 1; u < 20; u++) {
            if (crossesItself(chords(MF.lerp(A, B, u / 20)))) {
                n++;
                break;
            }
        }
    }
    return n;
}

const rows = [], forAE = [];
for (const c of CASES) {
    const keys = build(c), K = keys.length, n = keys[0].length, t0 = performance.now();
    let res, err = null;
    const fixed = [];
    try {
        res = MF.matchPieces(keys);
        for (let p = 0; p < n; p++) {
            const col = res.keys.map((row) => row[p]);
            fixed.push(MF.fix(col, { mode: c.mode || 'smooth', maxPoints: c.max || 100, rotate: !!c.rotate, crossover: !process.env.NO_CROSSOVER }));
        }
    } catch (e) {
        err = e;
    }
    const ms = performance.now() - t0;
    check(`${c.name}: runs`, !err, err && err.message);
    if (err) continue;
    // (fonts keep a letter's pieces in no particular order: an i lists its dot first, so even
    // unshuffled letters get pieces dealt anew; unit tests in test.mjs check a matching order is kept)
    // every property: the same points in every key, each key within its promise (or the max
    // stopped it and said how close, or it kept the drawn points), the travel cut
    let pts = [], worst = 0, near = 0, honest = true, before = 0, after = 0, roleFlips = 0, turned = null;
    for (let p = 0; p < n; p++) {
        const r = fixed[p], counts = new Set(r.paths.map((P) => P.v.length));
        check(`${c.name}: piece ${p + 1} has the same points in every key`, counts.size === 1, [...counts].join('/'));
        pts.push(r.paths[0].v.length);
        if (r.mode === 'smooth' && !r.capped && !r.fellBack) worst = Math.max(worst, r.deviation);
        if (r.capped) near = Math.max(near, r.deviation);
        if (r.mode === 'smooth' && !r.capped && !r.fellBack && r.deviation > 0.1) honest = false;
        for (let k = 1; k < K; k++) {
            before += r.keys[k].before || 0;
            after += r.keys[k].after || 0;
        }
        // a piece stays an outline or stays a hole across the keys it is present in
        const info = res.keys.map((row) => MF.pieceInfo(row[p])), big = res.keys.map((row) => Math.max(...row.map((P) => MF.pieceInfo(P).size)));
        const roles = info.map((I, k) => (I.size < 0.03 * big[k] ? null : I.sign)).filter((s) => s !== null);
        if (new Set(roles).size > 1) roleFlips++;
        if (r.turn) turned = r.turn.angles[r.turn.angles.length - 1] - r.turn.angles[0];
    }
    // the morph doesn't pinch into lobes where a start traveling about as little avoids it
    // (O into C can't help a small one: as the C's gap opens its outline twists, below what the
    // fix's 64-point check sees; no start avoids it)
    let crossed = 0;
    for (let p = 0; p < n; p++) crossed += crossingSteps(fixed[p].paths);
    const allowed = (c.expect && c.expect.crosses) || 0;
    check(`${c.name}: in-betweens don't cross themselves${allowed ? ` (but in the ${allowed} steps no start avoids)` : ''}`, crossed <= allowed, `${crossed} steps cross`);
    check(`${c.name}: every key within 0.1 px (or the max said how close)`, honest, worst.toFixed(3));
    check(`${c.name}: outlines stay outlines, holes stay holes`, roleFlips === 0, `${roleFlips} pieces change role`);
    check(`${c.name}: points travel less around the shapes`, after <= before + 1e-6 || c.rotate, `${before.toFixed(0)} -> ${after.toFixed(0)}`);
    if (c.expect && c.expect.grown) check(`${c.name}: ${c.expect.grown} keys where a piece grows from a point`, res.grown === c.expect.grown, String(res.grown));
    if (c.expect && c.expect.moved) check(`${c.name}: pieces pasted out of order are dealt back`, res.moved > 0, String(res.moved));
    if (c.expect && c.expect.turned) check(`${c.name}: turned ${c.expect.turned} deg`, turned !== null && Math.abs(turned - c.expect.turned) < 1, String(turned));
    // holes kept inside (MF.holeTiming): one that closes or opens while its letter opens or
    // closes keeps its own clock, one that would stray halfway shrinks there, and no hole shows
    // outside its outline at any of 39 in-betweens a step (AE's fill would paint it: a dark
    // blob). Turned cases are left out: the panel leaves a turning step's holes alone.
    const T = c.rotate ? [] : MF.holeTiming(fixed.map((r) => r.paths), res.roles);
    if (!c.rotate) {
        let shown = 0, where = '';
        for (let k = 0; k + 1 < K; k++) {
            for (let j = 1; j < 40; j++) {
                const u = j / 40, outl = [];
                fixed.forEach((r, p) => { if (res.roles[k][p] !== -1 && res.roles[k + 1][p] !== -1 && (res.roles[k][p] || res.roles[k + 1][p])) outl.push(MF.lerp(r.paths[k], r.paths[k + 1], u)); });
                fixed.forEach((r, p) => {
                    if (res.roles[k][p] !== -1 && res.roles[k + 1][p] !== -1) return;
                    const t = T.find((e) => e.piece === p && e.step === k), o = MF.holeOutside(t ? MF.holeAt(t, r.paths[k], r.paths[k + 1], u) : MF.lerp(r.paths[k], r.paths[k + 1], u), outl);
                    if (o > shown) {
                        shown = o;
                        where = `step ${k + 1}, piece ${p + 1}, u ${u.toFixed(3)}`;
                    }
                });
            }
        }
        check(`${c.name}: no hole shows outside its outline`, shown === 0, `${(shown * 100).toFixed(1)} % of a hole at ${where}`);
    }
    check(`${c.name}: ${(c.expect && c.expect.timed) || 0} holes kept inside (on their own clock, or shrunk)`, T.length === ((c.expect && c.expect.timed) || 0),
        JSON.stringify(T.map((t) => [t.step, t.dip ? 'shrinks ' + t.low.toFixed(2) : t.closes ? 'by ' + t.by.toFixed(2) : 'from ' + t.from.toFixed(2)])));
    const capped = fixed.some((r) => r.capped), fell = fixed.some((r) => r.fellBack);
    rows.push(`| ${c.name} | ${c.font.replace(/-.*/, '')} | ${K} | ${n} | ${keys[0].map((P) => P.v.length).join('/')} → ${pts.join('/')} | ${capped ? '~' + near.toFixed(2) + ' (max)' : fell ? 'kept points' : worst.toFixed(3)} | ${res.moved} / ${res.grown} | ${before.toFixed(0)} → ${after.toFixed(0)} | ${turned === null ? '' : turned.toFixed(0) + '°'} | ${ms.toFixed(0)} |`);
    // node: how Node matched the pieces, for make-art.jsx to compare (ExtendScript once read the
    // area sign wrong and matched O into C by size alone: the hole became the C)
    forAE.push({ name: c.name, keys, mode: c.mode || 'smooth', max: c.max || 100, rotate: !!c.rotate, expect: c.expect || {}, node: { moved: res.moved, grown: res.grown, timed: T.length } });
}

fs.mkdirSync(path.join(dir, 'out', 'art'), { recursive: true });
fs.writeFileSync(path.join(dir, 'out', 'art', 'report.md'), [
    '| Case | Font | Keys | Pieces | Points per piece (first key → fixed) | Worst px | Moved / grown | Travel (px) | Turn | Node ms |',
    '|---|---|---|---|---|---|---|---|---|---|',
    ...rows, '',
].join('\n'));
// the keys as an ExtendScript literal, for art/make-art.jsx
fs.writeFileSync(path.join(dir, 'out', 'art', 'cases.js'), 'var ART = ' + JSON.stringify(forAE) + ';\n');
console.log(rows.join('\n'));
console.log(fails ? `${fails} of ${checks} checks FAILED` : `all ${checks} checks pass (${CASES.length} cases)`);
process.exit(fails ? 1 : 0);
