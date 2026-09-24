---
name: style-clay
description: Clay (plasticine) style, in testing: soft 3D pieces lit from the top left with fingerprints, tool marks, a waxy sheen and soft shadows, stop motion on twos with a surface that boils. Use it when asked for claymation, plasticine, stop motion, soft 3D, a warm «handmade 3D» look or when working with styles/clay/.
---

# Style · Clay

Status: **in testing** (style test: `sandbox/2026-09-24-fube-clay/`, the saas-promo invoice
block redone in clay; review/sheet.jpg, render/fube-clay.mp4).

## Code

`styles/clay/clay.js` → global `Clay`. Every piece is a flat silhouette turned into clay
once and cached per resolution (base colour → speckle, tool marks, fingerprints → volume
gradient → bevel from the blurred inverse silhouette → sheen → trimmed), plus the soft
shadow it casts.

- `Clay.draw(g, key, shape, color, o)`: shape = points (closed outline) or `{ box, fn(ctx) }`
  (text, several blobs, `evenodd` holes). `o`: `bevel`, `soft`, `shine`, `prints`, `marks`,
  `speckle`, `volume`, `light`, `shadow` (0–1 or false), `shadowBlur`, `shadowOffset`,
  `variant` (a boil drawing). The key names the piece: same key, same cached look.
- Outlines: `lumpy(pts, seed, amt)` (Catmull-Rom with hand-made lumps), `ellipse`,
  `roundRect`, `capsule(line, r | [r0, r1])` (a sausage: arms, fingers, pens, ticks),
  `bean(cx, cy, w, h, seed)`.
- `Clay.shadow(g, x, y, rx, ry, a)`: a soft contact shadow on the set.
- `Clay.text(g, key, str, x, y, size, color, o)`: clay letters; pop titles letter by letter
  (see `title()` in the style test).
- `Clay.boil(t, n)`: the boil variant on twos; pass it as `variant` AND in the lump seed of
  characters (not of the set: a boiling wall is noise).
- Worked cast in `sandbox/2026-09-24-fube-clay/cast.js`: Laura (big white eyes, glasses as
  evenodd rings, a hair helmet with carved strands, blush as a soft gradient), chunky hands
  (`rest`, `pointBack`, with `side`), laptop, invoice slab with the print on it, fold
  drawings, stamp, mailbox, plant, set.

## Style rules

- **Palette:** saturated but soft, like modelling clay: sage wall `#bcd7c9`, tan desk
  `#d9a36c`, skin `#ecb993`, navy `#2d4a8f`, coral `#d2563f`, green `#2f8a5b`, mustard
  `#e3b04b`, cream `#f6efe0`. Brand colours go straight in.
- **Light:** one warm key from the top left for everything (the bevel, the sheen, shadows
  down-right). A warm vignette in `post` (the table-top set under a lamp).
- **Every piece has volume, texture and a shadow.** Fingerprints and tool marks are what say
  «plasticine»; without them it reads as a plastic 3D render.
- **Printed things stay printed:** a screen UI is flat and lit (it is a screen), text on
  paper is ink on a clay slab (`Motion.sprite` of the print over the piece). Titles are
  clay letters.
- **Characters:** Aardman-like: big white eyes with pupils that look, lids for blinks, a
  mouth as a pressed sausage (smile) or a dark opening (o, grin with teeth). Chunky hands
  with four fingers and nails; the rules of hands in `style-paper-cutout` → «Detail» hold
  (side, view, never through things).
- **Motion:** on twos; squash on contacts; titles pop letter by letter (0.4 → 1.18 → 0.96 →
  1); props can move by themselves (a stamp coming down alone), it is stop motion.
- **Set:** full, in three depths (wall with window, shelf, clock; desk with objects; a
  foreground plant). The same detail bar as paper-cutout.
- **Forbidden:** flat vector shapes without bevel; a sausage bent in one piece (split it:
  upper arm, forearm); an outline stroke.

## Style checklist

- [ ] Every piece: bevel, fingerprints or marks, a cast shadow?
- [ ] Small pieces not washed out (the bevel is capped at 14 % of the piece; keep `bevel` modest)?
- [ ] Hands: fingers visible with nails, the right side and view?
- [ ] Titles legible (clay letters with a small bevel and shadow)?
- [ ] The characters boil, the set does not?
- [ ] Warm frame < 150 ms at 1920 (everything cached)?

## Lessons

- 2026-09-24 · fube-clay · The first `capsule` swept its caps inwards: every sausage came out bow-tied (arms with «wings», fingers like toes). Check new outline helpers on a test frame at full size.
- 2026-09-24 · fube-clay · A bevel as big as a small piece washes it out (pale hands): the kit caps it at 14 % of the piece's smaller side.
- 2026-09-24 · fube-clay · Catmull-Rom rounds the corners of a folded sheet into a leaf: subdivide straight edges before `lumpy` when a shape has corners that matter.
- 2026-09-24 · fube-clay · A laptop lid with a big bevel reads as a cushion: thin rigid things get a small bevel and a sharp sheen.
