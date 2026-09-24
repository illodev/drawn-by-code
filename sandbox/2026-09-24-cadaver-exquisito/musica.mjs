// Música sintetizada para el cadáver exquisito: 30 s a 120 BPM, sin muestras ni
// licencias. Cada tramo tiene su textura, y los cambios caen en los mismos golpes que
// los cortes de la escena. Determinista: el mismo código da el mismo fichero.
//
//   node sandbox/2026-09-24-cadaver-exquisito/musica.mjs   → musica.wav (junto a este fichero)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SR = 44100, DUR = 30, BPM = 120, BEAT = 60 / BPM;
const N = SR * DUR;
const L = new Float32Array(N), R = new Float32Array(N);
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
let seed = 7;
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * 2 - 1;

// Tramos (en segundos), igual que `shots` en scene.js
const S = { rana: [0, 5], ojo: [5, 6.5], seta: [6.5, 10.5], engullir: [10.5, 12], medusa: [12, 16.5], vortice: [16.5, 18], calei: [18, 22], cuadro: [22, 23.5], garabato: [23.5, 27.5], bola: [27.5, 28.5], vuelta: [28.5, 30] };
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
    // cuerda con zumbido: armónicos que se van abriendo
    let v = 0;
    for (let h = 1; h <= 7; h++) v += Math.sin(2 * Math.PI * f * h * t + Math.sin(t * 6) * 0.3 * h) / h;
    return v * env(t, 0.005, 0.5) * (1 + 0.3 * Math.sin(2 * Math.PI * 5.5 * t));
};

// Re dórico: D E F G A B C
const D = 50, SCALE = [0, 2, 3, 5, 7, 9, 10, 12];
const deg = (d, oct = 0) => D + SCALE[((d % 7) + 7) % 7] + 12 * (oct + Math.floor(d / 7));

for (let b = 0; b < DUR / BEAT; b++) {
    const t = b * BEAT;
    const full = inS(t, 'seta') || inS(t, 'calei');
    // batería: entra fuerte en la seta y el clímax; la medusa flota sin bombo
    if (full || inS(t, 'garabato')) note(t, 0.4, kick, full ? 0.55 : 0.3);
    if (full && b % 2 === 1) note(t, 0.2, snare, 0.35);
    if (full || inS(t, 'medusa') || inS(t, 'garabato')) {
        note(t + BEAT / 2, 0.05, hat, 0.12, 0.4);
        if (inS(t, 'calei')) note(t + BEAT / 4, 0.05, hat, 0.08, -0.4);
    }
    // bajo en corcheas
    if (full || inS(t, 'medusa')) {
        const line = [0, 0, 3, 4, 0, 0, 5, 4];
        note(t, BEAT * 0.9, bass(hz(deg(line[b % 8], -1))), 0.35);
    }
    // arpegio de sitar en la seta, el clímax y la vuelta
    if (inS(t, 'seta') || inS(t, 'calei') || inS(t, 'rana') || inS(t, 'vuelta')) {
        const arp = [0, 4, 7, 9, 7, 4, 2, 4];
        const soft = inS(t, 'rana') || inS(t, 'vuelta');
        for (let h = 0; h < (inS(t, 'calei') ? 2 : 1); h++) note(t + h * BEAT / 2, BEAT * 1.5, sitar(hz(deg(arp[(b * 2 + h) % 8], 1))), soft ? 0.2 : 0.14, (b % 2 ? 0.3 : -0.3));
    }
    // pizzicato juguetón en el garabato
    if (inS(t, 'garabato')) note(t + BEAT / 2, 0.3, pluck(hz(deg([4, 2, 5, 7][b % 4], 1))), 0.12, 0.2);
}

// colchón: dos sierras desafinadas con un filtro que barre despacio (el «wah»)
let lp = 0, lp2 = 0;
for (let i = 0; i < N; i++) {
    const t = i / SR;
    const quiet = inS(t, 'bola') ? 0.15 : inS(t, 'cuadro') ? 0.6 : 1;
    const root = hz(inS(t, 'medusa') || inS(t, 'vortice') ? deg(3, 0) : deg(0, 0));
    let v = saw(root, t) + saw(root * 1.005, t) + saw(root * 1.5, t) * 0.6;
    const cut = 0.02 + 0.05 * (0.5 + 0.5 * Math.sin(t * 0.9));
    lp += (v - lp) * cut;
    lp2 += (lp - lp2) * cut;
    let s = lp2 * 0.13 * quiet;
    // subidas: el ojo y el vórtice son barridos de ruido y tono que suben
    for (const k of ['ojo', 'vortice']) {
        if (inS(t, k)) {
            const u = (t - S[k][0]) / (S[k][1] - S[k][0]);
            s += Math.sin(2 * Math.PI * (200 + 1200 * u * u) * t) * 0.05 * u + rnd() * 0.04 * u;
        }
    }
    if (inS(t, 'engullir')) {
        const u = (t - S.engullir[0]) / 1.5;
        s += rnd() * 0.07 * Math.sin(u * Math.PI);
    }
    L[i] += s;
    R[i] += s;
}

// normaliza a -1 dBFS y escribe el WAV (16 bits, estéreo)
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
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), 'musica.wav');
fs.writeFileSync(out, buf);
console.log(out);
