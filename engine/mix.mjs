// Mixes music + sound effects placed at the exact second. Only needs ffmpeg.
//
//   node engine/mix.mjs <audio.json> [output.wav]
//
// audio.json (paths relative to the json itself):
//   {
//     "music": "music.mp3", "musicDb": -2, "musicFrom": 0,    // optional
//     "duration": 6.5,                                         // optional: trims/pads
//     "sfxDir": "../../assets/sfx",
//     "cues": [["pop", 1.0, -10], ["stamp", 2.5, -4]],         // [effect, second, dB]
//     "align": "onset"                                         // optional, see below
//   }
// With "align": "onset" a cue's second is when its hit is heard, not when the file starts:
// each effect is moved earlier by its onset (first sample above 10 % of its peak), so a
// page turn that starts 0.16 s into its file still lands on the drawing of the contact.
// A soft limiter keeps everything below -1 dBFS. The default output is mix.wav next to
// the json; render.mjs picks it up on its own if the scene declares audio: { mix: 'mix.wav' }.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { findFfmpeg } from './browser.mjs';

const [cfgPath, outArg] = process.argv.slice(2);
if (!cfgPath) {
    console.error('Usage: node engine/mix.mjs <audio.json> [output.wav]');
    process.exit(1);
}
const ffmpeg = findFfmpeg();
if (!ffmpeg) throw new Error('Missing ffmpeg');
const base = path.dirname(path.resolve(cfgPath));
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const out = outArg ?? path.join(base, 'mix.wav');
const sfxDir = path.resolve(base, cfg.sfxDir ?? '../../assets/sfx');
const inputs = [], chains = [], labels = [];
let n = 0;
if (cfg.music) {
    inputs.push('-ss', String(cfg.musicFrom ?? 0), '-i', path.resolve(base, cfg.music));
    chains.push(`[${n}:a]aresample=44100,aformat=channel_layouts=stereo,volume=${cfg.musicDb ?? -2}dB[m]`);
    labels.push('[m]');
    n++;
}
// seconds from the start of the file to the first sample above 10 % of the peak
function onset(f) {
    const r = spawnSync(ffmpeg, ['-v', 'error', '-i', f, '-ac', '1', '-ar', '8000', '-f', 's16le', '-'], { maxBuffer: 1e8 });
    const s = new Int16Array(r.stdout.buffer, r.stdout.byteOffset, r.stdout.length >> 1);
    let pk = 0;
    for (const v of s) pk = Math.max(pk, Math.abs(v));
    const i = s.findIndex((v) => Math.abs(v) > pk * 0.1);
    return Math.max(0, i) / 8000;
}
for (const [name, at, db] of cfg.cues ?? []) {
    const f = path.join(sfxDir, `${name}.mp3`);
    if (!fs.existsSync(f)) throw new Error(`Effect not found: ${f}`);
    inputs.push('-i', f);
    const ms = Math.max(0, Math.round((at - (cfg.align === 'onset' ? onset(f) : 0)) * 1000));
    chains.push(`[${n}:a]aresample=44100,aformat=channel_layouts=stereo,volume=${db}dB,adelay=${ms}|${ms}[s${n}]`);
    labels.push(`[s${n}]`);
    n++;
}
if (!n) throw new Error('No music and no effects: nothing to mix');
let graph = chains.join(';') + `;${labels.join('')}amix=inputs=${n}:normalize=0:duration=longest,alimiter=limit=0.89`;
if (cfg.duration) graph += `,apad,atrim=0:${cfg.duration}`;
graph += '[out]';
const r = spawnSync(ffmpeg, ['-v', 'error', '-y', ...inputs, '-filter_complex', graph, '-map', '[out]', '-ar', '44100', out], { stdio: 'inherit' });
if (r.status !== 0) process.exit(r.status ?? 1);
console.log(`${out} · ${(cfg.cues ?? []).length} effects${cfg.music ? ' + music' : ''}`);
