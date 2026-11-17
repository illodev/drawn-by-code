// lightfield-test · the score, synthesised: a slow ambient piece in D that changes harmony
// on the film's cuts and lands its swells on the picture's events (the times are the
// shots' own constants). Deterministic and licence-free, so the .wav is not committed.
//
//   node sandbox/2026-11-16-lightfield-test/music.mjs [out.wav]
//   node sandbox/2026-11-16-lightfield-test/music.mjs [out.wav] --totality   only the chord
//       at totality, to lay over a generated score that has no event there (mix-sound.sh)
//
//   0–5.5     Limb      a low fifth on D, a glassy high A coming in with the daylight, D minor
//                       opening as the Sun shows (2.4 s) and climbs
//   5.5–12    Eclipse   B flat under the thinning crescent, breathing in to almost nothing
//                       at the last bead; at totality (8.4 s) a wide D minor ninth; it
//                       brightens as the Sun returns and is cut off with the picture at 12
//   12–18.5   Prism     F major seventh, quiet, and one glass note per step of the fan as
//                       it opens (13.2–16.9 s), low to high and left to right like the colours
//   18.5–24.5 Slits     G minor, then a suspended A that asks for the D, growing with the
//                       photon count
//   24.5–30.5 Bulb      silence for the switch (25.05 s), then D major warming with the
//                       filament (settled at 26.4 s), a bell on the title (26.8 s), ringing out
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SR = 44100, DUR = 30.5, TAIL = 0, N = Math.round(SR * (DUR + TAIL));
const L = new Float32Array(N), R = new Float32Array(N);
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const db = (d) => Math.pow(10, d / 20);
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
const smooth = (x) => x * x * (3 - 2 * x);
const rng = (seed) => { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const rnd = rng(1704);
const ONLY_TOTALITY = process.argv.includes('--totality');
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

// ---- Limb (0–5.5)
if (!ONLY_TOTALITY) {
for (const m of [38, 45]) pad(m, 0, 7, arc(0, 2.6, 5.2, 7), (t) => 0.1 + 0.25 * seg(t, 2.4, 5.5), -19);
pad(81, 1.2, 6.5, arc(1.2, 3.6, 5.3, 6.5), flat(0), -33, 2);                       // the glassy high A
pad(77, 3.3, 6.5, arc(3.3, 4.8, 5.3, 6.5), flat(0), -36, 2);
for (const m of [50, 53, 57]) pad(m, 2.4, 6.6, arc(2.4, 5.2, 5.4, 6.6), (t) => 0.2 + 0.5 * seg(t, 2.4, 5.4), -22);

}
// ---- Eclipse (5.5–12)
if (!ONLY_TOTALITY) for (const m of [34, 46, 53, 62]) pad(m, 5.3, 8.7, arc(5.3, 6.6, 7.2, 8.45), flat(0.15), -22);   // B flat, breathing in
for (const m of [38, 45, 50, 53, 57, 60, 64, 69]) {
    // totality: the ninth opens in half a second, and brightens to the cut
    pad(m, 8.35, 12.1, (t) => smooth(seg(t, 8.35, 8.95)) * (0.72 + 0.28 * seg(t, 10.6, 12)) * (1 - seg(t, 11.98, 12.06)), (t) => 0.35 + 0.6 * smooth(seg(t, 10.4, 12)), m < 50 ? -17 : -21);
}
bell(74, 8.42, -22, 0.4, 2.6);
bell(81, 8.47, -26, 0.6, 2.2);

// ---- Prism (12–18.5)
if (!ONLY_TOTALITY) {
for (const m of [41, 48, 57, 64]) pad(m, 12.3, 19.6, arc(12.3, 13.6, 18.2, 19.6), flat(0.3), -21);
{
    // one glass note per step of the fan: low and left for the red end, high and right for the violet
    const scale = [62, 65, 69, 72, 76, 79, 81, 84, 88, 91];
    scale.forEach((m, k) => bell(m, 13.2 + k * 0.41, -15 - 0.6 * k, 0.15 + 0.07 * k, 1.5));
    bell(93, 17.45, -23, 0.85, 1.8);
}

// ---- Slits (18.5–24.5)
for (const m of [43, 50, 58]) pad(m, 18.4, 22.2, arc(18.4, 19.8, 21.0, 22.2), flat(0.12), -23);
for (const m of [45, 52, 55, 62]) pad(m, 20.9, 24.9, (t) => smooth(seg(t, 20.9, 22.4)) * (0.4 + 0.6 * seg(t, 22.4, 24.4)) * (1 - smooth(seg(t, 24.4, 24.9))), (t) => 0.15 + 0.55 * seg(t, 21.5, 24.4), -16);

// ---- Bulb (24.5–30.5)
{
    // the same heat curve as the picture's filament (bulb.js), from the switch at 25.05
    const keys = [[0.55, 0], [0.9, 0.2], [1.25, 0.34], [1.9, 1.06], [2.5, 1]];
    const heat = (t) => {
        const u = t - 24.5;
        if (u <= keys[0][0]) return 0;
        for (let i = 1; i < keys.length; i++) if (u < keys[i][0]) return keys[i - 1][1] + (keys[i][1] - keys[i - 1][1]) * smooth(seg(u, keys[i - 1][0], keys[i][0]));
        return 1;
    };
    const out = (t) => 1 - smooth(seg(t, 29.2, 30.45));
    for (const m of [38, 45, 50, 54, 57, 62, 66, 69]) pad(m, 25.05, DUR, (t) => heat(t) * out(t), (t) => 0.25 + 0.3 * heat(t), m < 50 ? -17 : -21);
    bell(74, 26.8, -17, 0.45, 3.2);                // the title
    bell(78, 26.84, -21, 0.6, 2.8);
    bell(81, 26.88, -23, 0.35, 2.6);
    bell(86, 28.0, -27, 0.7, 2.2);                 // the glint crossing it
}
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
const norm = ONLY_TOTALITY ? 1 : db(-3) / peak;   // (the layer keeps the level it has inside the full score)
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
