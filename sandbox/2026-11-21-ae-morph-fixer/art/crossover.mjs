// crossover.mjs - the in-betweens of real-type morphs with the start that travels least (top
// row of each pair) and with the start the fix takes so the shape doesn't cross itself (below),
// filled non-zero like an After Effects shape fill, outline on top. To out/art/crossover.png.
//   node sandbox/2026-11-21-ae-morph-fixer/art/crossover.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { findChrome } from '../../../engine/browser.mjs';
import { CASES, build } from './cases.mjs';

const here = path.dirname(fileURLToPath(import.meta.url)), dir = path.join(here, '..');
const MF = new Function(fs.readFileSync(path.join(dir, 'morph-math.js'), 'utf8') + '\nreturn MF;')();
const d = (P) => {
    let s = `M${P.v[0][0].toFixed(2)},${P.v[0][1].toFixed(2)}`;
    for (let k = 0; k < P.v.length; k++) {
        const a = P.v[k], b = P.v[(k + 1) % P.v.length], o = P.o[k], i = P.i[(k + 1) % P.v.length];
        s += ` C${(a[0] + o[0]).toFixed(2)},${(a[1] + o[1]).toFixed(2)} ${(b[0] + i[0]).toFixed(2)},${(b[1] + i[1]).toFixed(2)} ${b[0].toFixed(2)},${b[1].toFixed(2)}`;
    }
    return s + 'Z';
};
const US = [0.3, 0.4, 0.45, 0.5, 0.6], CELL = 170, NAMES = ['a into e', 'M into W'];
let rows = '', y = 0;
for (const name of NAMES) {
    const keys = MF.matchPieces(build(CASES.find((c) => c.name.startsWith(name)))).keys.map((row) => row[0]);
    for (const [label, opt] of [['least travel', { crossover: false }], ['no crossover', {}]]) {
        const r = MF.fix(keys, opt), A = r.paths[0], B = r.paths[1];
        rows += `<text x="8" y="${y + 18}" font-size="14" font-family="sans-serif">${name}, ${label}</text>`;
        US.forEach((u, j) => {
            const P = MF.lerp(A, B, u), xs = P.v.map((p) => p[0]), ys = P.v.map((p) => p[1]);
            const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
            const s = (CELL - 40) / Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
            rows += `<g transform="translate(${j * CELL + CELL / 2},${y + 28 + CELL / 2}) scale(${s}) translate(${-cx},${-cy})">` +
                `<path d="${d(P)}" fill="#22304a" fill-rule="nonzero"/><path d="${d(P)}" fill="none" stroke="#e8661f" stroke-width="${1.5 / s}"/></g>` +
                `<text x="${j * CELL + CELL / 2}" y="${y + 28 + CELL + 12}" font-size="12" text-anchor="middle" font-family="sans-serif">u ${u}</text>`;
        });
        y += CELL + 50;
    }
}
const W = US.length * CELL, svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${y}" style="background:#f3efe7">${rows}</svg>`;
const browser = await chromium.launch({ executablePath: findChrome() });
const page = await browser.newPage({ viewport: { width: W, height: y } });
await page.setContent(`<body style="margin:0">${svg}</body>`);
fs.mkdirSync(path.join(dir, 'out', 'art'), { recursive: true });
await page.screenshot({ path: path.join(dir, 'out', 'art', 'crossover.png') });
await browser.close();
console.log('out/art/crossover.png');
