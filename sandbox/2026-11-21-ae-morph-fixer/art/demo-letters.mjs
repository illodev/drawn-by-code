// demo-letters.mjs - writes ../demo-letters.js, the letters section of the demo: q, e, b, c and d
// in Comic Neue Bold (read from the repo's fonts/ by ttf.mjs), each centred on its own box. Each
// step shows one thing the fix does with a letter's hole: q into e, it blends (it keeps its
// margin; a start chosen against a crossover); e into b, blended it would come too close to the
// edge, so it shrinks away and grows again in its new place; b into c, it shrinks away before
// the c opens; c into d, it grows once the d has closed round it. (AE's non-zero fill paints
// any part of a hole outside its outline: a dark blob.) The c has no hole: its key gets a dot.
// make-demo.jsx (After Effects) and scene.js (the preview) both load the file: plain ES3, `var ML`.
//   node sandbox/2026-11-21-ae-morph-fixer/art/demo-letters.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadFont, charPaths } from './ttf.mjs';

const here = path.dirname(fileURLToPath(import.meta.url)), dir = path.join(here, '..');
const FONT = 'ComicNeue-Bold', CHARS = 'qebcd', SIZE = 560, HOLD = 0.5, MORPH = 1.4;
const font = loadFont(path.join(dir, '..', '..', 'fonts', FONT + '.ttf'));
const r3 = (x) => Math.round(x * 1000) / 1000;
const round = (P) => ({ v: P.v.map((p) => p.map(r3)), i: P.i.map((p) => p.map(r3)), o: P.o.map((p) => p.map(r3)), closed: true });
const dot = () => {
    const d = 0.05, v = [[-d, -d], [d, -d], [d, d], [-d, d]];
    return { v, i: v.map(() => [0, 0]), o: v.map(() => [0, 0]), closed: true };
};
const letters = [...CHARS].map((ch) => charPaths(font, ch, SIZE).map(round));
const most = Math.max(...letters.map((P) => P.length));
const shapes = letters.map((P) => {
    const row = P.slice();
    while (row.length < most) row.push(dot());
    return row;
});
const keys = [];
for (let s = 0; s < shapes.length; s++) {
    keys.push([r3(s * (HOLD + MORPH)), s]);
    if (s < shapes.length - 1) keys.push([r3(s * (HOLD + MORPH) + HOLD), s]);
}
const duration = r3((shapes.length - 1) * (HOLD + MORPH) + HOLD + 0.4);
const spec = { font: FONT, chars: CHARS, duration, maxPoints: 200, keys, shapes };      // big type: max 200
fs.writeFileSync(path.join(dir, 'demo-letters.js'),
    `// demo-letters.js - written by art/demo-letters.mjs (don't edit): the letters section of the\n` +
    `// demo, ${CHARS.split('').join(' -> ')} in ${FONT}, ${most} pieces a key (dots where a letter has fewer).\n` +
    `// keys: [time, shape index], Easy Ease; shapes[k][piece]: AE-style paths, centred.\n` +
    `var ML = ${JSON.stringify(spec)};\n`);
console.log(`demo-letters.js: ${shapes.length} letters, ${most} pieces each, ${duration} s`);
