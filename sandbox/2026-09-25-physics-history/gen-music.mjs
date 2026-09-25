// Generates the score for physics-history v2 with ElevenLabs Music from a composition plan:
// one section per scientist, at the length of their scene (120 bpm), so the changes of
// colour fall near the cuts; the track is then measured (engine/tempo.mjs) and cut by bars
// (cut-music.sh) so each section lands exactly on its cut. The track is third-party audio:
// it goes to private/audio/ and is never committed. The key is read from the environment.
//
//   ELEVENLABS_API_KEY=… node sandbox/2026-09-25-physics-history/gen-music.mjs [name]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const key = process.env.ELEVENLABS_API_KEY;
if (!key) { console.error('ELEVENLABS_API_KEY is not set'); process.exit(1); }
const name = process.argv[2] ?? 'music-eleven';
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), 'private/audio', name + '.mp3');

const S = (section_name, ms, pos, neg = []) => ({ section_name, duration_ms: ms, positive_local_styles: pos, negative_local_styles: neg, lines: [] });
const plan = {
    positive_global_styles: ['120 bpm', 'whimsical orchestral score', 'animated science documentary', 'playful and wondrous', 'D major', 'chamber orchestra', 'pizzicato strings', 'celesta', 'instrumental'],
    negative_global_styles: ['vocals', 'singing', 'lyrics', 'drums kit', 'electronic beats', 'epic trailer', 'dubstep'],
    sections: [
        S('Galileo: night sky', 12800, ['night', 'celesta and glockenspiel twinkling like stars', 'soft pizzicato', 'sense of wonder', 'gentle build'], ['loud']),
        S('Newton: the apple', 7000, ['bouncy comic pizzicato', 'bassoon melody', 'playful', 'light woodblock'], ['slow']),
        S('Faraday: the coil', 11200, ['energetic staccato strings', 'brass stabs', 'electric sparkle', 'building tension', 'ends on a bright hit'], ['soft']),
        S('Curie: the radium glow', 7600, ['mysterious', 'glassy pads', 'harp arpeggios', 'eerie soft glow', 'hushed'], ['drums', 'loud']),
        S('Einstein: chasing light', 9200, ['driving string ostinato', 'accelerating', 'rising excitement', 'then a deep ominous low swell', 'cut to near silence at the end'], ['cheerful ending']),
        S("Schrödinger's cat", 10000, ['quirky clarinet and pizzicato', 'tick-tock suspense', 'playful mystery', 'a light comic resolving chord at the very end'], ['epic']),
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
