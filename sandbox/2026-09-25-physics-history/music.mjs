// Synthesized score for physics-history: 40 s at 120 BPM, no samples, no licences. A motif
// of few notes (D major: D F♯ A, with E and B as colour) gains an instrument per stage, as
// the brief asks: glass (Galileo), plucked string (Newton), brass (Faraday), a granular
// texture (Curie), sustained strings (Einstein), harmonics (Schrödinger); the atlas resolves
// them together and the last note dies inside the 40 s. Deterministic: same code, same file.
//
//   node sandbox/2026-09-25-physics-history/music.mjs   → music.wav (next to this file, not committed)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SR = 44100, DUR = 40, BEAT = 0.5;
const N = SR * DUR;
const L = new Float32Array(N), R = new Float32Array(N);
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
let seed = 11;
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * 2 - 1;
const env = (t, a, d) => (t < 0 ? 0 : t < a ? t / a : Math.exp(-(t - a) / d));
const TAU = Math.PI * 2;

function note(t0, dur, fn, gain = 1, pan = 0) {
    const i0 = Math.floor(t0 * SR), n = Math.floor(dur * SR);
    const gl = gain * Math.cos((pan + 1) * Math.PI / 4), gr = gain * Math.sin((pan + 1) * Math.PI / 4);
    for (let k = 0; k < n; k++) {
        const i = i0 + k;
        if (i < 0 || i >= N) continue;
        const v = fn(k / SR);
        L[i] += v * gl; R[i] += v * gr;
    }
}

// ── instruments ──────────────────────────────────────────────────────────────────────────
// glass: a bell-like FM tone with an inharmonic partial, long ring
const glass = (f, d = 1.8) => (t) => (Math.sin(TAU * f * t + 1.2 * Math.sin(TAU * f * 3.5 * t) * env(t, 0.001, 0.3)) + 0.35 * Math.sin(TAU * f * 2.76 * t) * env(t, 0.001, 0.4)) * env(t, 0.004, d);
// plucked string: Karplus–Strong, deterministic noise burst
function pluck(f, dur = 1.6, bright = 0.5) {
    const p = Math.max(2, Math.round(SR / f)), buf = new Float32Array(p);
    for (let i = 0; i < p; i++) buf[i] = rnd();
    const n = Math.floor(dur * SR), out = new Float32Array(n);
    let j = 0;
    for (let i = 0; i < n; i++) {
        const a = buf[j], b = buf[(j + 1) % p];
        out[i] = a;
        const w = 0.5 - bright * 0.3; // less averaging = brighter
        buf[j] = (a * (1 - w) + b * w) * 0.996;
        j = (j + 1) % p;
    }
    return (t) => out[Math.min(n - 1, Math.floor(t * SR))];
}
// brass: saw with a filter that opens on the attack
function brass(f, dur, bright) {
    let lp = 0;
    return (t) => {
        const s = 2 * ((f * t) % 1) - 1 + 0.6 * (2 * ((f * 1.003 * t) % 1) - 1);
        const cut = 0.02 + bright * 0.12 * env(t, 0.06, 0.5);
        lp += (s - lp) * cut;
        return lp * Math.min(1, t / 0.05) * Math.min(1, (dur - t) / 0.2);
    };
}
// strings: detuned saws, slow attack, low-passed
function strings(f, dur, att = 0.8) {
    let lp = 0;
    return (t) => {
        let s = 0;
        for (const dt of [-0.004, 0, 0.005]) s += 2 * ((f * (1 + dt) * t) % 1) - 1;
        lp += (s / 3 - lp) * 0.035;
        return lp * Math.min(1, t / att) * Math.min(1, (dur - t) / 0.8);
    };
}
// a sustained tone whose harmonics come in one by one (h(t) = how many are open)
const harmonic = (f, dur, h) => (t) => {
    let v = 0;
    const open = h(t);
    for (let k = 1; k <= 7; k++) v += Math.sin(TAU * f * k * t + k) * Math.max(0, Math.min(1, open - k + 2)) / k;
    return v * Math.min(1, t / 0.6) * Math.min(1, (dur - t) / 0.6);
};
// a grain: a tiny tone or click of filtered noise
const grain = (f) => (t) => Math.sin(TAU * f * t) * env(t, 0.002, 0.03) + rnd() * 0.3 * env(t, 0.0005, 0.006);

// ── the score (seconds of the piece) ─────────────────────────────────────────────────────
const D4 = 62, M = { D: 0, E: 2, Fs: 4, G: 5, A: 7, B: 9, Cs: 11 };
const m = (n, o = 0) => D4 + M[n] + 12 * o;

// 0–2 · the lens: one sustained glass note and air
note(0.1, 2.6, glass(hz(m('A', 1)), 1.6), 0.18, 0.2);
// 2–8 · Galileo: the motif in glass; three spaced notes for the three nights; the ring drawn
note(2.0, 2.5, glass(hz(m('D', 1))), 0.2, -0.2);
note(2.5, 2.5, glass(hz(m('Fs', 1))), 0.16, 0.1);
for (const [t, n] of [[3.75, 'A'], [4.75, 'Fs'], [5.75, 'E']]) note(t, 2.6, glass(hz(m(n, 1)), 2.0), 0.24, 0.35);
for (let i = 0; i < 6; i++) note(6.5 + i * 0.25, 1.8, glass(hz(m(['D', 'Fs', 'A', 'D', 'Fs', 'A'][i], i < 3 ? 1 : 2)), 1.2), 0.1, -0.3 + i * 0.12);
// a low drone under the whole piece from the observatory on
note(2.0, 36, strings(hz(m('D', -2)), 36, 2.5), 0.1, 0);
// 8–14 · Newton: the motif in plucked string on the beats; after the knock (9.42), an arc of
// plucks up and down across the orbit
for (let b = 0; b < 3; b++) note(8 + b * 0.5, 1.8, pluck(hz(m(['D', 'Fs', 'A'][b])), 1.8), 0.45, -0.2);
const arc = [['D', 0], ['E', 0], ['Fs', 0], ['A', 0], ['B', 0], ['D', 1], ['B', 0], ['A', 0], ['Fs', 0], ['E', 0], ['D', 0]];
arc.forEach(([n, o], i) => note(11 + i * 0.18, 1.5, pluck(hz(m(n, o)), 1.5, 0.6), 0.32, Math.sin(i / 10 * Math.PI * 2) * 0.6));
note(13, 1.2, glass(hz(m('A', 1)), 1), 0.1, 0);
// 14–20 · Faraday: two brass pulses of different timbre for in (peak ≈ 15.4) and out (≈ 17.4),
// a short silence while the magnet is held; plucks thin out
note(14.9, 0.9, brass(hz(m('A', -1)), 0.9, 1), 0.2, -0.3);
note(14.9, 0.9, brass(hz(m('E', 0)), 0.9, 1), 0.12, -0.3);
note(16.9, 0.9, brass(hz(m('Fs', -1)), 0.9, 0.5), 0.2, 0.3);
note(16.9, 0.9, brass(hz(m('Cs', 0)), 0.9, 0.5), 0.12, 0.3);
for (const [t, n] of [[14.0, 'D'], [14.5, 'A'], [18.0, 'Fs'], [18.5, 'A']]) note(t, 1.4, pluck(hz(m(n)), 1.4), 0.18, 0);
// 18–20 · the light mark: a glass shimmer
for (let i = 0; i < 5; i++) note(18.6 + i * 0.25, 1.5, glass(hz(m(['A', 'B', 'D', 'E', 'Fs'][i], 1)), 1.0), 0.08, 0.5 - i * 0.2);
// 20–26 · Curie: the motif once more in pluck, then a granular texture that thickens from 23.5
for (const [t, n] of [[20.0, 'D'], [20.5, 'Fs'], [21.0, 'A'], [22.0, 'B'], [22.5, 'A']]) note(t, 1.6, pluck(hz(m(n)), 1.6, 0.3), 0.24, -0.1);
{
    let r = 3;
    const rr = () => ((r = (r * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
    for (let i = 0; i < 420; i++) {
        const t = 21 + rr() * 5.2, dens = t < 23.5 ? 0.25 : Math.min(1, 0.4 + (t - 23.5) / 2);
        if (rr() > dens) continue;
        note(t, 0.08, grain(hz(m(['A', 'D', 'Fs', 'B'][i % 4], 2 + (i % 2)))), 0.05 + 0.05 * rr(), rr() * 1.6 - 0.8);
    }
}
// 26–32 · Einstein: sustained strings, the chord widening; a held tone that pans with the beam
note(26.0, 6.4, strings(hz(m('D', -1)), 6.4), 0.18, -0.2);
note(26.5, 5.9, strings(hz(m('A', -1)), 5.9), 0.14, 0.2);
note(27.5, 4.9, strings(hz(m('Fs', 0)), 4.9), 0.12, 0);
note(28.5, 3.9, strings(hz(m('B', 0)), 3.9), 0.1, 0.1);
{
    const f = hz(m('A', 1)), i0 = 26.3 * SR, n = 5.4 * SR;
    for (let k = 0; k < n; k++) {
        const t = k / SR, v = Math.sin(TAU * f * t) * 0.06 * Math.min(1, t / 0.5) * Math.min(1, (5.4 - t) / 0.6), p = -0.8 + 1.6 * (t / 5.4);
        L[i0 + k] += v * Math.cos((p + 1) * Math.PI / 4); R[i0 + k] += v * Math.sin((p + 1) * Math.PI / 4);
    }
}
// 32–38 · Schrödinger: one sustained note that gains harmonics; the strings stay under it
note(32.0, 6.2, harmonic(hz(m('D', 0)), 6.2, (t) => 1 + Math.max(0, t - 1) * 1.5), 0.12, 0);
note(32.0, 6.2, strings(hz(m('A', -1)), 6.2), 0.1, 0);
// 38–40 · the atlas: every instrument resolves on D major; the last note ends by 39.9
note(37.0, 2.9, strings(hz(m('D', -1)), 2.9, 0.4), 0.16, -0.2);
note(37.0, 2.9, strings(hz(m('Fs', 0)), 2.9, 0.4), 0.12, 0.2);
note(37.5, 2.4, glass(hz(m('D', 1)), 1.2), 0.14, -0.3);
note(37.75, 2.1, pluck(hz(m('A')), 2.0), 0.18, 0.3);
note(38.0, 1.9, brass(hz(m('D', -1)), 1.9, 0.4), 0.1, 0);
note(38.0, 1.9, harmonic(hz(m('A', 0)), 1.9, () => 5), 0.06, 0);

// ── air: a small room made of four feedback delays, and a soft limiter ───────────────────
const wet = [0.0297, 0.0371, 0.0411, 0.0437].map((d) => ({ n: Math.round(d * SR), buf: new Float32Array(Math.round(d * SR)), i: 0 }));
for (let i = 0; i < N; i++) {
    const x = (L[i] + R[i]) * 0.5;
    let y = 0;
    for (const c of wet) { const v = c.buf[c.i]; c.buf[c.i] = x + v * 0.78; c.i = (c.i + 1) % c.n; y += v; }
    L[i] += y * 0.07; R[i] += y * 0.07;
}
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const g = 0.85 / (peak || 1);
const out = Buffer.alloc(44 + N * 4);
out.write('RIFF', 0); out.writeUInt32LE(36 + N * 4, 4); out.write('WAVE', 8); out.write('fmt ', 12);
out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(2, 22); out.writeUInt32LE(SR, 24);
out.writeUInt32LE(SR * 4, 28); out.writeUInt16LE(4, 32); out.writeUInt16LE(16, 34); out.write('data', 36); out.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
    const fade = Math.min(1, (N - i) / (SR * 0.1));
    out.writeInt16LE(Math.round(Math.tanh(L[i] * g * 1.1) * fade * 32000), 44 + i * 4);
    out.writeInt16LE(Math.round(Math.tanh(R[i] * g * 1.1) * fade * 32000), 46 + i * 4);
}
const dir = path.dirname(fileURLToPath(import.meta.url));
fs.writeFileSync(path.join(dir, 'music.wav'), out);
console.log('music.wav · 40 s · peak before gain', peak.toFixed(2));
