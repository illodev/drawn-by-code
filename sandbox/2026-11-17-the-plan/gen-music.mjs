// Asks ElevenLabs Music for the score of «The Plan» from a composition plan: 120 BPM (the
// film is cut on its half seconds), one section per stretch of the film, each a whole number
// of bars so that the changes fall near the cuts. The take is then measured
// (engine/tempo.mjs) before it is laid under the picture. It goes to private/ and is not
// committed. Paid service: only run with the user's go-ahead. The key is put in by the
// session's proxy (or set ELEVENLABS_API_KEY).
//
//   node sandbox/2026-11-17-the-plan/gen-music.mjs [name]
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url)), name = process.argv[2] ?? 'score';
const out = path.join(dir, 'private', name + '.mp3');
const S = (section_name, ms, pos, neg = []) => ({ section_name, duration_ms: ms, positive_local_styles: pos, negative_local_styles: neg, lines: [] });
const plan = {
    positive_global_styles: ['120 bpm', 'heist film score', 'cool 1960s crime jazz', 'D minor', 'upright bass', 'brushed drums', 'vibraphone', 'muted trumpet stabs', 'bongos', 'tight and dry', 'instrumental'],
    negative_global_styles: ['vocals', 'singing', 'lyrics', 'electronic dance', 'dubstep', 'epic orchestral trailer', 'distorted guitar'],
    sections: [
        S('The building', 8000, ['sparse intro', 'a ticking closed hi-hat on every eighth', 'solo upright bass motif entering', 'a few vibraphone notes', 'quiet, expectant'], ['full band', 'loud']),
        S('The night runs', 4000, ['brushed snare enters', 'the bass starts to walk', 'steady', 'cool'], ['loud']),
        S('The plan', 8000, ['the groove settles', 'walking bass', 'vibraphone melody', 'muted trumpet answers', 'confident, sly'], []),
        S('It works', 12000, ['the band drives', 'bongos join', 'rising tension', 'trumpet stabs on the off-beats', 'building all the way'], ['slow']),
        S('The beat changes', 4000, ['the drums drop out', 'one held dissonant vibraphone chord', 'only the ticking hi-hat', 'suspense'], ['full band', 'walking bass']),
        S('Down', 8000, ['creeping bass riff alone, then brushed drums return', 'low and stealthy', 'slowly building'], ['loud']),
        S('The strong room', 4000, ['snare roll building', 'tense tremolo', 'a big brass hit as the door opens'], ['quiet']),
        S('Out', 4000, ['full band at its loudest', 'fast triumphant riff', 'bongos and trumpet'], ['quiet']),
        S('Revision B', 4000, ['one final stab on the first beat', 'the vibraphone chord rings out', 'the ticking stops', 'ends'], ['fade in', 'new melody']),
    ],
};
const body = path.join(dir, 'private', name + '.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(body, JSON.stringify({ composition_plan: plan, respect_sections_durations: true }));
const r = spawnSync('curl', ['-sS', '-m', '600', '-o', out, '-w', '%{http_code}', '-X', 'POST', 'https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128',
    '-H', 'xi-api-key: ' + (process.env.ELEVENLABS_API_KEY ?? 'sk_proxy'), '-H', 'Content-Type: application/json', '--data-binary', '@' + body], { encoding: 'utf8' });
if (r.stdout.trim() !== '200') { console.error('HTTP', r.stdout, r.stderr, fs.readFileSync(out, 'utf8').slice(0, 600)); fs.rmSync(out); process.exit(1); }
console.log(out, fs.statSync(out).size, 'bytes');
