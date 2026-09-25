---
name: style-risograph
description: Risograph style: scenes printed like a riso print, in four spot inks (fluorescent pink, yellow, blue, navy) on warm paper, flat and halftone plates, overprints that make the other colours, misregistration, uneven inking and grain. Use it for riso, screen print, halftone, retro print, zine or «printed» looks, or when working with styles/risograph/.
---

# Style · Risograph

Approved (the user signed off the study at round 3). Studied on `references/opus5-risograph.mp4`: a 1:1 study of the whole
28 s film in `sandbox/2026-09-24-opus5-riso/` (43 cards, circles, mosaic, orbits, title).

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

## Separations: what the study taught (six card agents, 42 cards)

- **Inks only darken (multiply).** Anything light over something dark (yellow rays on a
  blue sky, a pink line on navy, lava in a dark cone) needs the dark plates knocked out
  under it first; adding more light ink does nothing.
- **Dots on a dark ground:** pure pink dots on navy = clear the navy under each dot; a pink
  screen over navy prints maroon.
- **Riso black is navy + yellow** (olive-black); add blue for black-green; pink turns it
  brown, keep it out unless the reference is brown.
- **Nearer layers knock out what is behind them** before their tones (ranges, dunes,
  flowers over leaves), or the screens pile up into mud.
- **Coarse dots** (out-of-focus ghosts, big petal dots) are hand-set dots through a mask,
  not a denser tone; features coarser than the screen can't come from the screen.
- **Knockout lines ≥ 3 px**, wider than the misregistration, or they break into dashes.
- **Randomness inside `press.knockout`**: create the rng inside the callback (it runs per
  plate), or every plate gets different shapes.
- **Measure colours on areas** (a 30 px mean, and a 2× crop to see which inks make it:
  flat ground with clean dots, or dots over dots); a 5 px probe lands on a dot or a gap.
- **Author in reference pixels** behind one scale (1000/1080 on every plate): every number
  read off a 2× grid crop goes straight in. Fit ellipses/rings from colour-run scans.
- **Re-inked repeats are a plate swap** (`print({ inks })`), mirrored ones a transform on
  every plate (`press.each(g => g.transform(-1, 0, 0, 1, W, 0))`).
- **Cuts land on frames, motion on twos:** the film cuts every 1/8 s (3 frames), which is
  not on twos; pick the shot from the 24 fps frame and hold drawings from the cut.

## Style checklist

- [ ] Only the four inks? Every other colour an overprint?
- [ ] Halftone dots visible at full size, at different angles per ink?
- [ ] Register offset visible on edges (a coloured fringe)?
- [ ] Whites knocked out of every plate?
- [ ] Paper grain and uneven ink visible?
- [ ] The paper at 3×: fibres and a faint cloud, no confetti of coloured specks?
- [ ] Dark overprints mottled, with no paper-white pinholes punched through every ink?
- [ ] Line work painted (brush width swelling and thinning, tapered ends), not stroked?

## Lessons

- 2026-09-24 · opus5-riso · Clean vector dots read as digital; the ink spread (a 0.9 px blur of the whole print) and starved blotches made them read as ink on paper.
- 2026-09-24 · opus5-riso · «Their image has a noise filter ours lacks»: measured at 3×, the
  riso's paper is an even stock with hair-like fibres and a faint cloud, and nearly no
  specks; ours threw a confetti of coloured dots on the paper, and shared ink voids punched
  white pinholes through dark overprints (too busy). The press now draws fibres, keeps
  voids per ink, and softens dot edges (1.4 px) and spread (1 px) to match the texture
  energy tile by tile (`engine/detail.mjs`).
- 2026-09-24 · opus5-riso · The sonar's rings and «waves» are brush work, measured frame by
  frame: rings as annuli whose width swells round the circle, waves as trios of tapered
  arcs (≈ 170 units long: long and thin far out, fat crescents near the dot) converging on
  it. Stroked circles and straight dashes read as vector.
- 2026-09-25 · opus5-riso · Every card of a riso film has its own screens (pitch 7.6–14.4 px, its own angles and phase, regular to 0.1 px): measure them with a DFT and hand-set the dots; the press's single 9.5 px screen costs ≈ 10 on the gate. Dark masses and silhouettes print as flat ink with specks, not as a screen.
- 2026-09-25 · opus5-riso · Inks are measured on flat solids, divided by the paper, and solids print ≈ 97 %: the mottle must be centred on 1 or every solid prints light and a card can't compensate.
- 2026-09-25 · physics-newton-faraday · Everything measured on the 1080 × 1080 print (screen pitch, grain, fibres, register) scales with the frame's short side, not its width: at 1920 × 1080 the width made every dot 1.8× too big.
- 2026-09-25 · physics-newton-faraday · Begin a path for every shape you ink or knock out: a bare `rect` joins whatever path the plate still holds, and one knockout erased the whole background.
- 2026-09-25 · physics-newton-faraday · To fade a shape out, print it as screens only and without its knockout (the dots thin out over what is behind); a faded shape that still knocks out leaves a pale ghost of paper.
- 2026-09-25 · physics-newton-faraday · On a night ground, faces and linen are paper with a light warm screen; shade them with shapes (the shadow side, the nose's shade, a cheek) and draw features as navy brush lines. A full-tone pink and yellow skin reads as a sunburnt blob. Dark cloth over dark cloth needs a darker rim and a sheen (fewer navy dots).
- 2026-09-25 · physics-history v2 · At 1920 the screen's dots are ≈ 10 px: any detail thinner than ~3 px (a knuckle crease, wood grain, a plank seam) vanishes into them and the shape reads as a mitten or a flat slab. Detail that must read is solid ink (`navy`, `pink`, not `.s` screens) or a knockout to the paper, at 2.4 px or more; judge it on the crop at full size, not on the vector.
- 2026-09-25 · physics-history v2 · A flash on a riso press is the paper's own tone (a knockout), not white: keep it to a few drawings and cut straight to the next dark image, or the frame reads as a grey card.
