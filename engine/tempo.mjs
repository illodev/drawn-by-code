// Tempo and structure of an audio file, to cut music by bars without listening to it.
//
//   node engine/tempo.mjs music.mp3
//
// Prints the estimated BPM (onset autocorrelation; reads ~2 % low: a 120 BPM track reads
// ~117.5), the phase of the first beat, and the loudness per half second (dB), where drops,
// silences and endings show as jumps.
import { spawnSync } from 'node:child_process';
import { findFfmpeg } from './browser.mjs';
const f = process.argv[2], SR = 11025;
const r = spawnSync(findFfmpeg(), ['-v', 'error', '-i', f, '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], { maxBuffer: 1 << 28 });
const x = new Float32Array(r.stdout.buffer, r.stdout.byteOffset, r.stdout.length / 4);
const hop = 256, frames = Math.floor(x.length / hop), en = new Float32Array(frames);
for (let i = 0; i < frames; i++) { let s = 0; for (let k = 0; k < hop; k++) s += x[i * hop + k] ** 2; en[i] = Math.sqrt(s / hop); }
const on = en.map((v, i) => (i ? Math.max(0, v - en[i - 1]) : 0));
const fps = SR / hop;
let best = [0, 0];
for (let bpm = 80; bpm <= 160; bpm += 0.25) {
    const lag = (60 / bpm) * fps; let s = 0;
    for (let i = Math.ceil(lag); i < frames; i++) { const j = i - lag, j0 = Math.floor(j), fr = j - j0; s += on[i] * (on[j0] * (1 - fr) + on[j0 + 1] * fr); }
    if (s > best[1]) best = [bpm, s];
}
console.log('bpm', best[0]);
// loudness per half second
const row = []; for (let t = 0; t < x.length / SR; t += 0.5) { let s = 0, n = 0; for (let i = Math.floor(t * fps); i < Math.floor((t + 0.5) * fps) && i < frames; i++) (s += en[i], n++); row.push((20 * Math.log10(s / Math.max(1, n) + 1e-9)).toFixed(0)); }
console.log('dB per 0.5 s:', row.join(' '));
// strongest onsets and phase
const beats = []; const L = (60 / best[0]) * fps; let bestP = [0, 0];
for (let p = 0; p < L; p += 0.25) { let s = 0; for (let t = p; t < frames; t += L) s += on[Math.round(t)] || 0; if (s > bestP[1]) bestP = [p, s]; }
console.log('first beat at', (bestP[0] / fps).toFixed(3), 's');
