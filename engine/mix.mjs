// Mezcla música + efectos de sonido colocados al segundo exacto. Solo necesita ffmpeg.
//
//   node engine/mix.mjs <audio.json> [salida.wav]
//
// audio.json (rutas relativas al propio json):
//   {
//     "music": "musica.mp3", "musicDb": -2, "musicFrom": 0,   // opcional
//     "duration": 6.5,                                         // opcional: corta/rellena
//     "sfxDir": "../../assets/sfx",
//     "cues": [["pop", 1.0, -10], ["stamp", 2.5, -4]]          // [efecto, segundo, dB]
//   }
// Un limitador suave evita que nada pase de -1 dBFS. La salida por defecto es mezcla.wav
// junto al json; render.mjs la usa sola si la escena declara audio: { mix: 'mezcla.wav' }.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { findFfmpeg } from './browser.mjs';

const [cfgPath, outArg] = process.argv.slice(2);
if (!cfgPath) {
    console.error('Uso: node engine/mix.mjs <audio.json> [salida.wav]');
    process.exit(1);
}
const ffmpeg = findFfmpeg();
if (!ffmpeg) throw new Error('Falta ffmpeg');
const base = path.dirname(path.resolve(cfgPath));
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const out = outArg ?? path.join(base, 'mezcla.wav');
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
    if (!fs.existsSync(f)) throw new Error(`No existe el efecto ${f}`);
    inputs.push('-i', f);
    const ms = Math.max(0, Math.round(at * 1000));
    chains.push(`[${n}:a]aresample=44100,aformat=channel_layouts=stereo,volume=${db}dB,adelay=${ms}|${ms}[s${n}]`);
    labels.push(`[s${n}]`);
    n++;
}
if (!n) throw new Error('Ni música ni efectos: nada que mezclar');
let graph = chains.join(';') + `;${labels.join('')}amix=inputs=${n}:normalize=0:duration=longest,alimiter=limit=0.89`;
if (cfg.duration) graph += `,apad,atrim=0:${cfg.duration}`;
graph += '[out]';
const r = spawnSync(ffmpeg, ['-v', 'error', '-y', ...inputs, '-filter_complex', graph, '-map', '[out]', '-ar', '44100', out], { stdio: 'inherit' });
if (r.status !== 0) process.exit(r.status ?? 1);
console.log(`${out} · ${(cfg.cues ?? []).length} efectos${cfg.music ? ' + música' : ''}`);
