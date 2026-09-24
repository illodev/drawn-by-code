---
name: sound
description: Music, sound effects and mixing for drawn-by-code videos. Use it when choosing or cutting music, syncing the animation to the beat, placing sound effects (sfx) or generating new ones with ElevenLabs, and when adding the audio to the MP4.
---

# Sound

The video is cut **to the music**, not the other way round: tempo first, cuts after.

## Music

- Find the BPM and the first beat (`beatOffset`). At 120 BPM one beat = 0.5 s and a
  4-beat bar = 2 s. Declare `bpm` and `beatOffset` in the scene.
- If the track doesn't fit the duration, cut it by bars with ffmpeg:
  soft intro → strong entry → groove → the intro returns → final hit.
- Leave 1.5–2.5 s at the end to read the closing line.
- Licenses: Pixabay allows commercial use without attribution, but **not redistributing
  the track on its own**; don't commit it to the repo (do commit the cutting script). If
  YouTube claims it via Content ID, dispute it with the license.

### Synthesized music (license-free)

If there is no track, it can be generated with code: `sandbox/2026-09-24-exquisite-corpse/music.mjs`
writes a WAV with kick, snare, hi-hat, bass, sitar and a filtered pad, and changes
texture at the same seconds as the scene's segments. It is deterministic, so the `.wav`
is not committed: it is regenerated. Without listening to it, check it with the waveform
(`ffmpeg -i mix.wav -filter_complex showwavespic=s=1600x240 -frames:v 1 wave.png`) and
`volumedetect`: no segment should end up nearly flat.

### Generated music (ElevenLabs Music)

`POST https://api.elevenlabs.io/v1/music` (key in `ELEVENLABS_API_KEY`, never in the repo;
commercial use = paid plan; the track is third-party audio: keep it in the experiment's
`private/` or `out/`, never committed).
- A plain `prompt` ignores tempo and timings («120 BPM, drop at 10 s» gave ~96 BPM with
  the drop at 24 s). A `composition_plan` (global styles with «120 bpm», sections with
  `duration_ms`, `respect_sections_durations: true`) gets the tempo right, but sections
  still don't land where asked.
- So: generate with a plan, **measure** it (`node engine/tempo.mjs track.mp3`: BPM, first
  beat, dB per half second → where the build, the drop and the ending really are), then
  cut it by bars with ffmpeg (`atrim` + 30 ms `acrossfade`) so each section lands on the
  edit. Example: `sandbox/2026-09-24-saas-promo/cut-music.sh`.

## Effects

- Library in `assets/sfx/` (33 paper, office and cartoon effects). The prompts they were
  generated with are in `assets/sfx/generate-sfx.mjs`: for a new one, add it to `SFX`
  and run `ELEVENLABS_API_KEY=… node assets/sfx/generate-sfx.mjs name`. The key never
  goes into the repo. Commercial use of ElevenLabs = paid plan.
- Every visible action with weight gets its sound (impacts, appearances, writing), but
  not everything: background effects at -13/-17 dB, hits at -4/-6 dB.
- Place them on the **frame of contact**, not on the frame where the movement starts.

## Mixing

`audio.json` in the experiment folder:

```json
{ "music": "music-cut.mp3", "musicDb": -2, "duration": 6.5, "sfxDir": "../../assets/sfx",
  "cues": [["pop", 1.0, -10], ["stamp", 2.5, -4], ["scribble", 3.0, -15]] }
```

`node engine/mix.mjs sandbox/x/audio.json` → `mix.wav`; with `audio: { mix: 'mix.wav' }`
in the scene, `render.mjs` adds it automatically. If you move a shot, move its cues.

- **`"align": "onset"`** (recommended): a cue's second is when its hit is *heard*. Many
  effects start with a breath of air (page_turn 0.16 s, tick 0.8 s into the file); without
  it they land a drawing or more late. Then write the contact second from the block's code
  (its landing/beat constants) as is.
- **A track that stops dead** before the end card holds: throw its last half second through
  a delay in time (`aecho` at eighth notes, decaying) and fade by the end; it rings out in
  its own key without you having to listen (see `sandbox/2026-09-24-saas-promo/cut-music.sh`).
- **Private music**: point `audio.mix` at a file in `private/`; `render.mjs` skips a missing
  mix, so the scene still renders without the private folder.

## Lessons

- 2026-09-23 · paper-short · A silence mid-video looks like a technical fault: if the music stops, make it on a clear, brief hit.
- 2026-09-24 · exquisite-corpse · With the kick at full and the pad low, the quiet segments were nearly mute after normalizing: balance per segment by looking at the waveform.
