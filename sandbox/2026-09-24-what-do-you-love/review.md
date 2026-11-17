# Reviews · what-do-you-love

Each round: what was seen (auto, compare and by eye), what changed and what lesson comes out.

## Round 1 (auto · compare against the reference)

- Built from a 0.25 s shot analysis of the reference, a measured palette and the closest free
  handwriting font (Short Stack). `engine/reference.mjs` gained `sheets`, `compare` and
  `colors` for this.
- Compare passes: 29.1 → 27.5 → 20.5 → 22.6 (whole video, every 0.5 s). Fixed on the way:
  the window interior camera (empty window), crescent moon, girl and notepad scale, note
  text overflowing (now auto-fits), note back side not faded (write()/markerStroke() set
  their own alpha), montage flowers too small and not sitting on their objects, legs under
  the note, the note unfolding at 7.5.
- `review.mjs`: no warnings; the montage cards are declared as separate shots so card cuts
  aren't reported as jumps.

## Round 2 (user)

> «Have you seen that the video goes into detail? Hands, shapes, perspectives: the work
> shows (mind you, it was made with Claude too), but in this repo detail is going to be
> extremely important.»

- Diagnosis with full-resolution crops (`compare --crop`): structure, timing and palette
  match, but the craft is animatic-level. Body parts are merged, hands are circles, no knit /
  newsprint / wood-grain textures, no creases, no perspective on moving paper, a rectangle
  face, twelve identical sticks for the flower.

## Round 3 (user · detail, piece by piece)

> «Things like the dog show how little effort went into the shape · the girl is chubby and
> shows little craft · their Claude is irregular and the "tentacles" keep moving and
> growing · in the heart you can tell that every element has gone to detail · our shapes are
> very polygonal · the planet's ring is badly made. In short, every element has to go to
> detail.»

What changed (whole-video mean difference 22.6 → **14.2**; montage cards 5–9, heart 9–13):

- **Measure, don't eyeball.** `reference.mjs track` (one colour followed frame by frame:
  centre, box, area) plus throwaway probes (face finder, colour boxes, column runs, ink
  boxes) gave, per drawing, the flower's position, reach, squash and expression on every
  card, the heart's pop-in order, the notepad's geometry and the writing speed. Then our
  own render is tracked the same way to calibrate (our reach ≈ 0.92 R).
- **Every object rebuilt piece by piece** from full-resolution crops, one file per object
  (`segments/things/*.js`), four agents in parallel: colours sampled, outlines traced by
  colour segmentation, textures that say what the paper is (newsprint bars, cursive,
  sheet music, maps with contours and dashed routes), cached replacement drawings where
  the reference redraws (waves, tentacles, steam), back/front layers where the flower sits
  inside (book letters, boat, cup). The ring is two paper strips, one behind the planet
  and one in front.
- **Claude flower:** irregular rays cut once and only scaled on twos; bigger/fatter in
  close-ups; squash & stretch of the rays only (the face never deforms); new expressions
  (squint, open laugh, wavy mouth); rays drawn over a caught plane but under the face.
- **Hands and paper:** traced fist holding a marker with ribbed cuff and knitted sleeve;
  mittens with a separate thumb for the tear and the fold; the page torn along the
  perforation with flying scraps; the plane folded drawing by drawing under the lamp.
- **Lettering:** everything handwritten is Patrick Hand in felt-tip marker (a thinned
  core inside a lighter rim, rendered once and cached), at measured widths and baselines.
- **Heart:** traced outline with a red thickness copy, cursive paper background,
  graph-paper braces, a notebook '?' with its shadow, miniatures redrawn chunkier.

Open:
- Exterior shots (town collage, printed-paper planes, lights) are being rebuilt; they are
  now the worst seconds (0–1.5, 6, 24–25).
- `review.mjs` flags 4 flashes at 15–16 s: the reference's own 0.25 s cards (teal → purple
  → pink → blue → cream). Kept for the 1:1 study; a real piece would soften those cuts.

## Round 4 (user)

> «You know it's perfect when I have to zoom in to see differences, hahaha. Awesome. The
> only thing I have seen at a glance is that our question mark runs off the page.»

- Cause: Patrick Hand makes «you love?» 1.27× as wide as «what do»; the reference's hand
  lettering 1.21×. The first line was measured and matched, the second never was.
- Fix: notes set a per-line letter spacing that keeps the reference's line ratio
  (`WL.lineSpacings`); the torn page is measured 34 units wider than the sheet on the pad
  and its perforation tabs are shallower. The '?' now sits inside the page in every note.
- Lesson (in the `replicate` skill): measure text like any other element, line by line.

> «I would leave everything you know persisted…» (so that another agent can use it.)

- New skill `replicate` (workflow, measuring tools, recipes, pitfalls with fixes, splitting
  the work across agents, `agent-brief.md` template); `engine/reference.mjs` gained `cuts`,
  `box`, `runs` and `face`; the agents' best helpers moved into `PaperDetail` (`cspline`,
  `taper`, `curl`, `rings`, `wobblyLine`, `markerPath`, `punch`, `wordBars`, `sheetMusic`,
  `mapPaper`), with pixel-identical output; `segments/README.md` maps the replica.

## Round 5 (auto · exteriors)

- The town, the paper planes and the five exterior shots rebuilt by a parallel agent
  (`segments/town.js`, `segments/exterior.js`; the old versions removed from `sets.js` and
  `shots.js`). Exterior shots went from 18–22 to 6–10; whole video 14.2 → **11.2**.
- The town is a collage of printed papers (newsprint bars, cursive, sheet music, maps with
  contours and dashed routes), dark triangular roofs, sticky-note windows, the cat on a
  roof. Planes are folded from printed paper, pinned per drawing by three measured points
  (nose, fold, wing), on dashed trails anchored to their start.
- Measured, not assumed: the girl's head holds still in the window (tilt −0.19), her hands
  are round mitts at that size, windows light up as tissue-paper discs, the flower's size
  per drawing from its measured width.
- `review.mjs`: only the known flashes at 15–16 s (the reference's 0.25 s cards).
- Worst seconds now 3.0 and 7.0 (cut instants) and 9.0.
