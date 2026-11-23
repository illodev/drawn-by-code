// look.mjs - draws glyphs as the TrueType reader sees them (fill, even-odd, with their points),
// to out/art/glyphs.png: a check of art/ttf.mjs by eye.
//   node sandbox/2026-11-21-ae-morph-fixer/art/look.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { findChrome, ROOT } from '../../../engine/browser.mjs';
import { loadFont, charPaths } from './ttf.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const d = (P) => {
    let s = `M${P.v[0][0]},${P.v[0][1]}`;
    for (let k = 0; k < P.v.length; k++) {
        const a = P.v[k], b = P.v[(k + 1) % P.v.length], o = P.o[k], i = P.i[(k + 1) % P.v.length];
        s += ` C${a[0] + o[0]},${a[1] + o[1]} ${b[0] + i[0]},${b[1] + i[1]} ${b[0]},${b[1]}`;
    }
    return s + 'Z';
};
const fonts = ['ComicNeue-Bold', 'PatrickHand-Regular', 'Bangers-Regular', 'IMFellDWPicaSC-Regular'];
const chars = 'OCB8ae&@gR';
let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${chars.length * 110}" height="${fonts.length * 120}" style="background:#fff">`;
fonts.forEach((f, r) => {
    const font = loadFont(path.join(ROOT, 'fonts', f + '.ttf'));
    [...chars].forEach((ch, c) => {
        const P = charPaths(font, ch, 90);
        svg += `<g transform="translate(${55 + c * 110},${60 + r * 120})"><path fill="#1f2a44" fill-rule="evenodd" d="${P.map(d).join(' ')}"/>`;
        for (const Q of P) for (const [x, y] of Q.v) svg += `<circle cx="${x}" cy="${y}" r="0.9" fill="#e8661f"/>`;
        svg += '</g>';
    });
});
svg += '</svg>';
fs.mkdirSync(path.join(here, '..', 'out', 'art'), { recursive: true });
const browser = await chromium.launch({ executablePath: findChrome() });
const page = await browser.newPage({ viewport: { width: chars.length * 110, height: fonts.length * 120 } });
await page.setContent(svg);
await page.screenshot({ path: path.join(here, '..', 'out', 'art', 'glyphs.png') });
await browser.close();
console.log('out/art/glyphs.png');
