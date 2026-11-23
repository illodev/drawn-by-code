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

const rows = [], forAE = [];
for (const c of CASES) {
    const keys = build(c), K = keys.length, n = keys[0].length, t0 = performance.now();
    let res, err = null;
    const fixed = [];
    try {
        res = MF.matchPieces(keys);
        for (let p = 0; p < n; p++) {
            const col = res.keys.map((row) => row[p]);
            fixed.push(MF.fix(col, { mode: c.mode || 'smooth', maxPoints: c.max || 100, rotate: !!c.rotate }));
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
    check(`${c.name}: every key within 0.1 px (or the max said how close)`, honest, worst.toFixed(3));
    check(`${c.name}: outlines stay outlines, holes stay holes`, roleFlips === 0, `${roleFlips} pieces change role`);
    check(`${c.name}: points travel less around the shapes`, after <= before + 1e-6 || c.rotate, `${before.toFixed(0)} -> ${after.toFixed(0)}`);
    if (c.expect && c.expect.grown) check(`${c.name}: ${c.expect.grown} keys where a piece grows from a point`, res.grown === c.expect.grown, String(res.grown));
    if (c.expect && c.expect.moved) check(`${c.name}: pieces pasted out of order are dealt back`, res.moved > 0, String(res.moved));
    if (c.expect && c.expect.turned) check(`${c.name}: turned ${c.expect.turned} deg`, turned !== null && Math.abs(turned - c.expect.turned) < 1, String(turned));
    const capped = fixed.some((r) => r.capped), fell = fixed.some((r) => r.fellBack);
    rows.push(`| ${c.name} | ${c.font.replace(/-.*/, '')} | ${K} | ${n} | ${keys[0].map((P) => P.v.length).join('/')} → ${pts.join('/')} | ${capped ? '~' + near.toFixed(2) + ' (max)' : fell ? 'kept points' : worst.toFixed(3)} | ${res.moved} / ${res.grown} | ${before.toFixed(0)} → ${after.toFixed(0)} | ${turned === null ? '' : turned.toFixed(0) + '°'} | ${ms.toFixed(0)} |`);
    forAE.push({ name: c.name, keys, mode: c.mode || 'smooth', max: c.max || 100, rotate: !!c.rotate, expect: c.expect || {} });
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
