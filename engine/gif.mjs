// A looping GIF from a video, for READMEs: one or several clips joined, scaled down, with a
// shared palette. Only needs ffmpeg.
//
//   node engine/gif.mjs <video.mp4> <out.gif> [--clips 10-16,24-26.5] [--width 480] [--fps 12]
//                       [--colors 128]
//
// --clips picks the moments that tell the video (a 50 s film → a 10 s montage); without it the
// whole video is used. Keep a README GIF under ~5 MB: shorter clips, a smaller width or fewer
// colours.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { findFfmpeg } from './browser.mjs';

const args = process.argv.slice(2);
const pos = args.filter((a, i) => !a.startsWith('--') && !(args[i - 1] ?? '').startsWith('--'));
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const [src, out] = pos;
if (!src || !out) {
    console.error('Usage: node engine/gif.mjs <video.mp4> <out.gif> [--clips a-b,c-d] [--width 480] [--fps 12] [--colors 128]');
    process.exit(1);
}
const ffmpeg = findFfmpeg();
if (!ffmpeg) throw new Error('Missing ffmpeg');
const width = +opt('width', 480), fps = +opt('fps', 12), colors = +opt('colors', 128);
const clips = opt('clips') ? opt('clips').split(',').map((c) => c.split('-').map(Number)) : null;
const scale = `fps=${fps},scale=${width}:-2:flags=lanczos`;
let graph;
if (clips) {
    const parts = clips.map(([a, b], i) => `[0:v]trim=${a}:${b},setpts=PTS-STARTPTS,${scale}[c${i}]`);
    graph = parts.join(';') + ';' + clips.map((_, i) => `[c${i}]`).join('') + `concat=n=${clips.length}:v=1:a=0[v]`;
} else graph = `[0:v]${scale}[v]`;
graph += `;[v]split[a][b];[a]palettegen=max_colors=${colors}:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle`;
const r = spawnSync(ffmpeg, ['-v', 'error', '-y', '-i', src, '-filter_complex', graph, '-loop', '0', out]);
if (r.status !== 0) throw new Error(String(r.stderr));
console.log(`${out} · ${(fs.statSync(out).size / 1e6).toFixed(1)} MB`);
