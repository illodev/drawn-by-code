// Synthesized music for the promo: 50 s at 120 BPM, bright and warm (marimba, soft kick,
// claps, shaker, round bass, glockenspiel), with no samples or licenses. Sections follow the
// edit in scene.js: a busy build over the chaos, a riser into the cloud with a snap of
// silence, the groove from the invoice on (a new colour per block), a final hit on the end
// card that rings out. Deterministic: the same code gives the same file.
//
//   node sandbox/2026-09-24-saas-promo/music.mjs   → music.wav (next to this file)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SR = 44100, DUR = 50, BPM = 120, BEAT = 60 / BPM;
const N = SR * DUR;
const L = new Float32Array(N), R = new Float32Array(N);
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
let seed = 11;
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * 2 - 1;
const env = (t, a, d) => (t < 0 ? 0 : t < a ? t / a : Math.exp(-(t - a) / d));

// sections (seconds), as EDIT in scene.js
const S = { chaos: [0, 6], cloud: [6, 10], invoice: [10, 16], expenses: [16, 21], collections: [21, 27], taxes: [27, 33], business: [33, 38], compliance: [38, 43], close: [43, 50] };
const inS = (t, k) => t >= S[k][0] && t < S[k][1];

function note(t0, dur, fn, gain = 1, pan = 0) {
    const i0 = Math.floor(t0 * SR), n = Math.floor(dur * SR);
    for (let k = 0; k < n; k++) {
        const i = i0 + k;
        if (i < 0 || i >= N) continue;
        const v = fn(k / SR) * gain;
        L[i] += v * (1 - Math.max(0, pan));
        R[i] += v * (1 + Math.min(0, pan));
    }
}
const kick = (t) => Math.sin(2 * Math.PI * (48 * t + 70 * (1 - Math.exp(-t * 28)) / 28)) * env(t, 0.002, 0.16);
const clap = (t) => {
    let v = 0;
    for (const d of [0, 0.011, 0.022]) v += rnd() * env(t - d, 0.001, d === 0.022 ? 0.07 : 0.008);
    return v * 0.6;
};
const shaker = (t) => rnd() * env(t, 0.004, 0.02);
const marimba = (f) => (t) => (Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(2 * Math.PI * f * 4 * t) * Math.exp(-t * 30)) * env(t, 0.002, 0.28);
const glock = (f) => (t) => (Math.sin(2 * Math.PI * f * t) + 0.4 * Math.sin(2 * Math.PI * f * 2.76 * t) * Math.exp(-t * 8)) * env(t, 0.001, 0.6);
const bass = (f) => (t) => (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(4 * Math.PI * f * t)) * env(t, 0.008, 0.3);

// C major, I–V–vi–IV (one chord per 4-beat bar)
const CHORDS = [[48, 52, 55], [43, 47, 50], [45, 48, 52], [41, 45, 48]];
const chordAt = (t) => CHORDS[Math.floor(t / (4 * BEAT)) % 4];
const RIFF = [0, 2, 1, 2, 0, 2, 1, 2]; // chord tones, eighth notes
const groove = (t) => t >= 10 && t < 46;

for (let e = 0; e < DUR / (BEAT / 2); e++) {
    const t = e * BEAT / 2, onBeat = e % 2 === 0, b = Math.floor(e / 2), ch = chordAt(t);
    // chaos: marimba in busy staccato, rising an octave for the last bar, shaker
    if (inS(t, 'chaos')) {
        const up = t >= 4 ? 12 : 0;
        note(t, 0.3, marimba(hz(ch[RIFF[e % 8]] + 24 + up)), 0.32, e % 2 ? 0.3 : -0.3);
        note(t + BEAT / 4, 0.05, shaker, 0.06, 0.4);
        if (onBeat) note(t, 0.3, kick, t >= 3 ? 0.35 : 0.22);
        if (onBeat && b % 2 === 1) note(t, 0.2, clap, 0.22);
    }
    // groove from the invoice to the end card
    if (groove(t)) {
        if (onBeat) note(t, 0.4, kick, 0.5);
        if (onBeat && b % 2 === 1) note(t, 0.3, clap, 0.28, 0.1);
        note(t + BEAT / 4, 0.05, shaker, 0.07, 0.4);
        note(t, 0.3, marimba(hz(ch[RIFF[e % 8]] + 24)), 0.2, e % 2 ? 0.3 : -0.3);
        if (onBeat || e % 4 === 3) note(t, BEAT * 0.45, bass(hz(ch[0] - 12)), 0.34);
        // a new colour per block
        if ((inS(t, 'expenses') || inS(t, 'taxes')) && e % 4 === 2) note(t, 0.8, glock(hz(ch[2] + 36)), 0.08, 0.5);
        if (inS(t, 'collections') && e % 8 === 6) note(t, 0.6, glock(hz(ch[1] + 36)), 0.09, -0.5);
        if ((inS(t, 'business') || inS(t, 'compliance')) && !onBeat) note(t, 0.2, marimba(hz(ch[1] + 36)), 0.06, -0.4);
    }
}

// pad: soft chord bed (sines), louder in the groove; the cloud riser; the end chord
for (let i = 0; i < N; i++) {
    const t = i / SR;
    const ch = chordAt(t);
    let s = 0;
    const lvl = inS(t, 'chaos') ? 0.4 : groove(t) ? 0.6 : 0;
    if (lvl) for (const m of ch) s += Math.sin(2 * Math.PI * hz(m + 12) * t) * 0.03 * lvl;
    // cloud: a rising filtered-noise whoosh and pitch sweep, a snap of silence at 9.5
    if (inS(t, 'cloud') && t < 9.5) {
        const u = (t - 6) / 3.5;
        s += Math.sin(2 * Math.PI * (220 + 880 * u * u) * t) * 0.12 * u + rnd() * 0.12 * u * u;
        for (const m of CHORDS[0]) s += Math.sin(2 * Math.PI * hz(m + 12) * t) * 0.07 * (1 - u * 0.4);
    }
    // end card: the final chord rings out from 46 s
    if (t >= 46) {
        const u = t - 46;
        for (const m of [48, 52, 55, 60, 64]) s += Math.sin(2 * Math.PI * hz(m + 12) * t) * 0.04 * Math.exp(-u / 1.8);
    }
    L[i] += s;
    R[i] += s;
}
// hits: the drop at 10, the end card at 46 (kick + clap + glock chord)
for (const t of [10, 46]) {
    note(t, 0.5, kick, 0.7);
    note(t, 0.4, clap, 0.35);
    for (const m of [60, 64, 67, 72]) note(t, 2.5, glock(hz(m + 12)), 0.07);
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
