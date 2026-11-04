// Generates the score for red-thread with ElevenLabs Music from a composition plan: one
// section per shot, at the shot's length (60 bpm, cuts on whole seconds). The track is
// third-party audio: it goes to private/audio/ and is never committed. Then measure it
// (node engine/tempo.mjs private/audio/score.mp3) and, if sections drift from the cuts,
// cut by bars as in sandbox/2026-09-24-saas-promo/cut-music.sh. Then mix-final.sh.
//
//   ELEVEN_KEY=… node sandbox/2026-11-04-red-thread/gen-music.mjs [name]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const key = process.env.ELEVEN_KEY ?? process.env.ELEVENLABS_API_KEY;
if (!key) { console.error('ELEVEN_KEY is not set'); process.exit(1); }
const name = process.argv[2] ?? 'score';
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), 'private/audio', name + '.mp3');

const S = (section_name, ms, pos, neg = []) => ({ section_name, duration_ms: ms, positive_local_styles: pos, negative_local_styles: neg, lines: [] });
const plan = {
    positive_global_styles: ['60 bpm', 'traditional Japanese instrumental', 'koto', 'shakuhachi', 'cinematic animated short film', 'intimate and emotional', 'D minor pentatonic', 'instrumental'],
    negative_global_styles: ['vocals', 'singing', 'lyrics', 'drum kit', 'electronic beats', 'pop', 'epic trailer'],
    sections: [
        S('Title: ink blooms on paper', 6000, ['solo koto', 'gentle and luminous', 'yo scale', 'sparse plucks', 'morning calm'], ['drums']),
        S('The bridge: neighbours greet', 6000, ['koto melody with a light walking pulse', 'warm', 'shakuhachi answers', 'friendly'], ['sad']),
        S('Screens', 6000, ['the melody thins out', 'cold and distant', 'a single sustained tone', 'emptiness'], ['warm', 'drums']),
        S('Two banks: slogans gather', 8000, ['low taiko heartbeat slowly growing', 'tension', 'dissonant low strings drone', 'in scale'], ['cheerful']),
        S('Shouting: the threads snap', 6000, ['loud taiko hits', 'anger', 'harsh shamisen', 'climax of conflict', 'ends with a deep crash'], ['soft']),
        S('Grey: ink rain', 4000, ['near silence', 'one low koto note', 'desolate', 'rain'], ['drums', 'melody']),
        S('The kite: a gust across the river', 7000, ['hopeful rising koto run', 'wind', 'shakuhachi long note at the catch', 'tender'], ['loud drums']),
        S('Holding on', 7000, ['tension then warmth', 'soft taiko', 'two warm koto chords', 'shakuhachi'], ['aggressive']),
        S('The red returns', 7000, ['the main melody returns', 'growing warmth', 'koto and shakuhachi together', 'yo scale', 'building'], ['dark']),
        S('The bridge of threads', 5000, ['rising koto arpeggios', 'emotional swell', 'reunion'], ['dark']),
        S('Ending', 6000, ['the title melody again, slower', 'resolution', 'a temple bell', 'ringing out to silence'], ['abrupt ending']),
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
