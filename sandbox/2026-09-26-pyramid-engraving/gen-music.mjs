// Generates the score for pyramid-engraving with ElevenLabs Music from a composition plan: one
// section per shot, at the length of its shot in the film (half-time feel on a 120 bpm grid),
// so each change of colour falls on a cut. The script's direction: outside, the pulse is barely
// there; in the galleries it organises movement; in the core it becomes resonance; three sound
// families (mineral mass, metallic vibration, the seed). The track is third-party audio: it
// goes to private/audio/ and is never committed. The key is read from the environment.
//
//   ELEVENLABS_API_KEY=… node sandbox/2026-09-26-pyramid-engraving/gen-music.mjs [name]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const key = process.env.ELEVENLABS_API_KEY;
if (!key) { console.error('ELEVENLABS_API_KEY is not set'); process.exit(1); }
const name = process.argv[2] ?? 'music-eleven';
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), 'private/audio', name + '.mp3');

const S = (section_name, ms, pos, neg = []) => ({ section_name, duration_ms: ms, positive_local_styles: pos, negative_local_styles: neg, lines: [] });
const plan = {
    positive_global_styles: ['120 bpm half-time feel', 'cinematic ambient score', 'archaeological mystery', 'ancient and alien', 'D minor', 'low strings', 'frame drum', 'bowed metal', 'glass harmonica', 'instrumental'],
    negative_global_styles: ['vocals', 'singing', 'lyrics', 'pop drums', 'electronic dance beats', 'dubstep', 'comedy'],
    sections: [
        S('The plate, desert at dusk', 6600, ['almost silent', 'desert wind texture', 'one very low drone', 'a faint pulse barely there'], ['drums', 'melody']),
        S('The first joint wakes', 5000, ['a low hum rising', 'soft stone-like frame drum hits', 'a single metallic ring at the end'], ['loud']),
        S('The pyramid opens', 7000, ['slow heavy waves of low brass and drums', 'grinding cello clusters', 'then a held pause with only a mechanical ticking pulse'], ['fast']),
        S('Matter takes shape', 7000, ['short pulses', 'dry wooden and stone clicks in rhythm', 'glassy plucks growing denser', 'organised, curious'], ['epic']),
        S('Gravity has architecture', 7000, ['one long phrase', 'low drone sliding upwards', 'circular bowed metal', 'disorienting, weightless'], ['hits', 'drums']),
        S('The inside no longer fits', 7000, ['resonant sustained chords', 'the pulse dissolves into resonance', 'vast, cathedral reverb', 'drops to hush at the very end'], ['drums']),
        S('The nursery', 7000, ['three separate tones slowly tuning into one chord', 'glass harmonica', 'shimmering', 'a soft dry click then air at the end'], ['drums', 'loud']),
        S('A sky inside another', 7000, ['wide stereo shimmer', 'wordless airy synth choir pad without syllables', 'starfield sparkle', 'returns to the low mineral hum at the end'], ['vocals', 'lyrics', 'words']),
        S('The stone goes back', 5000, ['three heavy spaced low hits', 'the machine hum slowing down', 'a thin high tone rising and lingering'], ['fast']),
        S('One more star', 5000, ['only wind and a single fading high tone', 'still', 'a last soft low chord'], ['drums', 'loud']),
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
