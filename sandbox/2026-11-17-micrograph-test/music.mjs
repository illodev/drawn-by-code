// micrograph-test · the score, synthesised: the fallback for when the generated take is
// not there (it lives in private/, never committed), and the ending that is laid over that
// take, which fades before the title. 120 BPM in D minor: a beat is half a second, so every
// cut of the film is on a beat and the serial sections' eight slices a second are its
// sixteenth notes. Deterministic and licence-free, so the .wav is not committed.
//
//   node sandbox/2026-11-17-micrograph-test/music.mjs [out.wav]
//   node sandbox/2026-11-17-micrograph-test/music.mjs [out.wav] --ending    only the last
//       shot's chord and the title's bells, to lay over the generated take (mix-sound.sh)
//
//   0–6.5     Naegleria  a low fifth on D swelling with the beam; D minor opens at 2 s, as the colour comes
//   6.5–11.5  Mito       B flat, and a marimba in sixteenth notes: one note per slice
//   11.5–15.5 Section    F major seventh, calm
//   15.5–21.5 Phage      G minor; a low note as the baseplate sits (18.1 s); a suspended A, and a
//                        phrase that falls while the head empties (19.1–20.7 s)
//   21.5–25.5 Stain      one glassy D minor ninth, hushed
//   25.5–31.5 Budding    B flat then C, the sixteenths again, growing; a bright accent as the bud pinches off (29.6 s)
//   31.5–37.5 Dark       a wide D minor; bells on the title (35.0 s); rung out by 37.4 s
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SR = 44100, DUR = 37.5, TAIL = 0, N = Math.round(SR * (DUR + TAIL));
const L = new Float32Array(N), R = new Float32Array(N);
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const db = (d) => Math.pow(10, d / 20);
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
const smooth = (x) => x * x * (3 - 2 * x);
const rng = (seed) => { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const rnd = rng(1711);
const ONLY_ENDING = process.argv.includes('--ending');
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));

// A pad voice: one note as two slightly detuned stacks of harmonics, one per side, each
// breathing at its own slow rate. env(t) → 0..1 loudness, bright(t) → 0 dark … 1 open.
function pad(midi, t0, t1, env, bright, gainDb, harmonics = 7) {
    const f = hz(midi), g = db(gainDb), det = 0.0018 + 0.0012 * rnd();
    const lfoL = 0.07 + 0.09 * rnd(), lfoR = 0.07 + 0.09 * rnd(), phL = rnd() * 6.283, phR = rnd() * 6.283;
    const ph = Array.from({ length: harmonics }, () => rnd() * 6.283);
    const i0 = Math.max(0, Math.round(t0 * SR)), i1 = Math.min(N, Math.round(t1 * SR));
    for (let i = i0; i < i1; i++) {
        const t = i / SR, e = env(t);
        if (e <= 0) continue;
        const b = bright(t), p = 2.6 - 1.5 * b;      // the roll-off of the harmonics
        let l = 0, r = 0;
        for (let n = 1; n <= harmonics; n++) {
            if (f * n > 9000) break;
            const a = Math.pow(n, -p);
            l += a * Math.sin(2 * Math.PI * f * (1 - det) * n * t + ph[n - 1]);
            r += a * Math.sin(2 * Math.PI * f * (1 + det) * n * t + ph[n - 1] * 1.3);
        }
        L[i] += l * e * g * (0.8 + 0.2 * Math.sin(2 * Math.PI * lfoL * t + phL));
        R[i] += r * e * g * (0.8 + 0.2 * Math.sin(2 * Math.PI * lfoR * t + phR));
    }
}
// A struck glass / bell note: a few inharmonic partials, the upper ones dying first.
function bell(midi, t0, gainDb, pan, decay = 2.2) {
    const f = hz(midi), g = db(gainDb), ratios = [1, 2.0, 3.01, 4.17, 5.43], amps = [1, 0.45, 0.22, 0.1, 0.05];
    const i0 = Math.round(t0 * SR), i1 = Math.min(N, i0 + Math.round(decay * 5 * SR));
    for (let i = i0; i < i1; i++) {
        const t = (i - i0) / SR, att = Math.min(1, t / 0.004);
        let s = 0;
        for (let k = 0; k < ratios.length; k++) if (f * ratios[k] < 12000) s += amps[k] * Math.sin(2 * Math.PI * f * ratios[k] * t) * Math.exp(-t / (decay / (1 + 0.9 * k)));
        L[i] += s * att * g * Math.cos(pan * Math.PI / 2);
        R[i] += s * att * g * Math.sin(pan * Math.PI / 2);
    }
}
// envelope helpers: up over [a, b], held, down over [c, d]
const arc = (a, b, c, d) => (t) => smooth(seg(t, a, b)) * (1 - smooth(seg(t, c, d)));
const flat = (v) => () => v;

if (!ONLY_ENDING) {
// ---- Naegleria (0–6.5)
for (const m of [38, 45]) pad(m, 0, 7.6, arc(0, 2.6, 6.2, 7.6), (t) => 0.1 + 0.25 * seg(t, 2.0, 6.5), -19);
pad(81, 1.2, 7.2, arc(1.2, 3.4, 6.0, 7.2), flat(0), -33, 2);
for (const m of [50, 53, 57]) pad(m, 2.0, 7.4, arc(2.0, 3.6, 6.2, 7.4), (t) => 0.2 + 0.4 * seg(t, 2.0, 6.0), -22);
// ---- Mito (6.5–11.5): one marimba note per slice, the first of every four a little stronger
for (const m of [34, 46, 53]) pad(m, 6.3, 12.4, arc(6.3, 7.2, 11.2, 12.4), flat(0.2), -22);
{
    const fig = [74, 77, 82, 77, 74, 77, 81, 77];
    for (let n = 0; n < 40; n++) bell(fig[n % 8], 6.5 + n / 8, (n % 4 === 0 ? -19 : -23) + 3 * seg(n, 0, 39), 0.3 + 0.4 * ((n * 7) % 5) / 4, 0.22);
}
// ---- Section (11.5–15.5)
for (const m of [41, 48, 57, 64]) pad(m, 11.3, 16.4, arc(11.3, 12.4, 15.2, 16.4), flat(0.3), -21);
// ---- Phage (15.5–21.5)
for (const m of [43, 50, 58]) pad(m, 15.3, 19.4, arc(15.3, 16.6, 18.4, 19.4), flat(0.15), -22);
bell(31, 18.1, -14, 0.5, 1.6);                                   // the baseplate sits
for (const m of [45, 52, 57, 62]) pad(m, 18.4, 22.2, arc(18.4, 19.2, 21.0, 22.2), (t) => 0.4 - 0.3 * seg(t, 19.1, 20.7), -20);
[81, 79, 77, 76, 74].forEach((m, k) => bell(m, 19.1 + k * 0.4, -18 - 1.2 * k, 0.6 - 0.06 * k, 1.4));   // the head empties
// ---- Stain (21.5–25.5)
for (const m of [50, 57, 64, 65]) pad(m, 21.3, 26.2, arc(21.3, 22.6, 25.0, 26.2), flat(0.05), -25, 3);
// ---- Budding (25.5–31.5)
for (const m of [34, 46, 53, 58]) pad(m, 25.3, 28.9, arc(25.3, 26.4, 28.0, 28.9), (t) => 0.15 + 0.3 * seg(t, 25.5, 28.5), -21);
for (const m of [36, 48, 55, 60]) pad(m, 28.2, 32.2, arc(28.2, 29.0, 31.2, 32.2), (t) => 0.3 + 0.4 * seg(t, 28.5, 29.6), -19);
{
    const fig = [70, 74, 77, 74], fig2 = [72, 76, 79, 76];
    for (let n = 0; n < 33; n++) { const t = 25.5 + n / 8; bell((t < 28.5 ? fig : fig2)[n % 4], t, -27 + 9 * seg(t, 25.5, 29.6), 0.3 + 0.4 * ((n * 3) % 4) / 3, 0.2); }
    bell(81, 29.6, -13, 0.4, 2.0);                               // it pinches off
    bell(86, 29.6, -17, 0.65, 1.8);
}
}
// ---- Dark (31.5–37.5): the wide D minor, and the title's bells
{
    const t0 = ONLY_ENDING ? 32.4 : 31.4;                        // (over the generated take it comes up as that one fades)
    const env = (t) => smooth(seg(t, t0, t0 + 2.2)) * (0.8 + 0.2 * seg(t, 34.6, 35.4)) * (1 - smooth(seg(t, 36.2, 37.35)));
    for (const m of [38, 45, 50, 53, 57, 62, 65, 69]) pad(m, t0, DUR, env, (t) => 0.2 + 0.35 * seg(t, t0, 35.2), m < 50 ? -17 : -21);
    bell(74, 35.0, -16, 0.45, 3.0);                              // the title
    bell(81, 35.04, -20, 0.6, 2.6);
    bell(77, 35.5, -23, 0.35, 2.4);
}

// ---- the room: a small Schroeder reverb on everything (four combs and two all-passes a side)
function reverb(x, combs, seed) {
    const out = new Float32Array(N);
    for (const [ms, fb] of combs) {
        const d = Math.round(ms * SR / 1000), buf = new Float32Array(d);
        let k = 0, lp = 0;
        for (let i = 0; i < N; i++) {
            const y = buf[k];
            lp += 0.35 * (y - lp);                 // the hall eats the top of every echo
            buf[k] = x[i] + lp * fb;
            out[i] += y * 0.25;
            k = (k + 1) % d;
        }
    }
    for (const ms of [5.1 + seed, 1.7 + seed * 0.3]) {
        const d = Math.round(ms * SR / 1000), buf = new Float32Array(d);
        let k = 0;
        for (let i = 0; i < N; i++) {
            const b = buf[k], y = -0.6 * out[i] + b;
            buf[k] = out[i] + 0.6 * y;
            out[i] = y;
            k = (k + 1) % d;
        }
    }
    return out;
}
const wetL = reverb(L, [[41.3, 0.86], [47.9, 0.85], [55.7, 0.84], [63.1, 0.83]], 0.0);
const wetR = reverb(R, [[43.7, 0.86], [49.3, 0.85], [58.1, 0.84], [66.7, 0.83]], 0.4);
let peak = 0;
for (let i = 0; i < N; i++) {
    const end = 1 - smooth(seg(i / SR, DUR - 0.25, DUR));
    L[i] = (L[i] * 0.72 + wetL[i] * 0.5) * end;
    R[i] = (R[i] * 0.72 + wetR[i] * 0.5) * end;
    peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const norm = ONLY_ENDING ? 1 : db(-3) / peak;   // (the layer keeps the level it has inside the full score)
const out = args[0] ?? path.join(path.dirname(fileURLToPath(import.meta.url)), 'out', 'music.wav');
fs.mkdirSync(path.dirname(out), { recursive: true });
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * norm)) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * norm)) * 32767), 46 + i * 4);
}
fs.writeFileSync(out, buf);
console.log(`${out} · ${DUR} s · peak before normalising ${(20 * Math.log10(peak)).toFixed(1)} dBFS`);
