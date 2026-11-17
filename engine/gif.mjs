// A looping GIF from a video, for READMEs: one or several clips joined, scaled down, with a
// shared palette. Only needs ffmpeg.
//
//   node engine/gif.mjs <video.mp4> <out.gif> [--clips 10-16,24-26.5] [--width 480] [--fps 12]
//                       [--colors 128] [--frame 480x270]
//
// --clips picks the moments that tell the video (a 50 s film → a 10 s montage); without it the
// whole video is used. Keep a README GIF under ~5 MB: shorter clips, a smaller width or fewer
// colours.
// --frame makes the GIF exactly that size whatever the video's shape: the picture is fitted
// whole inside it and what is left over is filled with a blurred, dimmed copy of itself. The
// README's gallery uses 480x270 for every film, so its mosaic is one grid (a square film
// stands in the middle of its tile).
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { findFfmpeg } from './browser.mjs';

const args = process.argv.slice(2);
const pos = args.filter((a, i) => !a.startsWith('--') && !(args[i - 1] ?? '').startsWith('--'));
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const [src, out] = pos;
if (!src || !out) {
    console.error('Usage: node engine/gif.mjs <video.mp4> <out.gif> [--clips a-b,c-d] [--width 480] [--fps 12] [--colors 128] [--frame 480x270]');
    process.exit(1);
}
const ffmpeg = findFfmpeg();
if (!ffmpeg) throw new Error('Missing ffmpeg');
const width = +opt('width', 480), fps = +opt('fps', 12), colors = +opt('colors', 128);
const clips = opt('clips') ? opt('clips').split(',').map((c) => c.split('-').map(Number)) : null;
const frame = opt('frame') ? opt('frame').split('x').map(Number) : null;
// the picture at its size: --width keeps the video's shape, --frame fits it into an exact one
const size = (inn, out) => {
    if (!frame) return `${inn}scale=${width}:-2:flags=lanczos${out}`;
    const [fw, fh] = frame;
    return `${inn}split[f0][f1];[f0]scale=${fw}:${fh}:force_original_aspect_ratio=increase:flags=bilinear,crop=${fw}:${fh},gblur=sigma=16,eq=brightness=-0.1:saturation=0.85[fbg];` +
        `[f1]scale=${fw}:${fh}:force_original_aspect_ratio=decrease:flags=lanczos[ffg];[fbg][ffg]overlay=(W-w)/2:(H-h)/2${out}`;
};
let graph;
if (clips) {
    const parts = clips.map(([a, b], i) => `[0:v]trim=${a}:${b},setpts=PTS-STARTPTS,fps=${fps}[c${i}]`);
    graph = parts.join(';') + ';' + clips.map((_, i) => `[c${i}]`).join('') + `concat=n=${clips.length}:v=1:a=0[j];` + size('[j]', '[v]');
} else graph = `[0:v]fps=${fps}[j];` + size('[j]', '[v]');
graph += `;[v]split[a][b];[a]palettegen=max_colors=${colors}:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle`;
const r = spawnSync(ffmpeg, ['-v', 'error', '-y', '-i', src, '-filter_complex', graph, '-loop', '0', out]);
if (r.status !== 0) throw new Error(String(r.stderr));
console.log(`${out} · ${(fs.statSync(out).size / 1e6).toFixed(1)} MB`);
