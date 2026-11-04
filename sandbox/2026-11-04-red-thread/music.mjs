// Synthesized score for red-thread (style test: «The kite», 7 s). No samples, no licences,
// deterministic: the same code always writes the same file.
//
//   node sandbox/2026-11-04-red-thread/music.mjs   → mix.wav (next to this file, not committed)
//
// Instruments: a koto (Karplus-Strong plucked string with a bright attack and a slight
// pitch bend after the pluck, as koto players press the string), a breathy flute
// (shakuhachi-like: a sine with breath noise, slow vibrato and a soft attack), wind (filtered
// noise swelling with the gust) and water (low, slowly moving noise). Scale: Japanese «in»
// on D (D Eb G A Bb), sad and open. 60 BPM: one beat = 1 s, as the scene.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SR = 44100, DUR = 7.0;
const N = Math.round(SR * DUR);
const L = new Float32Array(N), R = new Float32Array(N);
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
let seed = 11;
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * 2 - 1;

// scene times (keep in sync with scene.js)
const T_GUST = 1.5, T_LOOK = 3.7, T_CATCH = 5.0;

function add(i, l, r) {
    if (i >= 0 && i < N) { L[i] += l; R[i] += r; }
}
const panLR = (v, p) => [v * Math.cos((p + 1) * Math.PI / 4), v * Math.sin((p + 1) * Math.PI / 4)];

// koto: Karplus-Strong with a pressed-string bend (oshide) after the attack
function koto(t0, midi, gain = 0.5, pan = 0, bend = 0) {
    const f0 = hz(midi);
    let len = Math.round(SR / f0);
    const buf = new Float32Array(len + 2);
    for (let i = 0; i < buf.length; i++) buf[i] = rnd() * 0.9 + (i < len / 2 ? 0.4 : -0.4);
    const n = Math.round(SR * 3.5), i0 = Math.round(t0 * SR);
    let p = 0, last = 0;
    for (let k = 0; k < n; k++) {
        const t = k / SR;
        // the press: pitch rises by `bend` semitones between 0.25 and 0.6 s
        const b = bend * Math.min(1, Math.max(0, (t - 0.25) / 0.35));
        const curLen = SR / (f0 * Math.pow(2, b / 12));
        const j = Math.floor(p) % len, j2 = (j + 1) % len;
        const v = buf[j];
        const nv = 0.4985 * (v + buf[j2]);
        buf[j] = nv;
        p += len / curLen;
        const a = Math.min(1, k / 30) * Math.exp(-t * 0.9);
        const s = (v * 0.85 + last * 0.15) * a * gain;
        last = v;
        const [l, r] = panLR(s, pan);
        add(i0 + k, l, r);
    }
}

// shakuhachi-like flute: breathy, soft attack, vibrato growing over the note
function flute(t0, dur, midi, gain = 0.2, pan = 0) {
    const f = hz(midi), i0 = Math.round(t0 * SR), n = Math.round(dur * SR);
    let ph = 0, lp = 0;
    for (let k = 0; k < n; k++) {
        const t = k / SR;
        const env = Math.min(1, t / 0.35) * Math.min(1, (dur - t) / 0.6);
        const vib = 1 + 0.006 * Math.min(1, t / 1.2) * Math.sin(2 * Math.PI * 5 * t);
        ph += (2 * Math.PI * f * vib) / SR;
        lp += (rnd() - lp) * 0.08;   // breath: low-passed noise
        const v = (Math.sin(ph) + 0.18 * Math.sin(2 * ph) + 0.06 * Math.sin(3 * ph)) * (0.8 + 0.2 * Math.sin(t * 2.3)) + lp * 0.9 * (0.4 + 0.6 * Math.exp(-t * 2));
        const [l, r] = panLR(v * env * gain, pan);
        add(i0 + k, l, r);
    }
}

// wind and water: noise through a one-pole filter, shaped by an envelope fn(t)
function noiseBed(envFn, cut, gain, pan = 0, lfo = 0) {
    let a = 0, b = 0;
    for (let k = 0; k < N; k++) {
        const t = k / SR;
        const c = cut * (1 + lfo * Math.sin(t * 1.7));
        a += (rnd() - a) * c;
        b += (a - b) * c;
        const [l, r] = panLR((a - b * 0.5) * envFn(t) * gain, pan + 0.3 * Math.sin(t * 0.9));
        add(k, l, r);
    }
}

// --- the cue ---------------------------------------------------------------------------
// in scale on D: D Eb G A Bb
const D = 62, IN = [0, 1, 5, 7, 8];
const note = (deg, oct = 0) => D + IN[((deg % 5) + 5) % 5] + 12 * (oct + Math.floor(deg / 5));

// water under everything, wind that swells with the gust
noiseBed(() => 0.5, 0.015, 0.5, -0.2);
noiseBed((t) => 0.15 + 0.85 * Math.exp(-Math.pow((t - (T_GUST + 0.9)) / 1.0, 2)), 0.06, 0.45, 0, 0.4);

// koto: a slow, sparse figure on the beats; it leans forward with the gust
koto(0.0, note(0, -1), 0.45, -0.3);
koto(0.5, note(2), 0.3, 0.1);
koto(1.0, note(1), 0.32, -0.1, 1);       // Eb pressed up to E: the ache of the in scale
koto(T_GUST, note(4, -1), 0.4, 0.2);
koto(T_GUST + 0.25, note(0), 0.3, 0.3);
koto(T_GUST + 0.5, note(2), 0.3, 0.4);
koto(T_GUST + 0.75, note(3), 0.3, 0.5);
koto(3.0, note(4), 0.32, 0.3);
koto(3.5, note(3), 0.28, 0.2);
koto(T_LOOK, note(1, 1), 0.3, 0.4, 1);  // the boy looks up
koto(4.5, note(0), 0.3, 0.1);
// the catch: a low open fifth on the koto and the flute's long note
koto(T_CATCH, note(0, -1), 0.5, -0.2);
koto(T_CATCH + 0.02, note(3, -1), 0.4, 0.2);
koto(T_CATCH + 0.04, note(0), 0.32, 0);
flute(T_CATCH - 0.15, 2.15, note(3), 0.17, 0.1);

// --- master: soft limit, fade, write ----------------------------------------------------
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const g = 0.7 / (peak || 1);
const out = Buffer.alloc(44 + N * 4);
out.write('RIFF', 0); out.writeUInt32LE(36 + N * 4, 4); out.write('WAVE', 8);
out.write('fmt ', 12); out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(2, 22);
out.writeUInt32LE(SR, 24); out.writeUInt32LE(SR * 4, 28); out.writeUInt16LE(4, 32); out.writeUInt16LE(16, 34);
out.write('data', 36); out.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
    const t = i / SR, fade = Math.min(1, t / 0.3) * Math.min(1, (DUR - t) / 0.8);
    const s = (v) => Math.max(-32767, Math.min(32767, Math.round(Math.tanh(v * g * 1.2) * fade * 32767)));
    out.writeInt16LE(s(L[i]), 44 + i * 4);
    out.writeInt16LE(s(R[i]), 46 + i * 4);
}
const dir = path.dirname(fileURLToPath(import.meta.url));
fs.writeFileSync(path.join(dir, 'mix.wav'), out);
console.log('mix.wav', DUR + ' s', 'peak gain', g.toFixed(3));
