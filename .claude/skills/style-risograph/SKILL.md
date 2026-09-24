---
name: style-risograph
description: Risograph style, in testing: scenes printed like a riso print, in four spot inks (fluorescent pink, yellow, blue, navy) on warm paper, flat and halftone plates, overprints that make the other colours, misregistration, uneven inking and grain. Use it for riso, screen print, halftone, retro print, zine or «printed» looks, or when working with styles/risograph/.
---

# Style · Risograph

Status: **in testing**. Studied on `references/opus5-risograph.mp4` (a 1:1 study in
`sandbox/2026-09-24-opus5-riso/`, the lighthouse card first).

## Code

`styles/risograph/riso.js` → global `Riso`.

- `const press = Riso.press(env)` once in `setup`; per frame `press.begin(d)`, draw, then
  `press.print(g, { key: d })` (memoised per drawing: the print is pixel work, ~150 ms).
- **Plates, not colours.** `press.plate(ink, 'solid' | 'screen')` gives a context in logical
  units; draw with `Riso.tone(v)` (only the alpha counts: how much ink). A solid plate prints
  flat ink; a screen plate turns tones into halftone dots (a dot per cell, area = tone),
  each ink at its own screen angle. `Riso.ramp`/`radial` make tone gradients.
- **Whites are knockouts:** `press.knockout(fn)` erases a shape from every plate.
- Helpers: `Riso.line` (a hand-inked polyline), `Riso.ring` (a wobbling circle, drawn on
  with `p` 0..1).
- The press: paper colour with grain, inks multiplied in order yellow → pink → blue → navy,
  per-ink register offsets (`register`), starved blotches and pinholes, a slight spread
  (ink in the paper fibres).

## Style rules

- **Four inks only** (measured on the reference): pink `#e4348c`, yellow `#eee42b`, blue
  `#2680b0`, navy `#1e277b`, paper `#f1ebe2`. Every other colour is an overprint: pink +
  yellow = red/orange, yellow + blue = green, pink + blue = purple, navy + pink + yellow =
  brown. Never add a fifth ink «because it's easier».
- **Think in separations:** for each element decide which inks and whether flat or
  screened. Shadows are a screen ramp of navy (or blue) over the flat colour; skies are
  two screens ramping against each other.
- **Halftone pitch ≈ 9.5 px at 1080** (the reference's), dots soft at the edge, never
  perfectly clean. The misregistration is a few pixels and fixed per print.
- **White is paper:** highlights, arcs, waves are knockouts, not white ink.
- **Motion on twos**, small: beams sweep, dots pop, circles draw on. The print texture is
  fixed; only the drawing changes.

## Style checklist

- [ ] Only the four inks? Every other colour an overprint?
- [ ] Halftone dots visible at full size, at different angles per ink?
- [ ] Register offset visible on edges (a coloured fringe)?
- [ ] Whites knocked out of every plate?
- [ ] Paper grain and uneven ink visible?

## Lessons

- 2026-09-24 · opus5-riso · Clean vector dots read as digital; the ink spread (a 0.9 px blur of the whole print) and starved blotches made them read as ink on paper.
