// Synthesized score for red-thread («El hilo rojo», 68 s). No samples, no licences,
// deterministic: the same code always writes the same file.
//
//   node sandbox/2026-11-04-red-thread/music.mjs         → mix.wav (score + effects)
//   node sandbox/2026-11-04-red-thread/music.mjs --sfx   → sfx.wav (effects only: water, wind,
//        rain, phone pings, thread snaps, splashes, the seal's bell),
//        to lay under the ElevenLabs score (gen-music.mjs, mix-final.sh)
//
// Instruments: koto (Karplus-Strong plucked string with a pressed bend), a breathy flute
// (shakuhachi-like), taiko (a pitched-down thump with skin noise), a temple bell (inharmonic
// partials), cold phone pings, string snaps, wind, water and rain (filtered noise).
// Two scales on D: «yo» (D E G A B, open and warm) for the village and the return of the red,
// «in» (D Eb G A Bb, the ache) from the screens to the kite. 60 BPM: one beat = 1 s.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SR = 44100, DUR = 68.0;
const N = Math.round(SR * DUR);
const L = new Float32Array(N), R = new Float32Array(N);
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
let seed = 11;
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * 2 - 1;

function add(i, l, r) {
    if (i >= 0 && i < N) { L[i] += l; R[i] += r; }
}
const panLR = (v, p) => [v * Math.cos((p + 1) * Math.PI / 4), v * Math.sin((p + 1) * Math.PI / 4)];

// --- instruments -----------------------------------------------------------------------------
const MUSIC = !process.argv.includes('--sfx');
function koto(...a) { if (MUSIC) kotoRaw(...a); }
function kotoRaw(t0, midi, gain = 0.5, pan = 0, bend = 0, decay = 0.9) {
    const f0 = hz(midi);
    const len = Math.max(2, Math.round(SR / f0));
    const buf = new Float32Array(len + 2);
    for (let i = 0; i < buf.length; i++) buf[i] = rnd() * 0.9 + (i < len / 2 ? 0.4 : -0.4);
    const n = Math.round(SR * 3.5), i0 = Math.round(t0 * SR);
    let p = 0, last = 0;
    for (let k = 0; k < n; k++) {
        const t = k / SR;
        const b = bend * Math.min(1, Math.max(0, (t - 0.25) / 0.35));
        const curLen = SR / (f0 * Math.pow(2, b / 12));
        const j = Math.floor(p) % len, j2 = (j + 1) % len;
        const v = buf[j];
        buf[j] = 0.4985 * (v + buf[j2]);
        p += len / curLen;
        const a = Math.min(1, k / 30) * Math.exp(-t * decay);
        const s = (v * 0.85 + last * 0.15) * a * gain;
        last = v;
        const [l, r] = panLR(s, pan);
        add(i0 + k, l, r);
    }
}
function flute(...a) { if (MUSIC) fluteRaw(...a); }
function fluteRaw(t0, dur, midi, gain = 0.2, pan = 0, glide = 0) {
    const i0 = Math.round(t0 * SR), n = Math.round(dur * SR);
    let ph = 0, lp = 0;
    for (let k = 0; k < n; k++) {
        const t = k / SR;
        const f = hz(midi + glide * Math.min(1, t / 0.3) - glide);
        const env = Math.min(1, t / 0.35) * Math.min(1, (dur - t) / 0.6);
        const vib = 1 + 0.006 * Math.min(1, t / 1.2) * Math.sin(2 * Math.PI * 5 * t);
        ph += (2 * Math.PI * f * vib) / SR;
        lp += (rnd() - lp) * 0.08;
        const v = (Math.sin(ph) + 0.18 * Math.sin(2 * ph) + 0.06 * Math.sin(3 * ph)) * (0.8 + 0.2 * Math.sin(t * 2.3)) + lp * 0.9 * (0.4 + 0.6 * Math.exp(-t * 2));
        const [l, r] = panLR(v * env * gain, pan);
        add(i0 + k, l, r);
    }
}
function taiko(...a) { if (MUSIC) taikoRaw(...a); }   // the score carries its own drums
function taikoRaw(t0, gain = 0.6, pitch = 70, pan = 0) {
    const i0 = Math.round(t0 * SR), n = Math.round(1.4 * SR);
    let ph = 0, lp = 0;
    for (let k = 0; k < n; k++) {
        const t = k / SR;
        const f = pitch * (1 + 1.6 * Math.exp(-t * 25));
        ph += (2 * Math.PI * f) / SR;
        lp += (rnd() - lp) * 0.2;
        const v = Math.sin(ph) * Math.exp(-t * 3.2) + lp * 0.6 * Math.exp(-t * 30);
        const [l, r] = panLR(v * gain, pan);
        add(i0 + k, l, r);
    }
}
function bell(t0, midi, gain = 0.3, pan = 0) {
    const f = hz(midi), i0 = Math.round(t0 * SR), n = Math.round(6 * SR);
    const parts = [[1, 1, 0.9], [2.76, 0.5, 1.6], [5.4, 0.3, 2.6], [8.9, 0.15, 4], [0.5, 0.3, 0.6]];
    for (let k = 0; k < n; k++) {
        const t = k / SR;
        let v = 0;
        for (const [m, a, d] of parts) v += a * Math.sin(2 * Math.PI * f * m * t) * Math.exp(-t * d);
        const [l, r] = panLR(v * gain * Math.min(1, k / 40), pan);
        add(i0 + k, l, r);
    }
}
// a phone's notification: a clean, cold sine pair, out of the scale on purpose
function ping(t0, midi, gain = 0.12, pan = 0) {
    const i0 = Math.round(t0 * SR), n = Math.round(0.5 * SR);
    for (let k = 0; k < n; k++) {
        const t = k / SR;
        const v = (Math.sin(2 * Math.PI * hz(midi) * t) + 0.5 * Math.sin(2 * Math.PI * hz(midi + 7) * t)) * Math.exp(-t * 9) * (t < 0.12 ? 1 : 0.6);
        const [l, r] = panLR(v * gain, pan);
        add(i0 + k, l, r);
    }
}
// a red thread snapping: a high pluck whose pitch falls, and a whip of noise
function snap(t0, gain = 0.4, pan = 0) {
    kotoRaw(t0, 88, gain * 0.7, pan, -5, 3.0);
    const i0 = Math.round(t0 * SR), n = Math.round(0.25 * SR);
    let hp = 0, prev = 0;
    for (let k = 0; k < n; k++) {
        const t = k / SR, x = rnd();
        hp = 0.85 * (hp + x - prev);
        prev = x;
        const [l, r] = panLR(hp * gain * 0.5 * Math.exp(-t * 18), pan);
        add(i0 + k, l, r);
    }
}
// splash: a burst of filtered noise with a low plop
function splash(t0, gain = 0.3, pan = 0) {
    const i0 = Math.round(t0 * SR), n = Math.round(0.9 * SR);
    let a = 0, ph = 0;
    for (let k = 0; k < n; k++) {
        const t = k / SR;
        a += (rnd() - a) * 0.25;
        ph += (2 * Math.PI * (180 - 120 * Math.min(1, t * 8))) / SR;
        const v = a * Math.exp(-t * 6) * 0.9 + Math.sin(ph) * Math.exp(-t * 14) * 0.6;
        const [l, r] = panLR(v * gain, pan);
        add(i0 + k, l, r);
    }
}
function noiseBed(envFn, cut, gain, pan = 0, lfo = 0) {
    let a = 0, b = 0;
    for (let k = 0; k < N; k++) {
        const t = k / SR, e = envFn(t);
        const c = cut * (1 + lfo * Math.sin(t * 1.7));
        a += (rnd() - a) * c;
        b += (a - b) * c;
        if (e <= 0) continue;
        const [l, r] = panLR((a - b * 0.5) * e * gain, pan + 0.3 * Math.sin(t * 0.9));
        add(k, l, r);
    }
}
// a soft drone (two detuned sines with a slow swell) for the dark middle
function drone(...a) { if (MUSIC) droneRaw(...a); }
function droneRaw(t0, t1, midi, gain = 0.08) {
    const i0 = Math.round(t0 * SR), n = Math.round((t1 - t0) * SR);
    for (let k = 0; k < n; k++) {
        const t = k / SR, e = Math.min(1, t / 1.5) * Math.min(1, (t1 - t0 - t) / 1.5);
        const v = Math.sin(2 * Math.PI * hz(midi) * t) + Math.sin(2 * Math.PI * hz(midi) * 1.004 * t) + 0.4 * Math.sin(2 * Math.PI * hz(midi + 7) * t);
        add(i0 + k, v * e * gain, v * e * gain);
    }
}

// --- scales ------------------------------------------------------------------------------------
const D = 62, YO = [0, 2, 5, 7, 9], IN = [0, 1, 5, 7, 8];
const deg = (sc, d, oct = 0) => D + sc[((d % 5) + 5) % 5] + 12 * (oct + Math.floor(d / 5));
const yo = (d, o = 0) => deg(YO, d, o), inn = (d, o = 0) => deg(IN, d, o);
const ease = (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)));
const env = (keys) => (t) => {
    for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) {
        const [ta, va] = keys[i - 1], [tb, vb] = keys[i];
        return va + (vb - va) * ease(t, ta, tb);
    }
    return keys[keys.length - 1][1];
};

// --- beds ----------------------------------------------------------------------------------------
noiseBed(env([[0, 0.25], [2, 0.5], [26, 0.5], [31, 0.25], [36, 0.45], [68, 0.45]]), 0.015, 0.5, -0.2);          // water
noiseBed(env([[0, 0.12], [36, 0.12], [37, 0.2], [38.4, 1], [40, 0.15], [68, 0.12]]), 0.06, 0.45, 0, 0.4);       // wind, the gust
noiseBed(env([[31, 0], [32, 0.9], [35, 0.9], [36, 0]]), 0.35, 0.35, 0, 0.2);                                     // rain
// the broadsheets (round 12): a paper flutter as each slips out of the sleeve and lands, a
// big rustle as one sheet comes up to the camera (17.5 s) and as the wind takes it (20.3 s)
for (const [t, p] of [[11.7, -0.3], [11.9, 0.3], [12.1, -0.4], [12.2, 0.2], [12.5, -0.2], [12.7, 0.4], [14.3, 0.4]]) noiseBed(env([[t, 0], [t + 0.1, 0.8], [t + 0.9, 0.5], [t + 1.3, 0]]), 0.45, 0.22, p, 1);
noiseBed(env([[17.4, 0], [17.7, 1], [18.3, 0.2], [18.6, 0]]), 0.4, 0.4, 0, 1);
noiseBed(env([[20.2, 0], [20.45, 1], [21.0, 0]]), 0.45, 0.45, 0.4, 1);
drone(14.5, 18.5, D - 13, 0.05);       // the screens: a cold, slightly sour hum
// the kuroko: a deep rumble as he rises behind the mountains, and as he dissolves
noiseBed(env([[26.2, 0], [27.2, 1], [29.5, 0.5], [31, 0]]), 0.004, 0.9, 0);   // the reveal
noiseBed(env([[43.0, 0], [44.2, 0.6], [45.5, 0]]), 0.004, 0.8, 0);
noiseBed(env([[63.3, 0], [64.6, 0.5], [66.4, 0]]), 0.006, 0.6, 0);   // the kuroko dissolves
drone(18, 32, D - 24, 0.06);
drone(32, 43, D - 12, 0.04);
drone(43, 50, D - 24, 0.05);

// --- 1 · Title (yo): a koto phrase as the painting blooms; the seal on a bell -------------------
[[0.3, 0, -1], [1.0, 2, 0], [1.6, 4, 0], [2.3, 3, 0], [3.2, 1, 1], [3.6, 0, 1], [4.2, 4, 0], [5.0, 0, 0]].forEach(([t, d, o], i) => koto(t, yo(d, o), 0.4, -0.3 + i * 0.08));
flute(3.2, 2.6, yo(2, 1), 0.12, 0.2);
bell(5.0, D, 0.18);

// --- 2 · The bridge (yo): a walking koto line; each greeting rings a high pluck ------------------
for (let b = 0; b < 12; b++) {
    const t = 6 + b * 0.5;
    koto(t, yo([0, 2, 3, 4, 3, 2, 1, 2, 0, 2, 3, 4][b], b % 4 === 0 ? -1 : 0), 0.3, b % 2 ? 0.3 : -0.3);
}
for (const [t, d] of [[8.0, 2], [9.2, 3], [9.3, 4], [10.8, 0]]) koto(t, yo(d, 1), 0.38, 0.1, 0, 0.6);
flute(6.5, 2.8, yo(4, 0), 0.12, -0.2);
flute(9.5, 2.4, yo(2, 1), 0.12, 0.2);

// --- 3 · Screens: the melody thins; cold pings out of the scale ---------------------------------
for (const [t, b] of [[12, 0], [13, 2], [14, 1], [16, 0]]) koto(t, yo(b, 0), 0.22 - (t - 12) * 0.025, 0);
koto(15.0, inn(1, 0), 0.3, 0, 0);       // the bump: a dull note
taiko(15.0, 0.18, 110);

// --- 4 · Two banks (in): a slow heartbeat on the taiko that grows; the crack -------------------
for (let t = 19; t < 26; t += 1) taiko(t, 0.12 + (t - 19) * 0.04, 62, t % 2 ? 0.3 : -0.3);
for (let t = 21.5; t < 25; t += 1) taiko(t, 0.08 + (t - 21.5) * 0.03, 80, 0);
koto(20, inn(0, -1), 0.3, -0.3, 0);
koto(22, inn(1, -1), 0.3, 0.3, 1);
koto(24.6, inn(4, -2), 0.5, 0, -2, 1.5);    // the crack
splash(24.6, 0.12);

// masks: a wet ink splat as each one lands on a face, a dry crack as it breaks and falls
for (const [t, p] of [[20.3, -0.4], [20.4, 0.4], [20.5, -0.2]]) splash(t, 0.1, p);
for (const [t, p] of [[62.7, -0.3], [62.9, 0.3], [63.1, -0.4], [63.3, 0.4], [63.5, -0.3], [63.7, 0.3]]) snap(t, 0.22, p);
// round 13: each strand of the bridge meets in the middle with a small bell
for (const t of [54.8, 55.9, 56.9, 57.8, 58.6]) ping(t, 81, 0.07, 0);

// --- 5 · Shouting: a taiko hit on every shout's landing; snaps; the bridge falls --------------
const SHOUTS = [26.3, 26.8, 27.3, 27.7, 28.2, 28.6, 29.0, 29.4, 29.8, 30.2, 30.6, 31.0];
SHOUTS.forEach((t, i) => {
    taiko(t, 0.25, 55 + (i % 3) * 10, i % 2 ? 0.4 : -0.4);
    splash(t + 0.7, 0.18, i % 2 ? -0.2 : 0.2);
});
// (round 14: the red threads and their snaps are gone)
for (const [x, dt] of [[0, 0.3], [1, 0.5], [2, 0.6], [3, 0.82]]) splash(30.4 + dt, 0.35, x / 2 - 0.75);
taiko(30.9, 0.6, 45);

// --- 6 · Grey (in): rain, one low koto note, a flute far away -----------------------------------
koto(32.2, inn(0, -1), 0.3, -0.2, 0, 0.5);
koto(34.0, inn(3, -1), 0.22, 0.2, 1, 0.5);
flute(33.5, 2.3, inn(2, 0), 0.08, 0.3);

// --- 7 · The kite (in, then the open fifth on the catch) -----------------------------------------
const K = 36, T_GUST = 1.5, T_LOOK = 3.7, T_CATCH = 5.0;
koto(K + 0.0, inn(0, -1), 0.45, -0.3);
koto(K + 0.5, inn(2), 0.3, 0.1);
koto(K + 1.0, inn(1), 0.32, -0.1, 1);
koto(K + T_GUST, inn(4, -1), 0.4, 0.2);
koto(K + T_GUST + 0.25, inn(0), 0.3, 0.3);
koto(K + T_GUST + 0.5, inn(2), 0.3, 0.4);
koto(K + T_GUST + 0.75, inn(3), 0.3, 0.5);
koto(K + 3.0, inn(4), 0.32, 0.3);
koto(K + 3.5, inn(3), 0.28, 0.2);
koto(K + T_LOOK, inn(1, 1), 0.3, 0.4, 1);
koto(K + 4.5, inn(0), 0.3, 0.1);
koto(K + T_CATCH, inn(0, -1), 0.5, -0.2);
koto(K + T_CATCH + 0.02, inn(3, -1), 0.4, 0.2);
koto(K + T_CATCH + 0.04, inn(0), 0.32, 0);
flute(K + T_CATCH - 0.15, 2.15, inn(3), 0.17, 0.1);
koto(K + 6.0, inn(2, 0), 0.26, 0.2);
koto(K + 6.5, inn(0, 0), 0.24, -0.2);

// --- 8 · Holding on: two shouts (taiko), the pull, the old hands (warm chords) -----------------
taiko(44.1 + 0.2, 0.25, 60, -0.3);
taiko(47.8 + 0.2, 0.25, 60, 0.3);
koto(44.8, inn(1, 0), 0.3, -0.3, 1, 1.5);
for (const [t, p] of [[46.2, -0.3], [49.0, 0.3]]) {
    koto(t, yo(0, -1), 0.4, p);
    koto(t + 0.03, yo(2, -1), 0.3, p);
    koto(t + 0.06, yo(4, -1), 0.3, p);
    flute(t, 1.8, yo(2, 0), 0.12, p);
}

// --- 9 · The red returns (yo): a pluck for every thread that comes back; the melody --------------
for (const [i, t] of [50.8, 51.3, 51.9, 52.4, 52.9, 53.4, 54.0, 54.5, 55.0, 55.5].entries()) koto(t, yo([0, 2, 4, 1, 3, 0, 2, 4, 3, 0][i], 1), 0.3, (i % 2 ? 0.4 : -0.4));
for (let b = 0; b < 14; b++) koto(50 + b * 0.5, yo([0, 4, 2, 4][b % 4], -1), 0.18, 0);
flute(52.0, 2.4, yo(2, 0), 0.14, -0.1);
flute(54.5, 2.4, yo(4, 0), 0.15, 0.1);

// --- 10 · The bridge of threads: a rising arpeggio as it weaves; the children meet ---------------
for (let b = 0; b < 16; b++) koto(57.3 + b * 0.125, yo(b, -1 + Math.floor(b / 8) * 0), 0.24, -0.6 + b * 0.08);
for (const d of [0, 2, 4]) koto(61.0 + d * 0.02, yo(d, 0), 0.38, 0);
flute(59.5, 2.4, yo(3, 0), 0.14, 0);

// --- 11 · Ending (yo): the title melody again, slower; the seal on the bell; ring out ----------
[[62.0, 0, -1], [62.8, 2, 0], [63.6, 4, 0], [64.4, 3, 0], [65.2, 1, 1], [66.0, 0, 1]].forEach(([t, d, o], i) => koto(t, yo(d, o), 0.4, -0.3 + i * 0.12));
flute(63.2, 3.2, yo(2, 1), 0.14, 0.1);
bell(66.0, D - 12, 0.22);
koto(66.0, yo(0, -1), 0.45, 0);
koto(66.02, yo(2, -1), 0.3, 0);

// --- master: soft limit, fades, write -------------------------------------------------------------
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const g = 0.75 / (peak || 1);
const out = Buffer.alloc(44 + N * 4);
out.write('RIFF', 0); out.writeUInt32LE(36 + N * 4, 4); out.write('WAVE', 8);
out.write('fmt ', 12); out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(2, 22);
out.writeUInt32LE(SR, 24); out.writeUInt32LE(SR * 4, 28); out.writeUInt16LE(4, 32); out.writeUInt16LE(16, 34);
out.write('data', 36); out.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
    const t = i / SR, fade = Math.min(1, t / 0.4) * Math.min(1, (DUR - t) / 1.5);
    const s = (v) => Math.max(-32767, Math.min(32767, Math.round(Math.tanh(v * g * 1.4) * fade * 32767)));
    out.writeInt16LE(s(L[i]), 44 + i * 4);
    out.writeInt16LE(s(R[i]), 46 + i * 4);
}
const dir = path.dirname(fileURLToPath(import.meta.url));
const name = MUSIC ? 'mix.wav' : 'sfx.wav';
fs.writeFileSync(path.join(dir, name), out);
console.log(name, DUR + ' s', 'gain', g.toFixed(3));
