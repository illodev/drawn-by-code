// State carried between frames, over the whole film: every sampled frame is painted, then the frame
// before it and the frame itself again; a scene that adds to a shared object paints the second
// one differently. (engine/review.mjs tests three frames; this tests one every `--every` seconds.)
//   node sandbox/2026-11-11-runnin-down-a-dream/tools/check-state.mjs [scene.js] [--every 0.5] [--from s] [--to s]
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openScene, parseArgs } from '../../../engine/browser.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const { pos, opt } = parseArgs(process.argv.slice(2), []);
const scene = pos[0] ?? path.join(here, '..', 'scene.js');
const { page, info, close } = await openScene(scene, { size: 480 });
const { fps, total } = info, every = Number(opt.every ?? 0.5);
const from = Math.round(Number(opt.from ?? 0) * fps), to = Math.min(total - 1, opt.to !== undefined ? Math.round(Number(opt.to) * fps) : total - 1);
const hash = async (i) => crypto.createHash('sha1').update(await page.evaluate((i) => {
    window.renderFrame(i);
    return document.getElementById('c').toDataURL('image/png');
}, i)).digest('hex');
const bad = [];
for (let i = from; i <= to; i += Math.max(1, Math.round(every * fps))) {
    const a = await hash(i);
    await page.evaluate((j) => window.renderFrame(j), Math.max(0, i - 1));
    await page.evaluate((j) => window.renderFrame(j), i);
    const b = await hash(i);
    if (a !== b) bad.push((i / fps).toFixed(2));
    if (((i - from) / Math.max(1, Math.round(every * fps))) % 40 === 0) process.stdout.write(`\r${(i / fps).toFixed(0)} / ${(to / fps).toFixed(0)} s, ${bad.length} bad`);
}
console.log(`\n${bad.length ? 'STATE CARRIED at ' + bad.join(', ') + ' s' : 'no state carried between frames'}`);
await close();
process.exit(bad.length ? 1 : 0);
