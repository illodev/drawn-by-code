// A film strip from a video: N frames evenly spread over a time range, side by side on a
// dark band with gaps, for READMEs and galleries. Only needs ffmpeg.
//
//   node engine/strip.mjs <video.mp4> <out.jpg> [--from 0] [--to <end>] [--frames 6]
//                         [--height 220] [--at 1.2,3.4,...]
//
// --at picks the exact seconds instead of spreading them (the moments that tell the shot).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { findFfmpeg } from './browser.mjs';

const args = process.argv.slice(2);
const [src, out] = args.filter((a, i) => !a.startsWith('--') && !(args[i - 1] ?? '').startsWith('--'));
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
if (!src || !out) {
    console.error('Usage: node engine/strip.mjs <video.mp4> <out.jpg> [--from s] [--to s] [--frames n] [--height px] [--at s,s,…]');
    process.exit(1);
}
const ffmpeg = findFfmpeg();
if (!ffmpeg) throw new Error('Missing ffmpeg');
const probe = spawnSync(ffmpeg, ['-i', src], { encoding: 'utf8' }).stderr;
const m = probe.match(/Duration: (\d+):(\d+):([\d.]+)/);
const duration = m ? +m[1] * 3600 + +m[2] * 60 + +m[3] : 0;
const from = +opt('from', 0), to = +opt('to', duration), n = +opt('frames', 6), h = +opt('height', 220);
const times = opt('at') ? opt('at').split(',').map(Number) : [...Array(n)].map((_, i) => from + ((i + 0.5) * (to - from)) / n);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'strip-'));
const frames = times.map((t, i) => {
    const f = path.join(tmp, `f${i}.png`);
    const r = spawnSync(ffmpeg, ['-v', 'error', '-y', '-ss', String(t), '-i', src, '-frames:v', '1', '-vf', `scale=-2:${h},pad=iw+12:ih+12:6:6:0x17151b`, f]);
    if (r.status !== 0) throw new Error(`frame at ${t}s: ${r.stderr}`);
    return f;
});
const inputs = frames.flatMap((f) => ['-i', f]);
const graph = frames.map((_, i) => `[${i}]`).join('') + `hstack=inputs=${frames.length},pad=iw+12:ih+12:6:6:0x17151b`;
const r = spawnSync(ffmpeg, ['-v', 'error', '-y', ...inputs, '-filter_complex', frames.length > 1 ? graph : 'pad=iw+12:ih+12:6:6:0x17151b', '-q:v', '3', out]);
if (r.status !== 0) throw new Error(String(r.stderr));
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`${out} · ${times.map((t) => t.toFixed(2)).join(', ')} s`);
