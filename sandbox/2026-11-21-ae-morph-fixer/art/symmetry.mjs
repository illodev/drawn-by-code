// symmetry.mjs - morphs between shapes that share a mirror axis, as the fixer leaves them: the
// least-travel match (top row of each pair) and the symmetric one it takes (below; the thin
// plus only with the sym option), at five moments, with a dozen points' paths. Filled
// non-zero like an After Effects shape fill. To out/art/symmetry.png.
//   node sandbox/2026-11-21-ae-morph-fixer/art/symmetry.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { findChrome } from '../../../engine/browser.mjs';

const here = path.dirname(fileURLToPath(import.meta.url)), dir = path.join(here, '..');
const MF = new Function(fs.readFileSync(path.join(dir, 'morph-math.js'), 'utf8') + '\nreturn MF;')();
const poly = (pts) => ({ v: pts, i: pts.map(() => [0, 0]), o: pts.map(() => [0, 0]), closed: true });
const turn = (pts, d) => { const a = d * Math.PI / 180; return pts.map(([x, y]) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)]); };
const star = (n, R, r, rot) => { const p = []; for (let k = 0; k < 2 * n; k++) { const a = (rot - 90 + k * 180 / n) * Math.PI / 180, rr = k % 2 ? r : R; p.push([rr * Math.cos(a), rr * Math.sin(a)]); } return p; };
const plus = (w, L, rot) => turn([[-w, -L], [w, -L], [w, -w], [L, -w], [L, w], [w, w], [w, L], [-w, L], [-w, w], [-L, w], [-L, -w], [-w, -w]], rot);
const d = (P) => {
    let s = `M${P.v[0][0].toFixed(2)},${P.v[0][1].toFixed(2)}`;
    for (let k = 0; k < P.v.length; k++) {
        const a = P.v[k], b = P.v[(k + 1) % P.v.length], o = P.o[k], i = P.i[(k + 1) % P.v.length];
        s += ` C${(a[0] + o[0]).toFixed(2)},${(a[1] + o[1]).toFixed(2)} ${(b[0] + i[0]).toFixed(2)},${(b[1] + i[1]).toFixed(2)} ${b[0].toFixed(2)},${b[1].toFixed(2)}`;
    }
    return s + 'Z';
};
const CASES = [
    ['a star into itself turned 36°', [poly(star(5, 150, 60, 0)), poly(star(5, 150, 60, 36))], {}],
    ['a plus into an x', [poly(plus(30, 140, 0)), poly(plus(30, 140, 45))], {}],
    ['a thin plus into an x (sym ticked)', [poly(plus(20, 150, 0)), poly(plus(20, 150, 45))], { symmetry: 'force' }],
];
const US = [0, 0.25, 0.5, 0.75, 1], CELL = 190, COLORS = ['#e8661f', '#2f8f5b', '#4b3a8c', '#b5480b', '#1f6b42', '#8f3a0b'];
let body = '', y = 0;
for (const [name, keys, opt] of CASES) {
    for (const [label, o] of [['least travel', { symmetry: false }], ['symmetric', opt]]) {
        const r = MF.fix(keys, o), A = r.paths[0], B = r.paths[1], s = 0.55;
        body += `<text x="8" y="${y + 18}" font-size="15" font-family="sans-serif">${name}: ${label} (travel ${r.keys[1].after.toFixed(1)} px)</text>`;
        US.forEach((u, j) => {
            const P = MF.lerp(A, B, u), cx = j * CELL + CELL / 2, cy = y + 30 + CELL / 2;
            body += `<g transform="translate(${cx},${cy}) scale(${s})"><path d="${d(P)}" fill="#22304a" fill-rule="nonzero"/></g>`;
            const step = Math.max(1, Math.round(A.v.length / 12));
            for (let k = 0, m = 0; k < A.v.length; k += step, m++) {
                const a = A.v[k], b = B.v[k], p = P.v[k], c = COLORS[m % COLORS.length];
                body += `<line x1="${cx + a[0] * s}" y1="${cy + a[1] * s}" x2="${cx + b[0] * s}" y2="${cy + b[1] * s}" stroke="${c}" stroke-width="1.2" opacity="0.8"/>` +
                    `<circle cx="${cx + p[0] * s}" cy="${cy + p[1] * s}" r="3.2" fill="${c}"/>`;
            }
            body += `<text x="${cx}" y="${y + 30 + CELL + 4}" font-size="12" text-anchor="middle" font-family="sans-serif">u ${u}</text>`;
        });
        y += CELL + 48;
    }
}
const W = US.length * CELL, svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${y}" style="background:#f3efe7">${body}</svg>`;
const browser = await chromium.launch({ executablePath: findChrome() });
const page = await browser.newPage({ viewport: { width: W, height: y } });
await page.setContent(`<body style="margin:0">${svg}</body>`);
fs.mkdirSync(path.join(dir, 'out', 'art'), { recursive: true });
await page.screenshot({ path: path.join(dir, 'out', 'art', 'symmetry.png') });
await browser.close();
console.log('out/art/symmetry.png');
