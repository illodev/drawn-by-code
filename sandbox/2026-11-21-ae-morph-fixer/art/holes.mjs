// holes.mjs - letters whose holes close, open or stray, as After Effects draws them on the
// morph's own clock (top row of each pair: non-zero fill, so a hole outside its outline is a
// dark blob, ringed in orange) and as the fix keeps them inside (below: a closing hole gone
// before the letter opens, an opening one started once it is shut, a straying one shrunk).
// Seven moments a morph. To out/art/holes.png.
//   node sandbox/2026-11-21-ae-morph-fixer/art/holes.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { findChrome, ROOT } from '../../../engine/browser.mjs';
import { build } from './cases.mjs';

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
const CASES = [
    ['O into C: the hole closes', 'ComicNeue-Bold', 'OC'],
    ['C into e: the hole opens', 'ComicNeue-Bold', 'Ce'],
    ['b into e: the hole strays', 'ComicNeue-Bold', 'be'],
    ['R into 6: the hole strays', 'PatrickHand-Regular', 'R6'],
    ['d into e: the hole strays a little', 'PatrickHand-Regular', 'de'],
];
const US = [0, 0.2, 0.35, 0.5, 0.65, 0.8, 1], CELL = 170, S = 0.36;
let body = '', y = 0;
for (const [name, font, keys] of CASES) {
    const res = MF.matchPieces(build({ font, keys, size: 400 }));
    const fixed = res.keys[0].map((_, p) => MF.fix(res.keys.map((row) => row[p]), { maxPoints: 100 }).paths);
    const T = MF.holeTiming(fixed, res.roles);
    const note = T.map((t) => t.dip ? `shrinks to ${Math.round(t.low * 100)} %` : t.closes ? `gone by ${Math.round(t.by * 100)} %` : `opens from ${Math.round(t.from * 100)} %`).join(', ');
    for (const [label, own] of [['on the morph\'s clock (After Effects as it was)', false], [`kept inside: ${note || 'nothing to do'}`, true]]) {
        body += `<text x="8" y="${y + 18}" font-size="15" font-family="sans-serif">${name} · ${label}</text>`;
        US.forEach((u, j) => {
            const cx = j * CELL + CELL / 2, cy = y + 32 + CELL / 2, outl = [], holes = [];
            fixed.forEach((F, p) => {
                const hole = res.roles[0][p] === -1 || res.roles[1][p] === -1, t = own && T.find((e) => e.piece === p);
                const P = t ? MF.holeAt(t, F[0], F[1], u) : MF.lerp(F[0], F[1], u);
                (hole ? holes : outl).push(P);
            });
            body += `<g transform="translate(${cx},${cy}) scale(${S})"><path d="${[...outl, ...holes].map(d).join(' ')}" fill="#22304a" fill-rule="nonzero"/>`;
            for (const H of holes) if (MF.holeOutside(H, outl) > 0) body += `<path d="${d(H)}" fill="none" stroke="#e8661f" stroke-width="${3 / S}"/>`;
            body += '</g>';
            body += `<text x="${cx}" y="${y + 32 + CELL + 2}" font-size="12" text-anchor="middle" font-family="sans-serif">u ${u}</text>`;
        });
        y += CELL + 46;
    }
    y += 10;
}
const W = US.length * CELL, svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${y}" style="background:#f3efe7">${body}</svg>`;
const browser = await chromium.launch({ executablePath: findChrome() });
const page = await browser.newPage({ viewport: { width: W, height: y } });
await page.setContent(`<body style="margin:0">${svg}</body>`);
fs.mkdirSync(path.join(dir, 'out', 'art'), { recursive: true });
await page.screenshot({ path: path.join(dir, 'out', 'art', 'holes.png') });
await browser.close();
console.log(`out/art/holes.png (${ROOT ? 'ok' : ''})`);
