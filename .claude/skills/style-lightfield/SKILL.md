---
name: style-lightfield
description: Lightfield style, in testing: light photographed, not drawn — scenes are radiance (a sun over the Earth's limb, a filament in a dusty bulb, anything that glows in the dark) shot through a simulated camera (HDR, lens bloom with film halation, diffraction rays, a film curve that burns to white, grain) with titles emitted as light. Use it for science, space, physics, «cinematic», documentary title cards, glowing things on black or on a dark wall, lens flares, or when working with styles/lightfield/.
---

# Style · Lightfield

Status: **in testing** (style test: `sandbox/2026-11-16-lightfield-test/`, two shots built on
the user's two reference stills; waiting for the user's verdict). It is the first of two
«scientific» styles the user asked for; the other, false-colour micrographs, is not built.

Nothing here is drawn. A scene says how much light leaves each point, and the kit is the
camera that photographs it. What reads as «scientific footage» is that everything on screen
went through the same lens and the same film.

## Code

`styles/lightfield/lightfield.js` → `const L = Lightfield.make(env)` (one WebGL2 context),
`L.scene(name, glsl)` per shot, `L.render(g, name, { t, frame, a, optics, plate, plateKey })`.

The scene GLSL defines `vec3 radiance(vec2 p)`: linear, unbounded light at `p` (frame
units: y up, the frame is 1 high). It gets `uT`, `uFrame`, `uAspect`, `uPx` (a pixel, for
antialiased edges), `uA[64]` (animation: `#define HEAT uA[0]`) and the prelude:

- `emit(srgb)` → the radiance that the film turns into exactly that colour. **Every colour
  read off a reference goes through it** (it inverts the toe and the curve).
- `blackbody(kelvin)` → the colour of something hot. `lin(srgb)` → linear.
- `hash / hash2 / hash3` (integer lattice: same on every GPU), `noise`, `fbm`, `rot`, `sat`.
- `disc(d, r, blur)` an out-of-focus point; `motes(p, cell, t, seed, rMin, rMax, blur)` dust
  in the air, one drifting mote per cell (layer two or three cell sizes).
- `plate(p)` → the 2D canvas the scene's JS painted with `plate: (g2) => …` (logical units).
  Titles are added as light: `c += lin(t.rgb) * t.a * 7.0 * TITLE`.

`optics` (per frame, so a shot can animate them): `exposure`, `toe` (black crush),
`bloom` (share of the light the lens scatters), `bloomWeights[7]` (octaves from 2 px to
1/8 of the frame), `halation [r,g,b]` + `halationFrom` (the tint of the wide octaves),
`streaks { gain, threshold, length, falloff, rays, level, seed, rot, irregular, tint }`
(iris rays), `ca`, `vignette`, `soften`, `grain { amount, size, chroma, floor }`,
`saturation`, `lift`.

A film with several shots: one file per shot giving `{ glsl, frame(t) → { a, optics },
plate? }`, and a `scene.js` that only cuts (see the style test). A shot that copies a still
does its geometry **in that still's pixels** (`P = vec2(pf.x * H + W/2, H/2 − pf.y * H)`),
so every number in the shader is one you can read off the image.

## Style rules

- **Radiance, in real proportions.** Lit surfaces 0–2, a title 7, a filament 500, a sun
  1500 and up. The size of a glow is never drawn: it is what the lens does with a small,
  very bright thing. If a halo is too big, the source is too bright or the wide octaves too
  heavy, not «the gradient too wide».
- **Heat is a temperature.** `blackbody(k)` rising with the animation (1000 K a dull red
  ember, 2750 K a filament, 5700 K the sun high up, 1800 K the sun through the horizon's
  air). A warm light is never a picked orange.
- **A light shows on what it lights:** the air, dust, glass, a wire, a brass rim. Measure
  the falloff on the reference in several directions before writing it: the bulb's glow was
  not radial (1.7 at 55 px above the filament, 0.9 at 28 px off its end).
- **Glass is what it reflects.** A dark band at the silhouette (the unlit room), one blown
  highlight per light with a feathered inner edge and a gap to the rim, pale strips where
  walls turn, and for lumpy glass (a stem's press) a height field whose normal picks up the
  filament (gold) and the key (white). No outline, ever.
- **Dust is the texture of this style:** sand on glass (a grain a pixel across in clumps,
  one in seventy sparkling, only where light reaches), motes and short flecks in a beam
  (most faint points, a few streaks), specks near anything burning. Regular dots read as a
  halftone: sizes and brightness vary by powers (`pow(k, 4.0)`), never linearly.
- **Out of focus = soft blobs, no detail.** A screw thread out of focus is two columns of
  slanted soft dashes of uneven brightness, not a ladder of ridges.
- **Black is black.** Space and unlit things sit under the `toe`; grain is proportional to
  the signal (`floor` 0 for film on black, ≈ 0.3 for a studio wall).
- **Stock per shot, matched to its reference with the detail gate:** old film from orbit =
  `soften` 0.6, grain 0.075 at size 2.6, deep-red halation `[1, 0.12, 0.01]` from octave
  5, 15 irregular rays; a clean studio macro = `soften` 0.12, grain 0.032 at size 1.7,
  `bloom` 0.17 with the wide octaves near zero, `ca` 0.0005.
- **Motion is continuous, 24 frames a second** (this is footage, not animation on twos).
  A light never switches on: ember → climb → a small overshoot → settle, then a tremble
  (`1 + 0.012·sin(37t)`). Things in orbit move at constant rates. The camera drifts or
  pushes in by 1 % a second, the far layers less (parallax), dust never stops.
- **Typography is light.** A bold geometric sans in white (Poppins Bold) with a serif for
  the warm word or the small line (Lora), emitted through the plate so the lens blooms it
  and the film grains it; it arrives after its light source is on, and a glint may cross it.
- **Density without clutter:** a far layer (stars, a mottled wall), a secondary layer with
  its own slow motion (city lights carried round the planet, dust in the beam), and the
  light itself.
- Forbidden: outlines, flat fills, vector-clean edges, a glow or a flare painted as a
  gradient, text or anything else drawn in 2D after `L.render`, a perfect geometric
  primitive left visible (a filament as a rounded rectangle: it needs an uneven thickness,
  flares at its clamps), someone else's logo.

## Pitfalls (each cost a round)

- **A highlight × 7 is a sticker.** With the film curve anything above ≈ 2 is white, so a
  mask multiplied by a big number is white wherever it is over 0.3: its feathering
  disappears and the highlight grows. Give feathered things 2–3 and let only the core burn.
- **Detail finer than two pixels aliases into a wave** (a coil drawn as a 2.4 px sine
  became a tilde). Draw the band and modulate it at a period the output can resolve.
- **Chromatic aberration splits every white speck into a red and a blue one.** With dust
  on screen keep `ca` ≤ 0.0005.
- **The bloom's wide octaves are a veil**, and with halation a warm one: a gold title made
  a blue wall purple. For a studio shot `bloomWeights` fall to ≈ 0.05 by the last octave
  and `halationFrom` is 5.
- **A blurred edge on the reference is not always the silhouette.** The bulb's upper-left
  outline seemed 13 px inside the circle; it was the dark rim of the glass. Changing the
  geometry gave an onion dome: check a shape reading against the whole outline first.
- **A grid shows.** One mote, one fleck, one glint per cell is fine only if most cells are
  empty or faint; test at full size.
- **The first bloom bug:** a downsample pass that samples with `gl_FragCoord * texel` of
  the wrong level blurs a corner of the image; pass each target's own size.
- **Cost on this container (SwiftShader):** the limb is cheap, the bulb ≈ 0.7 s a frame
  at 960 and ≈ 3 s at 1920. Use `--size 960` stills while tuning and one full render.

## Working from a still (the detail gate)

A still becomes a reference clip: pad or crop it to the scene's aspect, then
`ffmpeg -loop 1 -i still.png -t 6 -r 24 -vf scale=1920:1080 private/ref.mp4`. Decide the
instant of the shot that reproduces it (`MATCH`) and animate around it. Then
`node engine/detail.mjs scene.js private/ref.mp4 --times <match> --grid 12` until it says
PASS with no flagged tile; `--mask x,y,w,h` only over what must not be copied (a logo).
Tune with numbers: sample the same named points on both images, fit profiles
(`limb.js`: the band's colour every 4 px, its thickness and brightness along the arc).

## Style checklist

- [ ] Does every glow come out of the lens (turn `bloom` and `streaks` to 0: is the frame
      flat and sharp, with no painted halo left)?
- [ ] Is black black where nothing is lit, and is the grain absent there?
- [ ] Is anything outlined, flat, or perfectly regular (dots on a grid, a clean crescent)?
- [ ] Does each light warm up (colour by temperature) and light something around it?
- [ ] Do highlights keep a feathered edge at full size (crop them)?
- [ ] Does the title go through the plate, and does it come on after its light?
- [ ] Three layers moving at different rates? Nothing frozen?
- [ ] With a reference: detail gate PASS and no flagged tile at 12 × 12?

## Lessons

- 2026-11-16 · lightfield-test · Measure the reference in radiance, not in display values:
  invert the film curve first (`emit`), then fit falloffs and profiles there; fits made in
  sRGB values break as soon as exposure or toe change.
- 2026-11-16 · lightfield-test · A frame that copies a still passes the gate long before it
  looks right: crop every part against the reference at full size (dome, filament, stem,
  cap) and fix what reads as drawn (a rectangular press, dashes for streaks, round discs
  for bokeh) even when the tile numbers are already inside the limits.
