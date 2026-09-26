// Fits the three cats' poses to the reference, drawing by drawing (15 per second), by
// coordinate descent on low-resolution class maps (cat / ginger / black). Starts from the
// hand keys (Dance.at) or from the previous drawing's fit, stays near both. The result is
// data read off the reference: it goes to private/fit.json (never committed).
//   node sandbox/2026-09-25-felt-cats/fit.mjs --from 2.8 --to 3.2 [--size 144] [--rounds 3]
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { openScene, parseArgs, findFfmpeg } from '../../engine/browser.mjs';

const { opt } = parseArgs(process.argv.slice(2));
const DIR = path.dirname(new URL(import.meta.url).pathname);
const size = Number(opt.size ?? 144), rounds = Number(opt.rounds ?? 3);
const from = Number(opt.from ?? 0), to = Number(opt.to ?? 15.8);
const OUT = path.join(DIR, opt.out ?? 'private/fit.json');
const ffmpeg = findFfmpeg();
const { page, close } = await openScene(path.join(DIR, 'fit.js'), { size });
const { W, H } = await page.evaluate(() => ({ W: FitAPI.W, H: FitAPI.H }));

// reference class maps at the fit's resolution, blurred the same way
function refClasses(t) {
    const fi = Math.min(474, Math.round(t * 30));
    const r = spawnSync(ffmpeg, ['-loglevel', 'error', '-ss', String(fi / 30 + 0.001), '-i', path.join(DIR, 'out/reference.mp4'), '-frames:v', '1', '-vf', `scale=${W}:${H}:flags=area`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1 << 26 });
    const d = r.stdout, N = W * H, m = new Float32Array(3 * N);
    for (let i = 0; i < N; i++) {
        const R = d[i * 3], G = d[i * 3 + 1], B = d[i * 3 + 2];
        const green = G > 150 && G - R > 60 && G - B > 60;
        if (green) continue;
        m[i] = 1;
        if (Math.max(R, G, B) < 70) m[2 * N + i] = 1;
        else if (R - B > 35) m[N + i] = 1;
    }
    return Array.from(m);
}
const fit = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
let prev = null;
const every = Number(opt.every ?? 1);
for (let d = Math.round(from * 15); d <= Math.round(to * 15); d += every) {
    const t = d / 15;
    const ref = refClasses(t);
    const res = await page.evaluate(([ref, t, prev, rounds]) => {
        const D = Dance.at(t);
        // the reference is blurred in the page, with the same code as ours
        const start = prev ?? D.poses;
        return FitAPI.fit(ref, start, start, D.zoom, { rounds });
    }, [ref, t, prev, rounds]);
    prev = res.poses;
    fit[d] = res.poses;
    fs.writeFileSync(OUT, JSON.stringify(fit));
    fs.writeFileSync(OUT.replace(/\.json$/, '-poses.js'), 'var DANCE_FIT = Object.assign(globalThis.DANCE_FIT ?? {}, ' + JSON.stringify(fit) + ');\n');
    console.log(`t=${t.toFixed(2)} loss ${res.first.toFixed(4)} → ${res.loss.toFixed(4)} (${res.evals} renders)`);
}
await close();
