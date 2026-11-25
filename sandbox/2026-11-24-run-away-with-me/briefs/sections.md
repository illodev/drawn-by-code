# Brief · building one section of the film (shared by every section agent)

## The film

A videoclip for «Run Away With Me» (Carly Rae Jepsen), the whole song (251.4 s), drawn with
code in the **retro-neon drawn manner** the user approved: a hand-drawn neon illustration,
flat neon inks (magenta, violet, indigo, salmon, cyan, gold), a thick dark brush line that
boils on twos, light laid on as loose strokes, neon tubes that glow. The user's words
(translated): «retro neon, but not the typical empty one»; «very Miami: sex, drugs, party,
the love of two people; obviously the sex would not be explicit»; «the drug use would lead to
lights, maybe visual hallucinations; we have to catch the music's jumps»; «something more
homemade, this drawn style, not a 3D render»; «pixel perfection». The story: one night in
1985 Miami Beach, from the party to the sunrise: excess, escape, love, dawn.

Read first, in this order:
1. `sandbox/2026-11-24-run-away-with-me/brief.md` (the idea, the song's map with every jump,
   the shot list v1) and `review.md` (rounds 1–5: what the user asked and what went wrong).
2. `sections/README.md` (the contract your section must follow) and `full.js` (the player).
3. The approved look: `sections/drive.js` + `film.js` + `set/drawn.js` (the causeway section:
   how a frame is built, the occlusion of light, the blackouts) and `styles/retro-neon/ink.js`
   (Ink.brush / shape / hatch / strokes / occlude, Ink.PAL). Render a few stills of
   `drive.js` (`node engine/render.mjs sandbox/2026-11-24-run-away-with-me/drive.js --at 3,9,20,31,51 --size 960 --out <your scratch>`)
   and look at them: that is the bar.
4. The user's reference for the manner: `/root/.claude/uploads/94af28cb-63fe-5200-b08a-2d41cf52f418/ec74e9e2-image.jpg`.
5. `.claude/skills/engine/SKILL.md` (determinism, performance) and `.claude/skills/animate/SKILL.md`
   (every shot an action with a verb, density in layers, cuts on the beat, nothing still > 1 s).
6. Word times of the song (private, do not commit): `sandbox/2026-11-24-run-away-with-me/out/lines.json`;
   band levels per frame: `Song.env(name, T)` in `song.js`; the map: `review/song-map.png`.

## The cast

Two adults, from their approved sheets, repainted in the film's inks: `ref/neon/<who>-1-<view>.png`
for who ∈ her, him and view ∈ front, tq (three-quarter front), side, back. Draw them with
`Couple.standing(g, cam, who, feet, o)` (whole figure at a world point; `view`, `flip`, `lean`,
`sway`, `wind`, `T`, `d`, `cut` in metres from the top of the head) or crop them. **Only these
four standing views exist**: stage around it (silhouettes, crops at the shoulders, backs,
distance, figures behind things, cut-aways to details), never invent a pose by bending a
drawing, never draw new faces or hands by guesswork. Nothing explicit: intimacy by ellipsis
(light through blinds on two silhouettes, a hand on a sheet is too much without a drawing:
prefer objects and light). Drugs: one pill and its effect on the world, never the mechanics.

## The bar

- The manner of the approved section, exactly: same palette, same line, light as strokes,
  neon glow only on what emits, every opaque thing hides the light behind it (`Ink.occlude`),
  sky things fixed in the world, nothing that teleports or strobes, drawings on twos.
- Dense, never the empty synthwave plain: every frame a lived-in place with layers (a moving
  background, secondary things on the offbeat, the protagonists).
- Every shot one action you can say with a verb; cuts on bar lines (bar n at
  `Song.B(n) = 0.415 + n·2.01672`), the jumps of your stretch each given their picture.
- Sets in metres through `Neon.camera`; check overlaps, gaps, tangents and scale at 100 %.
- Cost: under ~250 ms a frame at 1920.

## How to work

- Own only: `sections/<name>.js`, any `set/<name>-*.js` / `props/<name>-*.js` you create, and
  `dev/<name>/` (your dev scene: copy `drive.js`'s pattern with your section's from/duration,
  load your files in `uses` after `sections/registry.js`). Do not edit shared files (film.js,
  drawn.js, causeway.js, car.js, couple.js, ink.js, neon.js, song.js, full.js): if you need a
  change there, do it in your own file (a copy or a wrapper) and say so in your report.
- Wrap every file in an IIFE; globals only `Sections.<name>` and names prefixed with your
  section's name.
- Render stills at 1920 and crop them; render your whole section at 960 to
  `dev/<name>/out/` and look at its contact sheet (`ffmpeg -i x.mp4 -vf fps=3,scale=480:-1,tile=6x5 -frames:v 1 sheet.jpg`).
- Do not use git. Do not spend credits (no ElevenLabs). Time: about 70 minutes; deliver a
  complete, clean section rather than a perfect half one.
- Report: the shot list with song times and the action of each, what you checked at 100 %,
  the files, anything still off, and any change you need in a shared file.
