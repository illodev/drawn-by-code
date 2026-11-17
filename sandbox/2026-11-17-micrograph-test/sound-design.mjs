// micrograph-test · the ticking, synthesised. The user asked for no sound effects: «just the
// music, with the ticking of time». So this is all there is besides the score and the
// narrator: a clock, and the instrument's own count while it steps through the sections.
// Deterministic (seeded), so the .wav is not committed: run this to make it again.
//
//   node sandbox/2026-11-17-micrograph-test/sound-design.mjs [out.wav]
//
// What it writes (film seconds):
//   0.5–36.5   the clock: one tick a second, on the half seconds (so every cut of the film
//              falls on a tick: they are beats of the score's 120 BPM), tick and tock in turn
//   6.5–11.5   the serial sections: one lighter tick per slice, eight a second (the score's
//              sixteenth notes), the first of every four a little stronger
// (Round 3 also had the column's hum, a relay and air at every change of magnification, the
// phage's taps, ratchet and snap, the bud's pop: all removed in round 4; see the history.)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SR = 44100, DUR = 37.5, N = Math.round(SR * DUR);
const L = new Float32Array(N), R = new Float32Array(N);
const rng = (seed) => { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
const smooth = (x) => x * x * (3 - 2 * x);
const db = (d) => Math.pow(10, d / 20);
const add = (i, l, r) => { if (i >= 0 && i < N) { L[i] += l; R[i] += r; } };
const TAU = 2 * Math.PI;
// a damped resonance: clicks, ticks, taps (f Hz, decay in ms)
function tick(t, f, ms, gain, pan = 0.5) {
    const i0 = Math.round(t * SR), n = Math.round(ms * 6 * SR / 1000);
    for (let k = 0; k < n; k++) {
        const s = Math.sin(TAU * f * k / SR) * Math.exp(-k / (ms * SR / 1000)) * gain * Math.min(1, k / 8);
        add(i0 + k, s * Math.cos(pan * Math.PI / 2) * 1.2, s * Math.sin(pan * Math.PI / 2) * 1.2);
    }
}
// ---- the clock: tick, tock, a second apart, each a hair different
{
    const r = rng(101);
    for (let n = 0; n <= 36; n++) {
        const tock = n % 2 === 1;
        tick(0.5 + n, (tock ? 680 : 940) * (1 + 0.02 * (r() - 0.5)), tock ? 10 : 9, db(tock ? -8 : -7) * (0.9 + 0.2 * r()), 0.5);
        tick(0.5 + n + 0.0015, (tock ? 2300 : 3100), 1.6, db(-17), 0.5);          // the escapement's click on top of the wood
    }
}
// ---- the serial sections: a tick per slice
{
    const r = rng(404);
    for (let n = 0; n < 40; n++) {
        const strong = n % 4 === 0;
        tick(6.5 + n / 8 + 0.004 * (r() - 0.5), 1450 + 450 * r(), 5, db(strong ? -13 : -16) * (0.85 + 0.3 * r()), 0.35 + 0.3 * r());
    }
}

// 16-bit stereo WAV
const out = process.argv[2] ?? path.join(path.dirname(fileURLToPath(import.meta.url)), 'out', 'sound-design.wav');
fs.mkdirSync(path.dirname(out), { recursive: true });
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
let peak = 0;
for (let i = 0; i < N; i++) {
    peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i])) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i])) * 32767), 46 + i * 4);
}
fs.writeFileSync(out, buf);
console.log(`${out} · ${DUR} s · peak ${(20 * Math.log10(peak)).toFixed(1)} dBFS`);
