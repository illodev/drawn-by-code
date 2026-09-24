# Reviews · saas-promo

Each round: what was seen (automatic and by eye), what was changed and what lesson comes out.
Lessons that apply to other videos go up to the matching skill (see review/SKILL.md).

## Round 1

## Style test · round 1 (auto)

The invoice block (6 s): POV on the laptop, the pointing hand presses «issue» on the beat,
the printed invoice peels off the screen; medium shot of Laura, the stamp leaves the QR,
the sheet folds into a plane and flies into the tax office's mailbox, flag up on the beat.
Fixed in the round: the hand hid the button (smaller, fingertip from below), the peeled
sheet was cropped, the mailbox on a post crossed the desk (now on the desk), the folding
paper was blank (the print shows through, mirrored), press ticks over the total, a long
neck. `review.mjs`: no warnings.

## Style test · round 2 (user)

> «Los detalles, hay que cuidar los detalles. Por ejemplo las manos parecen muñones.
> También el entorno parece pobre, es como si en un espacio hueco se hubieran repartido
> 5 cosas, pero se siente vacío. Esto es lo que hablaba de los detalles del vídeo de antes.»
> (Details: the hands look like stumps; the set feels like 5 things scattered in an empty
> space.)

Diagnosis: with no reference to measure against I stopped at «it reads». The detail bar
applies to original pieces too: build them against a reference (the replica's traced fist,
real photos of desks) and fill the frame in depth.

## Style test · round 3 (auto, after the detail pass)

- Hands rebuilt in `PaperDetail.hand` (separate fingers, nails, knuckles, thumb with web,
  8 poses, held objects between `part: 'back'` and `'front'`); Laura rests hers on the desk.
- The office rebuilt as a full set in three depths (`segments/office.js`): wallpaper,
  window with a collage town, curtains, a full shelf, cork board, clock, calendar with real
  pages, bookcase, chair; lamp, papers, notebook, laptop, pen cup, phone, letter tray on the
  desk; mug with steam, big leaves and a paper stack in front.
- The screen close-up keeps the room behind it, sticky notes on the bezel, base/VAT/total
  and a payment note on the form (both on the client's site).
- Plane darker against the cream wall; calendar months and weekdays from the brand copy.
- `review.mjs`: no warnings.

## Style test · round 4 (user)

> «¡Ese es el nivel!» — the style test is approved: Laura, the paper UI, the office, the
> hands and the titles are locked. Every block of the edit is held to this bar.

## Animatic v1 · 50 s, all blocks (auto)

- Blocks built by three parallel agents on one brief (bar: the approved frames, copy only
  through keys, shared kits read-only), merged by file: chaos + cloud, expenses +
  collections, compliance + close; taxes + business earlier.
- Fixes at merge: close on the September page (after business), the collections second
  title given context in the private copy (a bare «you approve them» read as a fragment).
- Sound: the ElevenLabs track cut by bars (drop on 10 s), its dead stop at 48.5 thrown
  through an eighth-note delay so it rings out; 89 cues from each block's contact
  constants, aligned on each effect's onset (`mix.mjs` `"align": "onset"`). −13 LUFS.
- `review.mjs`: no warnings; the 17.0 s jump is the camera flash (intended).
- Known weak spots (from the agents): the compliance stamp arm has no elbow; the end card
  has a lot of empty cream around the mark; the receipt's crumple is mild.

## Animatic v1 · round 2 (user)

> «Logo, me da mucho TOC porque no se parece al logo de Fube.» «Sus manos atraviesan cosas
> y hay veces que cogen perspectivas muy raras. Sus manos cogen el café al revés.»

- Logo: the mark is now the site's SVG cloud path, sampled (three round lobes on a flat
  bottom, a separate bar); the big cloud lost its inner light/dark layers, which blurred
  the lobes into a mound.
- Hands, root cause: `mirror` meant «the hand on the left of the image» while the kit's
  poses are drawn as different hands, so back views had the thumb on the wrong side. The kit
  now takes `side` and has the missing views: `palm`, `pointBack`, `wrap` (round a mug's
  body), `edge` (fingers over an edge from behind).
- Chaos: raised palms drawn behind the pile (it covers them), the clutch is fingers hooked
  over its top edge; nothing crosses the paper. Mugs (taxes, close): held round the body,
  handle turned away, the wrist solved from the mug (`Laura.wrap`). Pointing (issue POV,
  expenses, collections, business): back of the hand with its nail. Compliance: the stamp
  comes down by itself (the stretched arm from the corner is gone), like in «send».

## Round 3 (user)

> «El logo de Fube con wordmark de la pantalla del ordenador tiene 2 colores, y tiene que ir
> logo y wordmark de color de Fube.»

- The app's sidebar (laptop screen), the phone app header (expenses) and the clay test's
  screen now draw `BRAND.lockup`: the site's logo.svg (cloud, bar and wordmark as paths), all
  in the brand colour. The placeholder brand has its own one-colour lockup.
