// The present's sounds for «Paseo», generated with ElevenLabs (/v1/sound-generation) and
// mixed into paseo.wav. Files go to private/audio/ (never committed).
//   NODE_USE_ENV_PROXY=1 node sandbox/2026-11-12-donde-miro/gen-sfx.mjs
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url)), A = path.join(dir, 'private/audio');
const key = process.env.ELEVEN_KEY ?? process.env.ELEVENLABS_API_KEY ?? 'proxy';
// name: [prompt, seconds, starts at (s), gain]
const SFX = {
    amb: ['quiet small town square on a grey winter morning, distant traffic hum, a few pigeons cooing, light wind, no voices, no music', 14, 0, 0.22],
    steps: ['slow footsteps of an old man walking on wet stone pavement with the tap of a wooden walking stick, close, steady pace', 9, 0, 0.5],
    bus: ['a city bus driving past very close from right to left on a wet street, diesel engine roar, ending with one short loud horn honk', 4.5, 0.7, 0.9],
    atm: ['a bank cash machine: four short electronic keypad beeps, then a confirmation tone and the whirr of banknotes being dispensed', 3, 4.5, 0.55],
    girl: ['a little girl running closer on pavement with quick light footsteps, giggling happily and out of breath, joyful', 4, 7.5, 0.9],
};
fs.mkdirSync(A, { recursive: true });
for (const [name, [text, sec]] of Object.entries(SFX)) {
    const f = path.join(A, `sfx-${name}.mp3`);
    if (fs.existsSync(f)) continue;
    const res = await fetch('https://api.elevenlabs.io/v1/sound-generation', { method: 'POST', headers: { 'xi-api-key': key, 'Content-Type': 'application/json' }, body: JSON.stringify({ text, duration_seconds: sec, prompt_influence: 0.5 }) });
    if (!res.ok) { console.error(name, res.status, (await res.text()).slice(0, 200)); process.exit(1); }
    fs.writeFileSync(f, Buffer.from(await res.arrayBuffer()));
    console.log('generated', name);
}
const names = Object.keys(SFX), D = 14;
const inputs = names.flatMap((n) => ['-i', path.join(A, `sfx-${n}.mp3`)]);
const graph = names.map((n, i) => `[${i}]loudnorm=I=-18:TP=-2,volume=${SFX[n][3]},adelay=${Math.round(SFX[n][2] * 1000)}:all=1[a${i}]`).join(';') + ';' + names.map((_, i) => `[a${i}]`).join('') + `amix=inputs=${names.length}:normalize=0:duration=longest,atrim=0:${D},afade=t=in:d=0.3,afade=t=out:st=${D - 0.8}:d=0.8,alimiter=limit=0.9[o]`;
execFileSync('ffmpeg', ['-v', 'error', '-y', ...inputs, '-filter_complex', graph, '-map', '[o]', '-ar', '48000', path.join(dir, 'paseo.wav')]);
console.log('paseo.wav');
