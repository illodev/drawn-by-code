// Loads the film's modules in Node (no browser, no GL) to measure geometry: where rings,
// doors and the structure are at a given story time, and where the camera is. Usage:
//   node sandbox/2026-09-26-pyramid-engraving/tools/geo.mjs '<js expression using the modules>'
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
const scene = fs.readFileSync(path.join(ROOT, 'sandbox/2026-09-26-pyramid-engraving/scene.js'), 'utf8');
const uses = JSON.parse(scene.match(/uses:\s*(\[[^\]]*\])/)[1].replace(/'/g, '"'));
const ctx = vm.createContext({ console, Math, Float32Array, Uint16Array, Uint32Array, Map, Set, document: { createElement: () => ({ getContext: () => null }) } });
let src = fs.readFileSync(path.join(ROOT, 'engine/core.js'), 'utf8') + '\n';
for (const u of uses) src += fs.readFileSync(path.join(ROOT, u), 'utf8') + '\n';
// classic scripts: top-level const are not globals of the context; export them explicitly
const names = [...src.matchAll(/^const (\w+) = /gm)].map((m) => m[1]);
src += `\n;globalThis.__m = { ${names.join(', ')} };`;
vm.runInContext(src, ctx, { filename: 'film-bundle.js' });
Object.assign(ctx, ctx.__m);
const out = vm.runInContext(process.argv[2] ?? 'Object.keys(__m)', ctx);
console.log(typeof out === 'string' ? out : JSON.stringify(out, (k, v) => (typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v)));
