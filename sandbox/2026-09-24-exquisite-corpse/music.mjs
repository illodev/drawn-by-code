// Synthesized music for the exquisite corpse: 30 s at 120 BPM, with no samples or
// licenses. Each segment has its own texture, and the changes land on the same beats as
// the scene's cuts. Deterministic: the same code gives the same file.
//
//   node sandbox/2026-09-24-exquisite-corpse/music.mjs   → music.wav (next to this file)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SR = 44100, DUR = 30, BPM = 120, BEAT = 60 / BPM;
const N = SR * DUR;
const L = new Float32Array(N), R = new Float32Array(N);
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
let seed = 7;
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * 2 - 1;

// Segments (in seconds), same as `shots` in scene.js
const S = { frog: [0, 5], eye: [5, 6.5], mushroom: [6.5, 10.5], engulf: [10.5, 12], jellyfish: [12, 16.5], vortex: [16.5, 18], kaleido: [18, 22], frame: [22, 23.5], doodle: [23.5, 27.5], paperBall: [27.5, 28.5], back: [28.5, 30] };
const inS = (t, k) => t >= S[k][0] && t < S[k][1];
const env = (t, a, d) => (t < 0 ? 0 : t < a ? t / a : Math.exp(-(t - a) / d));

function add(i, l, r = l) {
    if (i >= 0 && i < N) {
        L[i] += l;
        R[i] += r;
    }
}
function note(t0, dur, fn, gain = 1, pan = 0) {
    const i0 = Math.floor(t0 * SR), n = Math.floor(dur * SR);
    for (let k = 0; k < n; k++) {
        const t = k / SR, v = fn(t) * gain;
        add(i0 + k, v * (1 - pan) * 0.5 + v * 0.5 * (pan < 0 ? 1 : 1 - pan), v * (1 + pan) * 0.5 + v * 0.5 * (pan > 0 ? 1 : 1 + pan));
    }
}
const kick = (t) => Math.sin(2 * Math.PI * (50 * t + 90 * (1 - Math.exp(-t * 30)) / 30)) * env(t, 0.002, 0.18);
const snare = (t) => (rnd() * 0.7 + Math.sin(2 * Math.PI * 190 * t) * 0.3) * env(t, 0.001, 0.09);
const hat = (t) => rnd() * env(t, 0.001, 0.025);
const saw = (f, t) => 2 * ((f * t) % 1) - 1;
const pluck = (f) => (t) => (saw(f, t) * 0.5 + Math.sin(2 * Math.PI * f * t)) * env(t, 0.003, 0.18);
const bass = (f) => (t) => (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(4 * Math.PI * f * t)) * env(t, 0.01, 0.35);
const sitar = (f) => (t) => {
    // buzzing string: harmonics that gradually open up
    let v = 0;
    for (let h = 1; h <= 7; h++) v += Math.sin(2 * Math.PI * f * h * t + Math.sin(t * 6) * 0.3 * h) / h;
    return v * env(t, 0.005, 0.5) * (1 + 0.3 * Math.sin(2 * Math.PI * 5.5 * t));
};

// D Dorian: D E F G A B C
const D = 50, SCALE = [0, 2, 3, 5, 7, 9, 10, 12];
const deg = (d, oct = 0) => D + SCALE[((d % 7) + 7) % 7] + 12 * (oct + Math.floor(d / 7));

for (let b = 0; b < DUR / BEAT; b++) {
    const t = b * BEAT;
    const full = inS(t, 'mushroom') || inS(t, 'kaleido');
    // drums: come in hard on the mushroom and the climax; the jellyfish floats with no kick
    if (full || inS(t, 'doodle')) note(t, 0.4, kick, full ? 0.55 : 0.3);
    if (full && b % 2 === 1) note(t, 0.2, snare, 0.35);
    if (full || inS(t, 'jellyfish') || inS(t, 'doodle')) {
        note(t + BEAT / 2, 0.05, hat, 0.12, 0.4);
        if (inS(t, 'kaleido')) note(t + BEAT / 4, 0.05, hat, 0.08, -0.4);
    }
    // bass in eighth notes
    if (full || inS(t, 'jellyfish')) {
        const line = [0, 0, 3, 4, 0, 0, 5, 4];
        note(t, BEAT * 0.9, bass(hz(deg(line[b % 8], -1))), 0.35);
    }
    // sitar arpeggio on the mushroom, the climax and the return
    if (inS(t, 'mushroom') || inS(t, 'kaleido') || inS(t, 'frog') || inS(t, 'back')) {
        const arp = [0, 4, 7, 9, 7, 4, 2, 4];
        const soft = inS(t, 'frog') || inS(t, 'back');
        for (let h = 0; h < (inS(t, 'kaleido') ? 2 : 1); h++) note(t + h * BEAT / 2, BEAT * 1.5, sitar(hz(deg(arp[(b * 2 + h) % 8], 1))), soft ? 0.2 : 0.14, (b % 2 ? 0.3 : -0.3));
    }
    // playful pizzicato on the doodle
    if (inS(t, 'doodle')) note(t + BEAT / 2, 0.3, pluck(hz(deg([4, 2, 5, 7][b % 4], 1))), 0.12, 0.2);
}

// pad: two detuned saws with a slowly sweeping filter (the «wah»)
let lp = 0, lp2 = 0;
for (let i = 0; i < N; i++) {
    const t = i / SR;
    const quiet = inS(t, 'paperBall') ? 0.15 : inS(t, 'frame') ? 0.6 : 1;
    const root = hz(inS(t, 'jellyfish') || inS(t, 'vortex') ? deg(3, 0) : deg(0, 0));
    let v = saw(root, t) + saw(root * 1.005, t) + saw(root * 1.5, t) * 0.6;
    const cut = 0.02 + 0.05 * (0.5 + 0.5 * Math.sin(t * 0.9));
    lp += (v - lp) * cut;
    lp2 += (lp - lp2) * cut;
    let s = lp2 * 0.13 * quiet;
    // risers: the eye and the vortex are rising noise and pitch sweeps
    for (const k of ['eye', 'vortex']) {
        if (inS(t, k)) {
            const u = (t - S[k][0]) / (S[k][1] - S[k][0]);
            s += Math.sin(2 * Math.PI * (200 + 1200 * u * u) * t) * 0.05 * u + rnd() * 0.04 * u;
        }
    }
    if (inS(t, 'engulf')) {
        const u = (t - S.engulf[0]) / 1.5;
        s += rnd() * 0.07 * Math.sin(u * Math.PI);
    }
    L[i] += s;
    R[i] += s;
}

// normalize to -1 dBFS and write the WAV (16-bit, stereo)
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const g = 0.89 / peak;
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0);
buf.writeUInt32LE(36 + N * 4, 4);
buf.write('WAVEfmt ', 8);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write('data', 36);
buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * g)) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * g)) * 32767), 46 + i * 4);
}
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), 'music.wav');
fs.writeFileSync(out, buf);
console.log(out);
