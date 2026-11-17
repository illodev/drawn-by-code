---
name: style-micrograph
description: Micrograph style, in testing: an image made by an instrument and tinted afterwards — false-colour electron micrographs (virions, cells, membranes, particles in a pool of stain) as one grey signal with sharp grain over soft structures, a focus that hunts, shot noise, and a colourist's few inks laid over regions with a soft brush; three measured palettes (orange on pale blue, olive and rose on lilac, red/yellow/teal on black). Use it for biology, microscopy, virology, cells, «scientific image», false colour, lab or documentary inserts, or when working with styles/micrograph/.
---

# Style · Micrograph

Reference in testing: `sandbox/2026-11-17-micrograph-test/` (review/sheet.jpg). The second
of the two «scientific» styles; the other is **lightfield**. They obey opposite physics:
there things are light that overflows, here things are density that is tinted.

## Code

`styles/micrograph/micrograph.js` (global `Micrograph`), WebGL2 in the headless browser.

```js
const M = Micrograph.make(env);
M.scene('field', GLSL);          // defines: void specimen(vec2 p, out float s, out vec3 ink)
M.render(g, 'field', { t, frame, a: [floats…], stage: [x, y], detector: {…}, plate, plateKey });
Micrograph.databar(g, env, { x, len, label: '100 nm', font: 'VT323', colour, shadow, alpha });
```

A scene describes a **specimen**, not a picture. For every point `p` (frame units, y up,
the frame 1 high):

- `s`: the **signal** the detector gets, as the display will show it (0 black … 1 white).
  All the luminance of the image is here.
- `ink`: the colour the colourist laid over that region (sRGB), **pure at its own
  luminance**: where `s` equals the ink's luminance the ink shows as it is, less signal
  darkens it to black, more lifts it to `detector.light`. Declare the shot's inks as
  constants (five or six, never more) and `mix` between them with soft masks.
- `grit` (a global, optional): the specimen's **own grain** at that point, as a share of
  the signal (± 0.3 is a lot). Structures are soft and their grain is not: grit is
  multiplied in after the softening.

Helpers in the shader: `grainy(q, cell, seed, sharp)` (band-limited speckle fixed to the
specimen: give it the particle's local coordinates so it rides with it), `body(q, r, seed,
amp, t)` (distance to an oval whose outline is never a circle, and breathes), `wobble`,
`datum(x, y)` (the scene's table of measured numbers),
`smin`, `shell(d, w)`, `inside(d, w)`, `crown(d, a, n, len, seed, t, head)` (a fringe of
teeth), `lumps(n, a, count, seed, t, dist, size)` (spikes as lumps: use this, not clubs), `fbm`, `noise`, `hash*`, `lum`, `plate(p)`, `uA[256]`.

`detector` (see `DEFAULTS`): `soft` (how soft the structures are, octaves of blur),
`defocus` (the instrument out of focus: blurs structure **and** grit), `fringe` (overshoot
at every edge; make it grow with defocus), `noise { amount, power, floor, size, live,
hold, sharp, fine }` (`power` 0.5 = shot noise, 1 = a share of the signal, 0.1 = nearly
even; `live` = the share that is new every exposure, the rest rides `stage`; `hold` =
frames per exposure), `gain`/`offset`/`gamma`, `bleed` (how much softer the ink's edges
are than the signal's), `colour` (0 = raw grey), `light`/`dark` (the ends of the ramp),
`beam`.

Text is one of two things. **Specimen**: painted on the plate and read in the shader
(`plate(p)` → signal, ink and grit like any other matter), so it is stained, soft and
grainy. **Databar**: the scale bar and its label, drawn crisp on `g` after `render()`.

## Style rules

- **One grey signal.** Turn the inks off (`colour: 0`): the frame must still be a
  complete, correct micrograph. Colour never carries a shape, an edge or a texture.
- **Few inks, soft brush.** A palette is the field's ink plus three to five more; ink
  masks are wider and softer than what they tint (`bleed` ≥ 1.8), and may spill.
- **Structures are soft, grain is sharp.** Edges come from `soft` (1–1.5 octaves), never
  from a hard `step`; texture comes from `grit` and the detector, at 4–6 px.
- **Grain is measured, per palette** (period ≈ 9–13 px at 1920): on black it follows the
  root of the signal and black stays clean (`power` 0.5, floor ≈ 0); on a bright field it
  is nearly even (`power` 0.1–0.3). What a thing is made of (`grit`) rides with it.
- **Nothing is a circle, nothing is centred, nothing is evenly spaced**: outlines wobble,
  cores sit to one side, shells are thicker on one side, the pool of stain is lopsided,
  spikes differ in length and lean and some are missing.
- **Motion is the instrument's**: the stage creeps, focus is found (far out, through,
  back) and then breathes, the beam comes on and dips, magnification changes in steps.
  The specimen itself hardly moves: a slow drift, a turn of a few degrees, outlines that
  breathe, a bud that pulls away.
- **A cut is a change of magnification**: the outgoing image rushes in (or out) and loses
  focus while the gain dips; the incoming one arrives soft and is pulled into focus.
- **The colourist's wash** is the style's own reveal: a shot may start as the raw grey
  image and be tinted by a ragged front (`ink = mix(vec3(lum(ink)), ink, front)`; keep
  `light` white until it arrives, and check the front is 0 everywhere at wash 0).
- **Forbidden:** outlines, flat fills, clean geometry (a ruled ring, dots on a grid, a
  spike drawn as a stick with a ball), pure white speckles on colour (give `light` the
  palette's tone), grain that slides over a moving particle, a glow.

### Palettes (measured on the three stills)

| | Field | Inks |
|---|---|---|
| **Section** (thin section, bright field) | sky `(0.735, 0.815, 0.985)`, s ≈ 0.80 | orange `(0.80, 0.49, 0.29)`, umber `(0.34, 0.25, 0.19)`, rose `(0.58, 0.36, 0.40)`, blush `(0.84, 0.75, 0.74)`, violet `(0.60, 0.61, 0.83)`, mauve `(0.72, 0.47, 0.44)`; `light` cream `[1, 0.87, 0.68]` |
| **Stain** (negative stain) | lilac `(0.86, 0.78, 0.89)` falling to purple `(0.43, 0.29, 0.40)` and wine `(0.42, 0.22, 0.25)` at the particle | yolk `(0.73, 0.58, 0.26)`, pink `(0.66, 0.48, 0.42)`, rust `(0.58, 0.37, 0.34)` |
| **Dark** | black; haze green `(0.08, 0.34, 0.20)` | teal `(0.09, 0.60, 0.56)`, red `(0.70, 0.20, 0.21)`, yellow `(0.95, 0.72, 0.28)`, blue-grey `(0.27, 0.45, 0.48)`, mauve `(0.62, 0.40, 0.39)`, olive `(0.62, 0.66, 0.20)`; `light` `[1, 0.94, 0.84]` |

## Working from a still (the detail gate)

As in lightfield: the still becomes a clip (`ffmpeg -loop 1 -i still.png -t 18 -r 24 …`),
the shot has a `MATCH` instant **on a frame**, and `engine/detail.mjs … --times <film
second> --grid 12` must PASS. What made each kind of image pass:

- **A soft, radial thing** (a particle in stain): an ellipse fit of its core, then the
  mean colour at every distance from the centre as a table (`PROF`, signal = its
  luminance, ink = the colour itself), then how it departs from round by quadrant (the
  lopsided pool), fitted with its decay.
- **Soft things on black** (virions by a cell): ellipse fits, a radial profile per
  particle in a few parameters (core, shell, rim, fringe), the big shape as a union of
  discs fitted to a mask.
- **Hard-edged things on a light field** (a section through membranes) need the most:
  each body's outline as 32 radii (rays from its centre to the far edge of its membrane,
  median-filtered), and the tone in and round it as a table of rings × sectors. Ellipses
  and modelled fringes plateaued at twice the gate's limit.
- Tools worth rewriting each time: a signed difference map after the gate's blur (red =
  ours lighter, blue = darker: rings round every body mean the edge profile is wrong, not
  the positions), a cross-match per body (is it displaced?), and the gate's `tiles.json`
  printed as 12 × 12 maps of colour and texture.

## Pitfalls (each cost a round)

- **Spikes drawn as shapes read as a diagram** (a trumpet on a stick, a pawn). They are
  lumps: gaussian knobs, two per spike, each with its own size and distance, some
  missing, on a faint neck, and distorted by a low-frequency noise.
- **Dots at one scale read as a pattern** («leopard»). Granules are clumps: a coarse field
  places them, a finer one frays them, and they gather near the membrane.
- **Random mottling at the scale the gate compares (20–40 px) is error**: keep random
  texture finer than that, and take anything coarser from the measurement.
- **Combing too long is a citrus slice**: radial grain in a shell is 1.5× longer than
  wide, not 3×.
- **Grain that is all detector is sand; grain that is all specimen and blurred is mush.**
  Split it: `grit` for what the thing is made of, the detector for the rest.
- **Measured means include the grain**: an ink chosen as the mean colour of a grainy area
  comes out too pale; highlights go to `light`, so tint `light`.
- **`rot(a)` in the kits turns by −a**: local coordinates are `rot(tilt) * (q − c)`.
- **A reference clip must last as long as the film** when the gate runs at film seconds:
  loop the still for the whole duration (the gate refuses an instant past its end).
- **A software renderer runs every branch**: an early `return` or `continue` saves nothing,
  so a loop that shades eighteen particles pays for eighteen sets of grain fields at every
  pixel (8 s a frame at 960). Particles do not overlap: find the nearest one in a cheap
  loop (distance only), then shade and grain that one, once (1.8 s). Measured tables go in
  as data (`M.scene(name, glsl, { data, width })`, read with `datum(x, y)`).
- **`gl_` begins reserved names in GLSL**: a variable called `gl_` anything does not compile.

## Style checklist

- [ ] With `colour: 0`, is it a complete grey micrograph? Does any shape exist only in ink?
- [ ] Is anything outlined, flat, ruled, evenly spaced or perfectly round?
- [ ] Do the inks' edges sit softer than the signal's, and are there at most six inks?
- [ ] Is black clean where there is no signal, and does a bright field carry even grain?
- [ ] Does each thing's grain ride with it when it moves? Does the support's ride the stage?
- [ ] Do highlights burn to the palette's `light`, never to white specks?
- [ ] Does the shot open the way an operator finds an image (soft, pulled in, settling)?
- [ ] Is every cut a change of magnification, with the beam dipping?
- [ ] Is the databar crisp, small, in a corner the specimen leaves free, with a plausible
      length for its label?
- [ ] With a reference: detail gate PASS at 12 × 12; then every body cropped at full size
      against it (the gate passes long before a particle looks right).

## Lessons

- 2026-11-17 · micrograph-test · The model that made three different stills come out of
  one kit was the real one: a grey signal, an instrument, and colour laid on afterwards.
  The measurements said so before any pixel was drawn (grain only in luminance, its
  chroma following the tint multiplicatively below the ink's own luminance and towards
  white above it). Measure how a reference's noise relates to its colour before designing
  a look's pipeline.
- 2026-11-17 · micrograph-test · When a shot plateaus above the gate after its positions
  are right, stop tuning parameters and look at the signed difference: it showed rings
  (edge profile), not blobs (tone), and measuring the tone round each body per sector
  took the shot from 13 to 8 in two steps where six rounds of tuning had moved it by 3.
