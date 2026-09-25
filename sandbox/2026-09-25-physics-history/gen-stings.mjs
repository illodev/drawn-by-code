// Generates the two title cards' music with ElevenLabs, in the score's style (whimsical
// orchestral, D major, ~118 bpm): an opening flourish and a closing cue that resolves on a
// final chord. Third-party audio: written to private/audio/, never committed.
//
//   ELEVENLABS_API_KEY=… node sandbox/2026-09-25-physics-history/gen-stings.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const key = process.env.ELEVENLABS_API_KEY;
if (!key) { console.error('ELEVENLABS_API_KEY is not set'); process.exit(1); }
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'private/audio');
const G = ['118 bpm', 'whimsical orchestral score', 'animated science documentary', 'D major', 'chamber orchestra', 'celesta', 'pizzicato strings', 'instrumental'];
const NEG = ['vocals', 'singing', 'drums kit', 'electronic beats'];
const S = (name, ms, pos) => ({ section_name: name, duration_ms: ms, positive_local_styles: pos, negative_local_styles: [], lines: [] });
const CUES = {
    'sting-intro': [S('Opening title', 10000, ['a bright magical opening flourish', 'celesta glissando and a warm string swell', 'night sky wonder', 'settles softly'])],
    'sting-outro': [S('Closing title', 10000, ['a playful comic tune', 'pizzicato hops like a cat jumping', 'clarinet', 'ends on a warm resolving final chord with a celesta twinkle'])],
};
for (const [name, sections] of Object.entries(CUES)) {
    const res = await fetch('https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128', {
        method: 'POST', headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ composition_plan: { positive_global_styles: G, negative_global_styles: NEG, sections }, respect_sections_durations: true }),
    });
    if (!res.ok) { console.error(name, res.status, await res.text()); continue; }
    fs.writeFileSync(path.join(dir, name + '.mp3'), Buffer.from(await res.arrayBuffer()));
    console.log('ok', name);
}
