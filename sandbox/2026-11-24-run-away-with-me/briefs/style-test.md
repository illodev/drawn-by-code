# Brief · style test (shared by every agent on it)

## What this is

A videoclip for «Run Away With Me» (Carly Rae Jepsen), drawn with code in a new style,
**retro-neon**: 1980s Miami at night as an airbrushed synthwave illustration lit by neon.
The user asked for «retro neon, but not the typical empty one» and «very Miami». The style
test is 8 s of the song (0:59–1:07): a white convertible with the two protagonists crossing
the causeway over Biscayne Bay towards downtown, a streetlamp over them on every beat, the
crest of the bridge in the bar where the bass leaves (everything holds its breath), and the
drop at 1:05 where a pill's trip arrives (tracers, halos, colour turning, the city breathing).

Read before anything: `sandbox/2026-11-24-run-away-with-me/brief.md`, the engine skill
(`.claude/skills/engine/SKILL.md`: determinism, no `Math.random`, no state between frames),
the kit `styles/retro-neon/neon.js` (camera, light layer, bloom, glints, tubes), and the scene
`sandbox/2026-11-24-run-away-with-me/scene.js` (its four cameras in `shotCam`).

The user's style references (look at them, do not copy any one): contact sheets at
`/tmp/claude-0/-home-user-drawn-by-code/94af28cb-63fe-5200-b08a-2d41cf52f418/scratchpad/sheetA.jpg`
and `sheetB.jpg` (single images in `.../scratchpad/thumbs/01.png` … `12.png`). What they share:
deep indigo-violet nights with a magenta-to-orange horizon glow, hot pink, cyan, violet and
gold light, airbrushed gradients (never a flat CG fill on a large surface), rim light in two
colours, neon tubes with white-hot cores, light reflected in wet ground and water as long
streaks, sparkles, and DENSITY: a city of lit windows, palms, signs, cars.

## The bar

- **Detail is the job.** Every element is a set of pieces that say what it is made of: a
  car has panel gaps, chrome, rubber, glass, leather; a tower has floors, mullions, setbacks,
  a crown. Crop your work at full resolution (render at `--size 1920` and look at crops)
  before calling it done.
- **Airbrushed illustration, not low-poly 3D.** Large faces get gradients (light falling
  off, sky reflected on what faces up, the city's glow from below, a warm lamp passing),
  edges that face a light get a thin bright rim, glass reflects the sky. No large flat fill.
- **Measured, not guessed:** sizes in metres through the camera (`Neon.camera`, `Neon.poly`).
- **Light goes on both layers:** what emits is painted on the picture (`g`) and on the light
  layer (`L`), which the scene blooms. Keep emitters saturated (pink, red, cyan…): white
  only in the very core, or the bloom burns them to white.
- Deterministic: `Motion.rng('stable seed')` only.
- Cost: the whole frame should stay under ~150 ms at 1920 (`engine/review.mjs` measures it).
  Cache static drawings in sprites (`Motion.sprite` or your own canvas built once).

## How to work

- Own only the file(s) your task names. Do not edit `scene.js`, the kit or another agent's
  file; if you need something from them, say so in your report.
- Make your own dev scene in your own folder (`sandbox/2026-11-24-run-away-with-me/dev/<you>/scene.js`)
  that loads the same `uses` as `scene.js` and frames your element in the cameras of the
  four shots (copy `shotCam` from `scene.js`) plus any close-up you need; render stills with
  `node engine/render.mjs sandbox/2026-11-24-run-away-with-me/dev/<you>/scene.js --at … --size 1920`
  (they land in that folder's `out/stills/`) and look at them with Read. Also render the real
  `scene.js` at the times 1, 3.2, 5, 7 to check your element in place (`--size 1280`).
- Do not use git (no add, no commit). Do not spend credits (no ElevenLabs).
- Report: what you built, the contract (functions, arguments, any coordinates the lead
  needs), what you checked at full resolution, and anything still off (there should be
  nothing still off: fix it first).
