// The present's sounds, generated with ElevenLabs (/v1/sound-generation) and mixed.
// Files go to private/audio/ (never committed); the mix is a .wav (ignored).
//   NODE_USE_ENV_PROXY=1 node sandbox/2026-11-12-donde-miro/gen-sfx.mjs [film|paseo]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url)), A = path.join(dir, 'private/audio');
const key = process.env.ELEVEN_KEY ?? process.env.ELEVENLABS_API_KEY ?? 'proxy';
// name: [prompt, seconds]
const SFX = {
    amb: ['quiet small town square on a grey winter morning, distant traffic hum, a few pigeons cooing, light wind, no voices, no music', 14],
    steps: ['slow footsteps of an old man walking on wet stone pavement with the tap of a wooden walking stick, close, steady pace', 9],
    bus: ['a city bus driving past very close from right to left on a wet street, diesel engine roar, ending with one short loud horn honk', 4.5],
    atm: ['a bank cash machine: four short electronic keypad beeps, then a confirmation tone and the whirr of banknotes being dispensed', 3],
    girl: ['a little girl running closer on pavement with quick light footsteps, giggling happily and out of breath, joyful', 4],
    blower: ['a loud petrol leaf blower revving up and down outdoors, close, harsh two-stroke engine', 3.6],
    scooter: ['an electric scooter whirring past quickly on pavement, with a bicycle bell ringing twice', 3.2],
    giggle: ['a little girl giggling close by, then a short curious hum, soft and happy', 2.5],
};
// cue: [name, starts at (s), gain, loop until (s, optional)]
const MIXES = {
    paseo: { out: 'paseo.wav', dur: 14, cues: [['amb', 0, 0.22], ['steps', 0, 0.5], ['bus', 0.7, 0.9], ['atm', 4.5, 0.55], ['girl', 7.5, 0.9]] },
    film: { out: 'sfx.wav', dur: 32, cues: [['amb', 0, 0.22, 32], ['steps', 0, 0.5, 16.8], ['blower', 0.1, 0.8], ['bus', 2.7, 0.9], ['scooter', 7.3, 0.8], ['atm', 11.3, 0.55], ['girl', 14.8, 0.9], ['giggle', 19.2, 0.75], ['giggle', 21.8, 0.75], ['giggle', 27, 0.6]] },
};
const M = MIXES[process.argv[2] ?? 'film'];
fs.mkdirSync(A, { recursive: true });
for (const name of new Set(M.cues.map((c) => c[0]))) {
    const f = path.join(A, `sfx-${name}.mp3`);
    if (fs.existsSync(f)) continue;
    const res = await fetch('https://api.elevenlabs.io/v1/sound-generation', { method: 'POST', headers: { 'xi-api-key': key, 'Content-Type': 'application/json' }, body: JSON.stringify({ text: SFX[name][0], duration_seconds: SFX[name][1], prompt_influence: 0.5 }) });
    if (!res.ok) { console.error(name, res.status, (await res.text()).slice(0, 200)); process.exit(1); }
    fs.writeFileSync(f, Buffer.from(await res.arrayBuffer()));
    console.log('generated', name);
}
const inputs = M.cues.flatMap(([n, , , loop]) => [...(loop ? ['-stream_loop', '-1'] : []), '-i', path.join(A, `sfx-${n}.mp3`)]);
const graph = M.cues.map(([, at, gain, loop], i) => `[${i}]${loop ? `atrim=0:${loop - at},afade=t=out:st=${loop - at - 1}:d=1,` : ''}loudnorm=I=-18:TP=-2,volume=${gain},adelay=${Math.round(at * 1000)}:all=1[a${i}]`).join(';') + ';' + M.cues.map((_, i) => `[a${i}]`).join('') + `amix=inputs=${M.cues.length}:normalize=0:duration=longest,atrim=0:${M.dur},afade=t=in:d=0.3,afade=t=out:st=${M.dur - 1.2}:d=1.2,alimiter=limit=0.9[o]`;
execFileSync('ffmpeg', ['-v', 'error', '-y', ...inputs, '-filter_complex', graph, '-map', '[o]', '-ar', '48000', path.join(dir, M.out)]);
console.log(M.out, M.dur, 's');
