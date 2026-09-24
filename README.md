# illomotion

Animations and videos made **with code** by Claude: JavaScript paints every frame on a
`<canvas>`, deterministically, and it is rendered to MP4 with Chromium and ffmpeg. No
After Effects and no AI-generated video.

The repo is both a **toolbox** (engine + styles + Claude skills) and a **test bench**:
every experiment in `sandbox/` goes through an automatic review (real frames, checks for
determinism, rhythm and motion) and through human feedback. What is learned goes back
into the skills, so every test improves the next ones.

## Getting started

Requirements: Node 20 or later, Chrome or Chromium, and ffmpeg.

```bash
npm install
node engine/new.mjs my-test --style paper-cutout --duration 5
npm run preview          # http://127.0.0.1:5173
```

With Claude Code, just ask: *"make me a 10 s paper-cutout video for…"*.
The `animate` skill guides the process: brief → script → style test → animatic → final.

## Styles

| Style | Status | Reference |
|---|---|---|
| `paper-cutout`: torn paper, marker, grain, handwriting | approved | [coffee-first](sandbox/2026-09-24-coffee-first/) |
| `70s-poster`: flat acid colors, echoes, sunrays, melting letters | approved | [exquisite-corpse](sandbox/2026-09-24-exquisite-corpse/) |
| `liquid-light`: merging oil blobs, 60s light show projection | approved | [exquisite-corpse](sandbox/2026-09-24-exquisite-corpse/) |
| `kaleidoscope`: mirror symmetry, rotation, color cycling | approved | [exquisite-corpse](sandbox/2026-09-24-exquisite-corpse/) |
| `line`: wobbling black line on white paper | approved | [exquisite-corpse](sandbox/2026-09-24-exquisite-corpse/) |

Replicating a reference video 1:1 (measuring tools, per-drawing choreography, element by
element, parallel agents): the `replicate` skill and `engine/reference.mjs`; worked example
[what-do-you-love](sandbox/2026-09-24-what-do-you-love/).

Transitions between styles (entering through a point, iris, engulf, vortex, frame within
a frame): `engine/transitions.js` and the `transitions` skill.

To add one: the `new-style` skill.

## How it learns

```
brief ─▶ scene.js ─▶ review.mjs ─▶ Claude's critique ─▶ fix  (≤3 rounds)
                                                     │
                                       user feedback ◀┘
                                                     │
      does it generalize? ─▶ style skill / animate / engine / sound / review.mjs
                                                     │
                                             commit per round
```

Experiment and lesson history: [`sandbox/INDEX.md`](sandbox/INDEX.md).

## Licenses

Patrick Hand, Shrikhand and Short Stack fonts under the SIL OFL 1.1 (`fonts/`). The effects in
`assets/sfx/` were generated with ElevenLabs: commercial use requires a paid plan.
