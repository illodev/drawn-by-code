// Our own track for the felt cats (the reference's song stays in out/, never used): a
// cowboy hoedown at the reference's tempo (123 bpm), a soft 4 s intro while the cats bow
// and open their arms, then the full band from the shuffle (4.1 s) to the end. ElevenLabs
// Music from a composition plan; the track is third-party audio → private/audio/.
//   ELEVENLABS_API_KEY=… node sandbox/2026-09-25-felt-cats/gen-music.mjs [name]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const key = process.env.ELEVENLABS_API_KEY;
if (!key) { console.error('ELEVENLABS_API_KEY is not set'); process.exit(1); }
const name = process.argv[2] ?? 'hoedown';
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), 'private/audio', name + '.mp3');
const S = (section_name, ms, pos, neg = []) => ({ section_name, duration_ms: ms, positive_local_styles: pos, negative_local_styles: neg, lines: [] });
const plan = {
    positive_global_styles: ['123 bpm', 'playful country hoedown', 'cowboy line dance', 'banjo', 'fiddle', 'upright bass', 'stomp and clap', 'cute and funny', 'G major', 'instrumental'],
    negative_global_styles: ['vocals', 'singing', 'lyrics', 'slow', 'sad', 'electronic', 'epic'],
    sections: [
        S('Intro: the cats bow', 6000, ['solo banjo picking, soft', 'a quiet walking bass', 'anticipation', 'a short fiddle pickup at the very end'], ['drums', 'loud']),
        S('Hoedown', 18000, ['full band enters on the downbeat', 'driving stomp-clap on every beat', 'fiddle melody', 'banjo rolls', 'bouncy and silly', 'ends on a big final hit with a cymbal-free stomp'], ['fade out', 'soft']),
    ],
};
const res = await fetch('https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128', {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ composition_plan: plan, respect_sections_durations: true }),
});
if (!res.ok) { console.error(res.status, await res.text()); process.exit(1); }
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, Buffer.from(await res.arrayBuffer()));
console.log(out);
