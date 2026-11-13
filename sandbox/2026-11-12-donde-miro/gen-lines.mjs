// What he says, to the people he sees (never to us), in Rafael's voice on Eleven v4,
// laid over the present's sounds: sfx.wav (gen-sfx.mjs film) + lines → mix.wav.
//   NODE_USE_ENV_PROXY=1 node sandbox/2026-11-12-donde-miro/gen-lines.mjs [--no-voice]
// Takes are cached in private/audio/ by a hash of text + voice + model (never committed).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url)), A = path.join(dir, 'private/audio');
const key = process.env.ELEVEN_KEY ?? process.env.ELEVENLABS_API_KEY ?? 'proxy';
const VOICE = 'orF2qy9215xjwqqxqsWW', MODEL = 'eleven_v4'; // «Rafael - Expressive and Theatrical»
// [id, earliest start (s; 'honk' = just after the bus's horn), text]
const LINES = [
    ['paulino', 1.4, '¡Buenos días, Paulino!'],
    ['matias', 'honk', '¡Matías! ¿Y esa bocina?'],
    ['anselmo', 12.1, 'Apúntamelo, Anselmo, que hoy no llevo suelto.'],
    ['carmen', 17.0, 'Ya voy, Carmen… ya voy.'],
    ['nina1', 19.5, '¿Y la niña?'],
    ['nina2', 21.9, 'Si estaba aquí…'],
    ['ahi', 25.2, 'Ah… ahí estás.'],
];
const BUS_AT = 2.7, DUR = 32;
const dur = (f) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());
// where the horn is in the bus take: its loudest tenth of a second in the second half
const pcm = execFileSync('ffmpeg', ['-v', 'error', '-i', path.join(A, 'sfx-bus.mp3'), '-ac', '1', '-ar', '8000', '-f', 's16le', '-'], { maxBuffer: 1 << 26 });
let honk = 0, best = 0;
for (let w = Math.floor(pcm.length / 2 / 800 / 2); w < Math.floor(pcm.length / 2 / 800); w++) {
    let e = 0;
    for (let i = 0; i < 800; i++) { const v = pcm.readInt16LE((w * 800 + i) * 2); e += v * v; }
    if (e > best) { best = e; honk = w / 10; }
}
const sched = [];
let free = 0;
if (!process.argv.includes('--no-voice')) {
    for (const [id, at, text] of LINES) {
        const h = crypto.createHash('sha1').update(JSON.stringify([VOICE, MODEL, text])).digest('hex').slice(0, 10), f = path.join(A, `line-${id}-${h}.mp3`);
        if (!fs.existsSync(f)) {
            const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`, { method: 'POST', headers: { 'xi-api-key': key, 'Content-Type': 'application/json' }, body: JSON.stringify({ text, model_id: MODEL }) });
            if (!res.ok) { console.error(id, res.status, (await res.text()).slice(0, 200)); process.exit(1); }
            fs.writeFileSync(f, Buffer.from(await res.arrayBuffer()));
            console.log('generated', id);
        }
        // a take comes with silence at both ends: cut it, so times are of the words
        const w = f.replace(/\.mp3$/, '.trim.wav'), cut = 'silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.03';
        if (!fs.existsSync(w)) execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', f, '-af', `${cut},areverse,${cut},areverse`, w]);
        const t0 = Math.max(at === 'honk' ? BUS_AT + honk + 0.45 : at, free + 0.25), d = dur(w);
        sched.push({ id, f: w, t0, t1: t0 + d, text });
        free = t0 + d;
    }
}
// the present's sounds drop 8 dB under each line (0.15 s down, 0.3 s back up)
const env = sched.map((s) => `(1-0.6*clip((t-${(s.t0 - 0.15).toFixed(2)})/0.15,0,1)*clip((${(s.t1 + 0.3).toFixed(2)}-t)/0.3,0,1))`).join('*') || '1';
const inputs = ['-i', path.join(dir, 'sfx.wav'), ...sched.flatMap((s) => ['-i', s.f])];
const graph = `[0]volume='${env}':eval=frame[bed];` + sched.map((s, i) => `[${i + 1}]loudnorm=I=-16:TP=-2,adelay=${Math.round(s.t0 * 1000)}:all=1[v${i}];`).join('') + `[bed]${sched.map((_, i) => `[v${i}]`).join('')}amix=inputs=${sched.length + 1}:normalize=0:duration=longest,atrim=0:${DUR},alimiter=limit=0.92[o]`;
execFileSync('ffmpeg', ['-v', 'error', '-y', ...inputs, '-filter_complex', graph, '-map', '[o]', '-ar', '48000', path.join(dir, 'mix.wav')]);
console.log('horn at', (BUS_AT + honk).toFixed(1), 's');
for (const s of sched) console.log(s.t0.toFixed(2).padStart(6), s.t1.toFixed(2).padStart(6), s.id.padEnd(8), s.text);
