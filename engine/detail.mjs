// The detail gate: compares a scene with its reference zone by zone at full resolution and
// flags what the eye would catch, so nobody has to point it out.
//
//   node engine/detail.mjs <scene.js> <reference.mp4> [--times 1,2.5 | --every 0.5]
//                          [--grid 6] [--from s] [--to s] [--out dir]
//
// For every instant: the scene's frame at the reference's size, split into grid × grid
// tiles, and per tile
//   colour   mean difference of the two images after a blur (shapes, positions, colours)
//   texture  high-frequency energy (the image minus its blur: grain, dots, noise, fine
//            lines) of ours ÷ the reference's: < 1 = ours is smoother, too clean, missing
//            detail; > 1 = noisier or busier
// A tile is flagged when colour > 45 or texture is outside 0.6–1.6. The gate (exit code 0)
// is calibrated on the replica the user approved («I have to zoom in to see differences»:
// what-do-you-love, colour median 9.5, p90 32, texture p5 0.72):
//   colour median ≤ 12 · colour p90 ≤ 35 · tiles too clean ≤ 6 % · tiles too busy ≤ 12 %
// Output: <out>/detail.md (the verdict, then the flagged tiles), tiles.json, and one image
// per instant (reference | ours, flagged tiles boxed: red = colour, yellow = texture).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { findFfmpeg } from './browser.mjs';

const args = process.argv.slice(2);
const pos = args.filter((a, i) => !a.startsWith('--') && !(args[i - 1] ?? '').startsWith('--'));
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const [scene, ref] = pos;
if (!scene || !ref) {
    console.error('Usage: node engine/detail.mjs <scene.js> <reference.mp4> [--times a,b | --every s] [--grid 6] [--out dir]');
    process.exit(2);
}
const ffmpeg = findFfmpeg();
const run = (bin, a, o = {}) => { const r = spawnSync(bin, a, { maxBuffer: 1e9, ...o }); if (r.status !== 0) throw new Error(`${bin} ${a.join(' ')}\n${r.stderr}`); return r.stdout; };
const probe = spawnSync(ffmpeg, ['-i', ref], { encoding: 'utf8' }).stderr;
const [, W, H] = probe.match(/, (\d{2,5})x(\d{2,5})/).map(Number);
const dur = (([, h, m, s]) => +h * 3600 + +m * 60 + +s)(probe.match(/Duration: (\d+):(\d+):([\d.]+)/));
const fps = 24, grid = +opt('grid', 6);
let times = opt('times') ? opt('times').split(',').map(Number) : [];
if (!times.length) { const e = +opt('every', 1), a = +opt('from', 0), b = +opt('to', dur - 0.05); for (let t = a + e / 2; t < b; t += e) times.push(+t.toFixed(3)); }
const out = opt('out', path.join(path.dirname(scene), 'review', 'detail'));
fs.mkdirSync(out, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'detail-'));

// our frames, at the reference's size
run('node', [path.join(path.dirname(new URL(import.meta.url).pathname), 'render.mjs'), scene, '--at', times.join(','), '--size', String(W), '--out', tmp]);
const ours = fs.readdirSync(tmp).filter((f) => f.endsWith('.png'));
const raw = (file, ss) => new Uint8Array(run(ffmpeg, ['-v', 'error', ...(ss != null ? ['-ss', String(ss)] : []), '-i', file, '-frames:v', '1', '-vf', `scale=${W}:${H}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']));
// box blur (separable, radius r) of a grey image
function blur(src, r) {
    const a = new Float32Array(W * H), b = new Float32Array(W * H);
    for (let y = 0; y < H; y++) { let s = 0; for (let x = -r; x <= r; x++) s += src[y * W + Math.min(W - 1, Math.max(0, x))]; for (let x = 0; x < W; x++) { a[y * W + x] = s / (2 * r + 1); s += src[y * W + Math.min(W - 1, x + r + 1)] - src[y * W + Math.max(0, x - r)]; } }
    for (let x = 0; x < W; x++) { let s = 0; for (let y = -r; y <= r; y++) s += a[Math.min(H - 1, Math.max(0, y)) * W + x]; for (let y = 0; y < H; y++) { b[y * W + x] = s / (2 * r + 1); s += a[Math.min(H - 1, y + r + 1) * W + x] - a[Math.max(0, y - r) * W + x]; } }
    return b;
}
const chan = (img, c) => { const g = new Float32Array(W * H); for (let i = 0; i < W * H; i++) g[i] = img[i * 3 + c]; return g; };
const lum = (img) => { const g = new Float32Array(W * H); for (let i = 0; i < W * H; i++) g[i] = 0.3 * img[i * 3] + 0.59 * img[i * 3 + 1] + 0.11 * img[i * 3 + 2]; return g; };
const R = Math.max(2, Math.round(W / 270)); // blur radius ≈ 4 px at 1080: the scale of a halftone dot
const rows = [], boxes = {}, all = [];
let flagged = 0;
for (const t of times) {
    const i = Math.round(t * fps), tt = i / fps;
    const f = ours.find((n) => n === `t_${tt.toFixed(2)}s.png`);
    if (!f) continue;
    const A = raw(ref, tt), B = raw(path.join(tmp, f));
    const bl = (img) => [0, 1, 2].map((c) => blur(chan(img, c), R));
    const [Ab, Bb] = [bl(A), bl(B)];
    const [Al, Bl] = [lum(A), lum(B)], [Alb, Blb] = [blur(Al, R), blur(Bl, R)];
    const tw = W / grid, th = H / grid;
    boxes[tt] = [];
    for (let gy = 0; gy < grid; gy++) for (let gx = 0; gx < grid; gx++) {
        let dc = 0, ea = 0, eb = 0, n = 0;
        for (let y = Math.floor(gy * th); y < Math.floor((gy + 1) * th); y += 2) for (let x = Math.floor(gx * tw); x < Math.floor((gx + 1) * tw); x += 2) {
            const k = y * W + x;
            dc += (Math.abs(Ab[0][k] - Bb[0][k]) + Math.abs(Ab[1][k] - Bb[1][k]) + Math.abs(Ab[2][k] - Bb[2][k])) / 3;
            ea += Math.abs(Al[k] - Alb[k]);
            eb += Math.abs(Bl[k] - Blb[k]);
            n++;
        }
        dc /= n; ea /= n; eb /= n;
        const tex = (eb + 0.5) / (ea + 0.5);
        all.push({ t: tt, gx, gy, colour: +dc.toFixed(1), texture: +tex.toFixed(2), refEnergy: +ea.toFixed(1) });
        const bad = [];
        if (dc > 45) bad.push('colour');
        if (ea > 1.5 && (tex < 0.6 || tex > 1.6)) bad.push(tex < 0.6 ? 'too clean' : 'too busy');
        if (bad.length) {
            flagged++;
            rows.push(`| ${tt.toFixed(2)} | ${gx},${gy} | ${dc.toFixed(0)} | ${tex.toFixed(2)} | ${bad.join(', ')} |`);
            boxes[tt].push([gx, gy, bad.includes('colour') ? 'red' : 'yellow']);
        }
    }
    // the annotated pair: reference | ours, flagged tiles boxed on ours
    const draw = boxes[tt].map(([gx, gy, c]) => `drawbox=x=${Math.round(gx * tw)}:y=${Math.round(gy * th)}:w=${Math.round(tw)}:h=${Math.round(th)}:color=${c}@0.9:t=${Math.max(3, Math.round(W / 300))}`).join(',');
    run(ffmpeg, ['-v', 'error', '-y', '-ss', String(tt), '-i', ref, '-i', path.join(tmp, f), '-filter_complex', `[0:v]scale=${W}:${H},trim=end_frame=1[a];[1:v]scale=${W}:${H}${draw ? ',' + draw : ''}[b];[a][b]hstack,scale=${Math.min(2 * W, 1600)}:-2`, '-frames:v', '1', path.join(out, `t_${tt.toFixed(2)}.jpg`)]);
}
fs.rmSync(tmp, { recursive: true, force: true });
const q = (v, p) => v.length ? v[Math.floor(p * (v.length - 1))] : 0;
const cs = all.map((a) => a.colour).sort((a, b) => a - b), tx = all.filter((a) => a.refEnergy > 1.5).map((a) => a.texture);
const clean = tx.filter((v) => v < 0.6).length / Math.max(1, tx.length), busy = tx.filter((v) => v > 1.6).length / Math.max(1, tx.length);
const checks = [['colour median', q(cs, 0.5), 12], ['colour p90', q(cs, 0.9), 35], ['tiles too clean (%)', clean * 100, 6], ['tiles too busy (%)', busy * 100, 12]];
const pass = checks.every(([, v, lim]) => v <= lim);
const md = `# Detail gate · ${path.basename(path.dirname(scene))}: ${pass ? 'PASS' : 'FAIL'}\n\n${times.length} instants, ${grid}×${grid} tiles.\n\n| check | value | limit |\n|---|---|---|\n${checks.map(([n, v, l]) => `| ${n} | ${v.toFixed(1)} | ≤ ${l} ${v <= l ? '✓' : '✗'} |`).join('\n')}\n\nFlagged tiles: **${flagged}** (colour > 45, or texture outside 0.6–1.6 of the reference).\n\n| t | tile x,y | colour | texture (ours ÷ ref) | why |\n|---|---|---|---|---|\n${rows.join('\n')}\n`;
fs.writeFileSync(path.join(out, 'detail.md'), md);
fs.writeFileSync(path.join(out, 'tiles.json'), JSON.stringify(all));
console.log(md.split('\n').slice(0, 11).join('\n'));
console.log(`→ ${out}/detail.md and t_*.jpg`);
process.exit(pass ? 0 : 1);
