// Mixes music + sound effects placed at the exact second. Only needs ffmpeg.
//
//   node engine/mix.mjs <audio.json> [output.wav]
//
// audio.json (paths relative to the json itself):
//   {
//     "music": "music.mp3", "musicDb": -2, "musicFrom": 0,    // optional
//     "duration": 6.5,                                         // optional: trims/pads
//     "sfxDir": "../../assets/sfx",
//     "cues": [["pop", 1.0, -10], ["stamp", 2.5, -4]]          // [effect, second, dB]
//   }
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
for (const [name, at, db] of cfg.cues ?? []) {
    const f = path.join(sfxDir, `${name}.mp3`);
    if (!fs.existsSync(f)) throw new Error(`Effect not found: ${f}`);
    inputs.push('-i', f);
    const ms = Math.max(0, Math.round(at * 1000));
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
