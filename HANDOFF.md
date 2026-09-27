# Handoff · carrying on on a local machine

Written 2026-09-27 at the end of a long cloud session, so a Claude Code session on the
user's own computer (with a GPU) can pick up where it left off. Read `CLAUDE.md` first,
then this. The user talks in Spanish; the repo stays in English.

## Why local now

The cloud container has no GPU: WebGL runs in SwiftShader (software), and a film frame of
the engraving style took minutes (the full 63.6 s film would have taken more than a day).
On the user's laptop (Intel UHD, Mesa, Linux) `--gpu` renders a heavy frame in ~0.4 s, so
the whole film takes ~10–15 minutes. Iterate with renders there, not with stills only.

## Setup

```bash
git pull
npm install
sh engine/setup.sh            # checks ffmpeg etc. (or install ffmpeg yourself)
node engine/render.mjs sandbox/2026-09-26-pyramid-engraving/scene.js --at 34 --gpu
```

`--gpu` probes GL backends in turn and prints one `GPU try …` line each; on this laptop
`angle-gl` gives `Mesa Intel(R) UHD Graphics`. `MOTION_ANGLE=<backend>` forces one. Without
`--gpu` the engine falls back to software GL (slow). Chrome is found at its usual path, or
set `CHROME_PATH`.

## Where the work is: `sandbox/2026-09-26-pyramid-engraving/`

«La pirámide que fabrica cielos» (the ChatGPT script, shots PIR-01…PIR-10), 63.6 s at
24 fps, engraving style (`styles/engraving/`, skill `style-engraving`), charcoal on toothed
paper and an aged print, opened and closed by a printed plate.

- `scene.js` → `film.js` (plate, camera, shot selection, story time) → one module per
  shot: `pyramid.js` (+ `terrain.js`), `gallery.js`, `shaft.js`, `resonance.js`,
  `nursery.js`, `seed.js`, `apex.js`, `star.js`; furniture in `props.js`.
- `bench.js`: a temple corner with one view per element (0 corner, 0.25 capital, 0.5
  ceiling, 0.75 floor, 1.0 wall close-up), for detail work beside the Dendera plate.
- `review.md` (rounds 0–4), `brief.md`, `audio.json`, `gen-music.mjs`.

### State

- All ten shots built; round 4 (detail pass) done and committed: dense temple walls, the
  Claude creature on the capitals (the user's choice, in the place of Hathor's face),
  ceilings in bands, flagstone floors, limestone up close outside, engraved rings and rods,
  carried walkways in the shaft, figures to the Egyptian canon. See `review.md`.
- **The full render of the current code has not been made or reviewed yet.** The file in
  `render/pyramid-engraving.mp4` is older.

### Next steps

1. Full render with `--gpu` → mix audio → mux → the review loop (skill `review`: sheet,
   frames at full size) → fix what it finds → render again.
2. Open items (`review.md`): banding in the seed's sky (vertical bands at 50 s); the cut
   from the nursery to the outside; verify in frames the seed's close-up tint, the
   joint's last blue answer, the capstone's size; loose stones in shade under the shaft's
   bridge still read as blobs; the vultures on the ceiling read thin seen edge-on.
3. Publish: `render/pyramid-engraving.mp4` (crf 26), `render/strip.jpg`
   (`engine/strip.mjs`), `render/pyramid-engraving.gif` (`engine/gif.mjs`), the README
   gallery/cover line, the `sandbox/INDEX.md` row, and an X thread text for the video.

### Audio

`node engine/mix.mjs sandbox/2026-09-26-pyramid-engraving/audio.json` → `mix.wav` (music
from `private/audio/music-eleven.mp3`, made with ElevenLabs by `gen-music.mjs`, at −5 dB,
plus 30 cues from `assets/sfx/`). `render.mjs` adds `mix.wav` on its own when it exists.
Or mux afterwards: `ffmpeg -i video.mp4 -i mix.wav -c:v copy -c:a aac -b:a 256k -shortest out.mp4`.
`private/` folders and `references/` are **not in git and stay that way** (the repo is
public; the user decided on 2026-09-27 to keep them out): client material, third-party
footage and music. On a fresh clone the pyramid's music is missing: the user copies
`music-eleven.mp3` (sent through the chat) into
`sandbox/2026-09-26-pyramid-engraving/private/audio/`, or it is regenerated with
`gen-music.mjs` (which gives a different take). New music or sfx need an ElevenLabs key in the environment (`ELEVENLABS_API_KEY`); never
commit or print a key.

## How the user works (keep doing this)

- Show stills (frames) before long renders; send what you render, then iterate on their
  notes. They notice every detail: crop at full size before showing anything.
- Detail is the job (`CLAUDE.md` «The detail bar»): no blank stone, ceiling or floor;
  every element its own pieces and textures; hands via the `hands` skill.
- One commit per round, `review(<experiment>): round N · <lesson>`, experiment and skills
  together; distil lessons into the skills. Never rewrite history. Work on `main`.
- Don't interrupt a running render without asking. Never say «Tienes razón».

## Gotchas learnt the hard way

- Never wait with `until ! pgrep -f "<pattern>"`: the waiting shell matches its own
  pattern and waits forever. Wait on the PID (`tail --pid=<pid> -f /dev/null`).
- The engraving renderer memoises its layer by key: give every view its own key.
- In software GL every branch of a shader runs for every pixel; if you ever render without
  a GPU, profile first (half size = 4× less if fragment-bound), then cut call sites.
- The film's story time is not film time: `storyTime(t)` in `film.js` (plate first).

## Other experiments

`sandbox/INDEX.md` lists them all. `felt-cats` is paused waiting for exactly this: a GPU
machine for arms, physics and iteration (see its folder and the `style-felt3d` skill).
