---
name: style-woodcut
description: Woodcut style, in testing: a relief print cut in a plank — one black key block where every white is a gouge cut (runs of lens-shaped cuts down each slope, long horizontal cuts in the sky, rubble stone carved as blocks), printed with an uneven film of ink on warm paper, and a second block in one ochre that prints only what a light touches, a little out of register. Light is carved, never painted. Use it for woodcut, linocut, relief print, «xilografía», «grabado en madera», serious and solid narrative pieces (history, labour, villages, mountains, night, electricity, manifesto), or when working with styles/woodcut/.
---

# Style · Woodcut

In testing. Style test: `sandbox/2026-11-17-light-valley/` (review/sheet.jpg), the night the
electric light reaches a mountain village, matched to a generated still (`ref/street-lit.png`).

## Code

`styles/woodcut/woodcut.js` → global `Woodcut`. Author scenes in reference pixels: `logical:
[1280, 720]`, so every measured number (cut widths, lengths) goes straight in.

```js
const blk = Woodcut.block(env);              // in setup
blk.begin();                                 // every drawing
blk.base('set', (b) => { … });               // the static block, cut once and cached
blk.ink((g) => …) / blk.cut((g) => …);       // add printing surface / carve it away (logical units)
blk.hatch({ box, clip, dir, tone, sp, len, gap, run, wMin, wMax, fit, seed, ink });
blk.ochre((g) => …);                         // the second block: paint where the light prints
blk.print(g, { key: d, seed: d });           // the press, memoised per drawing
```

- **One mark for everything:** `Woodcut.gouge(g, ax, ay, bx, by, w, rng, { asym, rag, bend })`
  is a lens that goes in at a point and lifts out blunter. Drawn in `cut` it is a white cut;
  in `ink` it is a black dash left standing. `groove` is a long cut of even width along a
  polyline (wires, edges, ridges, outlines of a hood).
- **`hatch`** lays gouges over a region: `dir` an angle or `(x, y) → angle` (the cut runs
  down the fall line of a slope, along a course of stones, out from a bulb), `tone` the share
  of the area carved (0 black … 1 white, a number or a function), `sp` the distance between
  rows (thinner cuts at the same tone: lower `sp`), `run: [1, 3]` repeats a stroke side by side
  as a carver does, `clump` breaks the tone into patches. **`fit: cell`** proposes marks
  generously and keeps each only if it brings the cells it crosses closer to the tone: use
  it whenever the tone varies (a gradient, a measured map); without it the tone is only right
  on average. `ink: true` lays black marks instead (to ink a carved area back to a tone: the
  rays inside a cone of light, the shadows of a hall).
- **`masonry(g, quad, { courses, stone, tone })`** carves rubble stone as blocks: a lit top
  sliver, a nicked end, the whole face inside dark joints where the tone is high, courses of
  uneven height. Draw it in `cut`, clipped to the wall.
- **`rays`**, **`noise2(seed, x, y)`** (smooth value noise in logical units), **`clamp`**.
- **The press:** paper (a warm laid sheet, a cloud, laid and chain lines, fibres), the ochre
  block first (its own mottle, chipped edges, 2 px off register, ±0.6 per print), then the key
  block: chipped walls, a film of ink that is full where the roller pressed and starved in
  patches, a faint grain, specks of paper in the black. `seed` changes the inking per print:
  a printed animation moves its ink, never its cuts.

## Style rules

- **Light is carved.** A light that comes on is the gouge going into the block: the bulb is
  carved to paper first, then its cone is cut down from the hood over two or three drawings;
  a window's panes are cut, its mullions left. Never a glow, a gradient or a blur.
- **One second colour, with a meaning.** The ochre block prints only what the story's light
  touches (here: electric light). Before it, black on paper. The bulb itself stays paper: the
  ochre rings it.
- **Every white is a cut, and cuts follow form:** down the fall line of a slope, horizontal in
  sky and water, along the courses of a wall, out from a light. Coarse cuts (woodcut on the
  plank), never the fine hatching of a burin (that is **engraving**).
- **Measured palette:** ink (19, 20, 20) as printed (film 11, 12, 12), carved paper (216,
  191, 159) over a sheet of (226, 202, 170), ochre printed (214, 162, 79). A solid black prints
  12–28; specks of paper 12–20 per 10 000 px.
- **Cuts** (at 1280): 1.5–2.4 px wide, p90 3–7; 12–20 px long, p90 30–100 (the sky longer);
  17–22 % of a dark area carved. More carved means more cuts of the same width, not fatter
  lenses (`sp` down).
- **A pool of light is not a shape:** the ochre prints under the ground and the ground is
  carved more there. An oval of flat ochre reads as a sticker.
- **Stones are blocks, not lenses:** a lens per stone reads as eyes, a regular sliver as
  brick.
- **Motion:** drawings on twos; each drawing is a fresh print of the block. The camera moves
  little (a pan across the plank); never scale the block (the cuts would scale).

## Style checklist

- [ ] Every white a cut, every cut following its form (crop at 3× and look)?
- [ ] Runs and clusters of cuts, stretches of solid black, never an even spread of marks?
- [ ] Cut widths and lengths within the measured ranges?
- [ ] The ochre only where the light is, the bulb paper, its edges a little off register?
- [ ] Lights carved in over drawings, not faded in?
- [ ] The black alive (starved patches, a faint grain, specks), not a flat fill?
- [ ] Stones as blocks with chipped edges, pools as carved ground?
- [ ] No fine engraved hatching, no glow, no second colour?

## Detail gate on a matched still

A woodcut's cuts are clustered at the scale the detail gate blurs colour at (29 px at 1280),
so its colour median measures where the clusters fall, not the craft: the street still
against itself shifted 8 px scores 7.5, shifted 12 px 10.3; two seeds of the same scene 5.0.
Carving to a measured tone (16 px cells, soft share, calibrated) took the street to 9.4 with
the other three checks passing. Measure the floor first (`tools/colourfloor.py` in the style
test) and say which number a shot can reach without tracing.

## Lessons

- 2026-11-17 · light-valley · Measure tone softly: the share of a cell carved as luminance
  between ink and paper (or ochre), not as pixels over a threshold; the still's greys (soft
  edges, starved ink) are part of what the eye and the gate see. Then calibrate it in a loop
  (render, compare per cell, fold the difference back), because a print's own greys and the
  marks drawn outside the fit carve too.
- 2026-11-17 · light-valley · A print that is nearly binary (black or paper, nothing between)
  reads as a vector drawing next to a real print: the film of ink must be uneven, starved in
  patches, its edges soft by a fraction of a pixel.
