---
name: style-retro-neon
description: Retro-neon style, in testing: 1980s Miami at night as a hand-drawn neon illustration — flat neon inks (magenta, violet, indigo, salmon, cyan, gold), a thick dark brush line that boils on twos, light laid on as loose strokes, neon tubes that glow, reflections drawn as broken strokes, dense cities of lit windows, palms, sets built in metres through one camera, and a «trip» toolkit (tracers, halos, breathing, hoops, the grid). An airbrushed variant (neon.js alone) exists but the user chose the drawn one. Use it for synthwave, outrun, retro neon, 80s, Miami, nightlife, music videos with neon, or when working with styles/retro-neon/.
---

# Style · Retro-neon (in testing)

**The manner is drawn, not rendered.** Round 2 of the style test: the user, shown an
airbrushed 3D-looking version, said «maybe I was looking for something more homemade, this
drawn style, not a 3D render», with a hand-drawn neon illustration as the reference. Its
palette was measured (k-means: magenta #e106d3 18 %, navy #0f0138 15 %, salmon #f45a7f 10 %,
deep blue, violet, blue, indigo, purple, plum, cyan, with orange and gold accents) and the
drawn manner lives in `styles/retro-neon/ink.js`: `Ink.brush` (a stroke that tapers, varies
its pressure and wobbles, a new wobble per drawing: `Ink.boil(t)`, 12 a second), `Ink.shape`
(flat fill + brush line), `Ink.hatch` and `Ink.strokes` (loose strokes of light whose places
belong to the seed and whose line boils), `Ink.occlude(L)` (opaque ink erases the light layer
behind it). The scene is drawn on twos. Cast sheets are repainted in these inks per material
(`tools/neonize.py` in the style test). Everything below about the airbrushed manner still
describes `neon.js` (camera, light layer, bloom), which the drawn manner keeps for neon glow.

Style test: `sandbox/2026-11-24-run-away-with-me/` (scene.js, render/run-away-with-me.mp4,
review/sheet.jpg): 8 s of «Run Away With Me», a convertible on a causeway over Biscayne Bay,
waiting for the user's verdict. Built from twelve synthwave references the user gave (kept
out of the repo). The user's brief for the style: «retro neon, but not the typical empty
one», «very Miami».

## Code

`styles/retro-neon/neon.js` → `const N = Neon.make(env)` in `setup`.

- **Sets in metres through one camera.** `Neon.camera({ pos, yaw, pitch, roll, f, W, H })`
  (x right, y up, z forward; pitch > 0 looks up), `cam.p([x, y, z]) → [sx, sy, depth]`,
  `cam.view`, `Neon.poly(cam, pts)` (clipped at the near plane), `Neon.path`.
- **Two paintings per frame: the picture and its light.** `const L = N.light()` gives this
  frame's light layer (logical units, additive); emitters are painted on `g` AND `L`
  (`N.tube`, `N.glint`; `{ lightOnly }` for halos); `N.bloom(g, L, { strength, core, split })`
  adds the light and its glow (a pyramid of halvings summed at low resolution; `split` is a
  red/cyan fringe in px for the trip).
- **The light layer has no depth.** Bloom the far world first (`N.bloom`, then `N.light()`
  again for the near world), and let a near object that must hide light behind it be painted
  on its own layer (`Motion.layer`) that erases the light layer (`destination-out`) before its
  own lights are added (see the car in the style test's `scene.js`).
- `N.sky(g, y0, y1, { stops, stars })`, `N.reflect(g, layer, y0, y1, { t, amp, alpha })`
  (a layer mirrored in water in rippling rows), `N.rim(g, L, img, …, box, lights)` (the
  edge of a cut-out facing each light), `N.tint(g, img, …, box, col, a)` (a cut-out into the
  night), `N.grain(ctx, t)` in `post`.
- **The trip:** `N.trails(L, paint(L, t'), t, { n, dt, decay })` (tracers: the emitters
  re-painted at earlier times into one half-resolution buffer), `N.breathe(g, layer, amp, t)`,
  `N.form(L, 'tunnel'|'spiral'|'lattice'|'cobweb', cx, cy, r, phase, col, a)` (Klüver's form
  constants), `N.snow(L, frame, n, col)`, and the grid on the ground (the style test's
  `tripGrid`).
- Colour: `Neon.PAL` (night stops, neon, Miami pastels `deco`, the plum `ink` of the cast
  sheets), `Neon.mix`, `Neon.shift(col, deg, sat)`, `Neon.rgba`, `Neon.hex`.
- `await Neon.image(path)` loads an image in `setup` (null when missing).
- The music drives the picture through the experiment's `song.js` (`Song.env('kick'|'bass'|
  'mid'|'high', T)`, 0..1 per frame, VU-smoothed; `Song.B(bar)`).

## Style rules

- **Dense, never the empty synthwave plain.** A grid and a striped sun in a void is the
  cliché the user asked to avoid: every frame has a lived-in place (a city of lit windows,
  palms, traffic, boats, a port) and its light on water and wet ground. Grids, suns and
  wireframes appear only when the story brings them (the trip turns the road into a grid;
  the sun is a real sunrise).
- **Airbrushed, not low-poly.** Every large face is a gradient of what it reflects (the
  violet sky on top, the city's pink at grazing angles, the dark bay below, a warm lamp
  passing); edges facing a light get a thin rim; no large flat fill.
- **Neon is saturated with a white core.** Paint emitters in pink, magenta, cyan, violet,
  red, sodium; white only in the core. A saturated light blooms in its colour; a near-white
  one burns to white (the first tail lights read as a white slab).
- **Lights are reflected, everywhere:** wet asphalt (streaks from the source's foot towards
  the viewer), water (a soft column plus thin horizontal glints on the swell, never dots).
- **The cast is drawn by their sheets, lit by the film:** cut-outs of generated model
  sheets, darkened into the night (`tint`) and rimmed thinly on the picture only (on the
  light layer a rim blooms into a sticker's outline).
- **Hue during the trip swings inside the neon range** (±40°, or cycling the palette per
  beat); a full turn of the wheel passes through green and yellow, which are not neon here.
- Camera: real lenses (f 1000–1250 at 1920), moves that belong to a vehicle or a crane, cuts
  on bar lines.

## Style checklist

- [ ] Something lit in every part of the frame; no empty half (water and ground carry
      reflections).
- [ ] Every emitter on both layers; nothing near-white except cores.
- [ ] Nothing glows through what stands in front of it (far/near bloom, erase behind).
- [ ] Large faces airbrushed; rims on edges facing lights.
- [ ] Hue stays pink–violet–cyan–gold.
- [ ] The music's jumps measured and each one given its picture.
- [ ] Full-resolution crops of the car, the cast, the city, the water.

## Lessons

- 2026-11-24 · run-away-with-me round 2 · «Not a 3D render»: projected 3D sets painted with gradients read as a render however rich. The drawn manner keeps the metres and the camera and changes only the painting: flat inks, an ink line on every opaque thing, light as strokes, drawings on twos. A projected flat thing on the ground (paint, a pool) is a quad in perspective, never a brush of its near width (it balloons); a material keeps one ink (posterizing a lit shade strobes on the beat).
- 2026-11-24 · run-away-with-me round 3 · A deck with a hump hides what lies beyond its crest from a low camera and shows it again from a high one: paint the far piece (beyond the crest) and what stands on it first, then the near piece and its things; something long straddling the crest goes with the near piece.
- 2026-11-24 · run-away-with-me round 3 · Things in the sky (stars, the moon, falling bars, sparkles) are fixed directions projected through the camera, or they slide against each other when the camera moves; a random layout is drawn whole from its seed before any per-drawing test, or one skipped draw re-scatters the rest every drawing.

- 2026-11-24 · run-away-with-me · A light layer bloomed once at the end shows every light
  through everything painted after it (lamp reflections through the car and the deck). Bloom
  the far world, clear the light, paint the near world; and let a near object erase the light
  behind it before adding its own.
- 2026-11-24 · run-away-with-me · Bloom on a software canvas: summing the pyramid at low
  resolution and laying it with one frame-sized draw took the frame from 310 to 210 ms at
  1920; a full-frame `overlay` blend for grain and a frame-sized chromatic split were the
  next most expensive things (replaced by a translucent noise tile and a fringe on the glow).
