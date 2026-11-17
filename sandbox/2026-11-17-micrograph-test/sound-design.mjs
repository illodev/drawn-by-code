// micrograph-test · the sound design, synthesised: the sounds of the instrument and of what
// happens under it, placed from the same constants as the picture (the shots' own times).
// Deterministic (seeded), so the .wav is not committed: run this to make it again.
//
//   node sandbox/2026-11-17-micrograph-test/sound-design.mjs [out.wav]
//
// What it writes (film seconds):
//   0–37.5     the column: a faint mains hum and the pump's air, up with the beam (0–0.6 s)
//              and down with it at the end (37.1–37.5 s)
//   1.3–2.9    the wash: a fine airy shimmer that crosses from left to right with the front
//   2.4, 6.3   Naegleria's contractile vacuole emptying: a soft low drop
//   every cut  a change of magnification: air that rises or falls with it, the lens relay's
//              two clicks, a low knock (6.5 ↑, 11.5 ↓, 15.5 ↑, 21.5 ↑, 25.5 ↓, 31.5 ↓)
//   6.5–11.5   the serial sections: one tick per slice, eight a second (sixteenth notes at
//              the score's 120 BPM), the first of every four a little stronger
//   17.3–18.1  the phage's fibres finding the wall: four light taps; 18.1 the baseplate sits
//   18.5–19.0  the sheath contracting: a ratchet that speeds up, and a snap
//   19.1–20.7  the head emptying: air and a tone that fall
//   25.5–29.6  the bud swelling: a low tone that grows; 29.6 it pinches off: a pop
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
// band-limited noise: a one-pole low-pass and high-pass over a seeded source
function noiseBand(seed, lowHz, highHz) {
    const r = rng(seed);
    let lp = 0, hp = 0;
    return (lo = lowHz, hi = highHz) => {
        const kl = 1 - Math.exp(-TAU * hi / SR), kh = 1 - Math.exp(-TAU * lo / SR), x = r() * 2 - 1;
        lp += kl * (x - lp); hp += kh * (lp - hp);
        return lp - hp;
    };
}
// a damped resonance: clicks, ticks, taps (f Hz, decay in ms)
function tick(t, f, ms, gain, pan = 0.5) {
    const i0 = Math.round(t * SR), n = Math.round(ms * 6 * SR / 1000);
    for (let k = 0; k < n; k++) {
        const s = Math.sin(TAU * f * k / SR) * Math.exp(-k / (ms * SR / 1000)) * gain * Math.min(1, k / 8);
        add(i0 + k, s * Math.cos(pan * Math.PI / 2) * 1.2, s * Math.sin(pan * Math.PI / 2) * 1.2);
    }
}
// a low knock: a sine that drops a little and dies
function knock(t, f, ms, gain) {
    const i0 = Math.round(t * SR), n = Math.round(ms * 5 * SR / 1000);
    let ph = 0;
    for (let k = 0; k < n; k++) {
        const u = k / SR;
        ph += TAU * f * (1 + 0.6 * Math.exp(-u / 0.02)) / SR;
        const s = Math.sin(ph) * Math.exp(-u / (ms / 1000)) * gain * Math.min(1, k / 40);
        add(i0 + k, s, s);
    }
}

// ---- the column: hum and air, following the beam
{
    const air = noiseBand(1, 180, 900), air2 = noiseBand(2, 180, 900);
    for (let i = 0; i < N; i++) {
        const t = i / SR, beam = smooth(seg(t, 0, 0.6)) * (1 - smooth(seg(t, 37.14, 37.5)));
        const hum = (Math.sin(TAU * 50 * t) + 0.5 * Math.sin(TAU * 100 * t + 0.4) + 0.22 * Math.sin(TAU * 150 * t + 1.1)) * db(-35);
        const trem = 1 + 0.04 * Math.sin(TAU * 0.7 * t);
        add(i, (hum * trem + air() * db(-27)) * beam, (hum * trem + air2() * db(-27)) * beam);
    }
    tick(0.04, 1400, 5, db(-13));          // the beam's relay
    knock(0.05, 70, 90, db(-12));
    tick(37.30, 1250, 5, db(-15));
}
// ---- the wash: a shimmer that crosses with the front
{
    const a = noiseBand(11, 3200, 9000), b = noiseBand(12, 3200, 9000);
    for (let i = Math.round(1.2 * SR); i < Math.round(3.2 * SR); i++) {
        const t = i / SR, u = seg(t, 1.3, 2.9), env = smooth(seg(t, 1.2, 1.7)) * (1 - smooth(seg(t, 2.6, 3.2))) * db(-24);
        add(i, a() * env * (1 - u) * 5, b() * env * u * 5);
    }
}
// ---- Naegleria: the contractile vacuole empties (the same phase as naegleria.js)
for (const t0 of [3.9 * 0.92 - 1.2, 3.9 * 1.92 - 1.2]) {
    const n = Math.round(0.34 * SR);
    let ph = 0;
    for (let k = 0; k < n; k++) {
        const u = k / n;
        ph += TAU * (300 - 190 * smooth(u)) / SR;
        const s = Math.sin(ph) * Math.sin(Math.PI * Math.min(1, u * 1.15)) ** 2 * db(-19);
        add(Math.round(t0 * SR) + k, s * 1.1, s * 0.7);
    }
}
// ---- changes of magnification
{
    const cuts = [[6.5, 1], [11.5, -1], [15.5, 1], [21.5, 1], [25.5, -1], [31.5, -1]];
    cuts.forEach(([c, dir], n) => {
        const a = noiseBand(20 + n, 300, 3000), b = noiseBand(40 + n, 300, 3000);
        for (let i = Math.round((c - 0.40) * SR); i < Math.round((c + 0.45) * SR); i++) {
            const t = i / SR, u = seg(t, c - 0.40, c + 0.45);
            // the air's pitch goes the way the magnification goes
            const f = 500 * Math.pow(2, dir * 2.2 * (u - 0.3));
            const env = Math.pow(Math.sin(Math.PI * u), 2) * (0.5 + 0.5 * seg(t, c - 0.4, c)) * db(-22);
            add(i, a(f * 0.6, f * 1.8) * env * 6, b(f * 0.6, f * 1.8) * env * 6);
        }
        tick(c - 0.045, 1700, 4, db(-13), 0.4);
        tick(c + 0.02, 1150, 5, db(-12), 0.6);
        knock(c + 0.02, 62, 110, db(-13));
    });
}
// ---- the serial sections: a tick per slice
{
    const r = rng(404);
    for (let n = 0; n < 40; n++) {
        const strong = n % 4 === 0;
        tick(6.5 + n / 8 + 0.004 * (r() - 0.5), 1450 + 450 * r(), 5, db(strong ? -10 : -14) * (0.85 + 0.3 * r()), 0.35 + 0.3 * r());
    }
}
// ---- the phage
{
    const T0 = 15.5, r = rng(505);
    for (const [t, p] of [[1.8, 0.4], [2.1, 0.6], [2.35, 0.45], [2.55, 0.55]]) tick(T0 + t, 2600 + 600 * r(), 3, db(-17), p);   // fibres
    knock(T0 + 2.6, 95, 120, db(-11));                                             // the baseplate sits
    tick(T0 + 2.6, 800, 6, db(-18));
    // the sheath: a ratchet from 3.0 to 3.5 s, its clicks closer and closer, then a snap
    let t = 3.0, gap = 0.085;
    while (t < 3.47) { tick(T0 + t, 1500 + 900 * (t - 3.0) / 0.5 + 200 * r(), 2.6, db(-20 + 6 * (t - 3.0) / 0.5), 0.5); t += gap; gap *= 0.84; }
    tick(T0 + 3.5, 2100, 6, db(-11));
    knock(T0 + 3.5, 120, 80, db(-13));
    // the head empties: air and a tone that fall, and thin out
    const a = noiseBand(60, 400, 2500), b = noiseBand(61, 400, 2500);
    let ph = 0;
    for (let i = Math.round((T0 + 3.55) * SR); i < Math.round((T0 + 5.4) * SR); i++) {
        const tt = i / SR - T0, u = seg(tt, 3.6, 5.2), f = 1800 * Math.pow(0.3, u);
        const env = smooth(seg(tt, 3.55, 3.8)) * (1 - smooth(seg(tt, 4.6, 5.4)));
        ph += TAU * (520 * Math.pow(0.5, u)) / SR;
        const tone = Math.sin(ph) * db(-27) * env;
        add(i, a(f * 0.7, f * 1.4) * env * db(-23) * 6 + tone, b(f * 0.7, f * 1.4) * env * db(-23) * 6 + tone);
    }
}
// ---- budding: the swell, and the pinch
{
    const T0 = 25.5, PINCH = 4.1;
    for (let i = Math.round((T0 + 0.6) * SR); i < Math.round((T0 + PINCH + 0.05) * SR); i++) {
        const t = i / SR - T0, u = seg(t, 0.6, PINCH);
        const s = (Math.sin(TAU * (52 + 8 * u) * t) + 0.3 * Math.sin(TAU * (104 + 16 * u) * t)) * u * u * (1 - seg(t, PINCH, PINCH + 0.05)) * db(-17);
        add(i, s, s);
    }
    // the pop: a short chirp up, and a click
    const n = Math.round(0.07 * SR);
    let ph = 0;
    for (let k = 0; k < n; k++) {
        const u = k / n;
        ph += TAU * (220 + 900 * u * u) / SR;
        const s = Math.sin(ph) * Math.sin(Math.PI * u) * db(-10);
        add(Math.round((T0 + PINCH) * SR) + k, s * 0.8, s);
    }
    tick(T0 + PINCH + 0.005, 2400, 3, db(-14), 0.6);
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
