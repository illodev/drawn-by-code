// lightfield-test · the sound design, synthesised: the sounds that belong to what is on
// screen and must land on its frames, which a generated score cannot do. Deterministic
// (a seeded generator), so the .wav is not committed: run this to make it again.
//
//   node sandbox/2026-11-16-lightfield-test/sound-design.mjs [out.wav]
//
// What it writes (film seconds; the times come from the shots' own code):
//   8.4        totality: a soft sub swell under the corona (no hit: it breathes in)
//   10.9–12    the Sun coming back: air rising into the cut, gone on the cut
//   12.3–13    the shutter opening on the bench: a faint airy tone, the beam
//   18.5–24.5  the photons: single ticks whose rate grows with the same law as the
//              picture (× e^1.92 a second, × 10 every 1.2 s), a crackle, then a hiss that
//              settles as the wave shows
//   25.05      the bulb's switch; 25.05–30.5 the filament: mains hum that brightens with
//              the same heat curve the picture uses, and settles
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SR = 44100, DUR = 30.5, N = Math.round(SR * DUR);
const L = new Float32Array(N), R = new Float32Array(N);
const rng = (seed) => { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
const smooth = (x) => x * x * (3 - 2 * x);
const db = (d) => Math.pow(10, d / 20);
const add = (i, l, r) => { if (i >= 0 && i < N) { L[i] += l; R[i] += r; } };
// one-pole filters over a noise source, for band-limited air
function noiseBand(seed, lowHz, highHz) {
    const r = rng(seed), kl = 1 - Math.exp(-2 * Math.PI * highHz / SR), kh = 1 - Math.exp(-2 * Math.PI * lowHz / SR);
    let lp = 0, hp = 0;
    return () => { const x = r() * 2 - 1; lp += kl * (x - lp); hp += kh * (lp - hp); return lp - hp; };
}

// ---- totality: a sub swell (48 Hz and its octave), half a second in, three seconds out
{
    const t0 = 8.4;
    for (let i = Math.round((t0 - 0.6) * SR); i < Math.round((t0 + 3.6) * SR); i++) {
        const t = i / SR - t0, env = t < 0 ? smooth(seg(t, -0.6, 0)) : Math.exp(-t / 1.1);
        const s = (Math.sin(2 * Math.PI * 48 * (t + 1)) + 0.35 * Math.sin(2 * Math.PI * 96 * (t + 1))) * env * db(-17);
        add(i, s, s);
    }
}
// ---- the Sun coming back: air that opens up (the band widens) into the cut at 12.0
{
    const a = noiseBand(11, 300, 9000), b = noiseBand(12, 300, 9000);
    let fl = 0, fr = 0;
    for (let i = Math.round(10.9 * SR); i < Math.round(12.04 * SR); i++) {
        const t = i / SR, u = seg(t, 10.9, 12.0), k = 1 - Math.exp(-2 * Math.PI * (500 + 7000 * u * u) / SR);
        fl += k * (a() - fl); fr += k * (b() - fr);
        const env = u * u * u * (1 - smooth(seg(t, 12.0, 12.04))) * db(-13);
        add(i, fl * env * 1.5, fr * env * 1.5);
    }
}
// ---- the shutter: the beam arrives as a faint airy tone that fades into the room
{
    const a = noiseBand(21, 1800, 5200);
    for (let i = Math.round(12.25 * SR); i < Math.round(15.5 * SR); i++) {
        const t = i / SR, env = smooth(seg(t, 12.25, 13.0)) * (1 - smooth(seg(t, 13.0, 15.5))) * db(-33);
        const s = a() * env * 5;
        add(i, s * 0.8, s);
    }
}
// ---- the photons
{
    const T0 = 18.5, RATE = 1.92, r = rng(1905);
    // a tick: a few cycles of a damped resonance (a counter's click), each a little different
    const tick = (t, gain, pan, f) => {
        const i0 = Math.round(t * SR);
        for (let k = 0; k < 220; k++) {
            const s = Math.sin(2 * Math.PI * f * k / SR) * Math.exp(-k / 26) * gain;
            add(i0 + k, s * (1 - pan), s * pan);
        }
    };
    // arrivals: a Poisson process whose rate follows the picture; past ~250 a second the
    // ear hears a hiss, so the ticks thin out there and the hiss takes over
    let t = 0.25;
    while (t < 5.4) {
        const rate = Math.min(0.9 * Math.exp(RATE * t), 260);
        t += -Math.log(Math.max(r(), 1e-6)) / rate;
        const dense = seg(rate, 60, 260);
        tick(T0 + t, db(-15 - 9 * dense) * (0.6 + 0.8 * r()), 0.25 + 0.5 * r(), 2300 + 1500 * r());
    }
    const a = noiseBand(31, 1500, 7000), b = noiseBand(32, 1500, 7000);
    for (let i = Math.round((T0 + 2.6) * SR); i < Math.round((T0 + 6.0) * SR); i++) {
        const u = i / SR - T0, env = smooth(seg(u, 2.6, 4.6)) * (1 - 0.35 * smooth(seg(u, 4.8, 5.8))) * (1 - smooth(seg(u, 5.9, 6.0))) * db(-23);
        add(i, a() * env * 5, b() * env * 5);
    }
}
// ---- the bulb: a switch, then the filament's hum following its heat
{
    const T0 = 24.5, keys = [[0, 0], [0.55, 0], [0.9, 0.2], [1.25, 0.34], [1.9, 1.09], [2.5, 1]];
    const heat = (t) => {
        if (t <= keys[0][0]) return 0;
        for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) { const u = smooth(seg(t, keys[i - 1][0], keys[i][0])); return keys[i - 1][1] + (keys[i][1] - keys[i - 1][1]) * u; }
        return 1;
    };
    // the switch: a short dry click with a lower knock behind it
    const i0 = Math.round((T0 + 0.55) * SR);
    for (let k = 0; k < 900; k++) {
        const s = (Math.sin(2 * Math.PI * 3100 * k / SR) * Math.exp(-k / 18) + 0.8 * Math.sin(2 * Math.PI * 420 * k / SR) * Math.exp(-k / 140)) * db(-14);
        add(i0 + k, s, s * 0.9);
    }
    // the hum: 100 Hz (twice the mains) and harmonics; the hotter, the more of the upper ones
    for (let i = i0; i < N; i++) {
        const t = i / SR - T0, h = heat(t), ph = 2 * Math.PI * 100 * t;
        let s = 0;
        for (let n = 1; n <= 7; n++) s += Math.sin(n * ph + n * 0.7) / n * Math.pow(Math.min(h, 1.1), 1 + 0.55 * (n - 1));
        const trem = 1 + 0.03 * Math.sin(2 * Math.PI * 5.9 * t);
        const out = s * trem * db(-27) * (1 - 0.45 * smooth(seg(t, 2.6, 4.5))) * (1 - smooth(seg(t, 5.6, 6.0)));
        add(i, out, out);
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
