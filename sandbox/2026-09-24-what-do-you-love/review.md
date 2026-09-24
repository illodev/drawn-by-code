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

> «¿Has visto que el vídeo va al detalle? Manos, formas, perspectivas, se nota el trabajo
> (ojo, está hecho con Claude también), pero en este repo va a ser importantísimo el detalle.»
> (Did you notice the video goes into detail? Hands, shapes, perspectives — you can tell the
> work (and it was made with Claude too). In this repo detail will be extremely important.)

- Diagnosis with full-resolution crops (`compare --crop`): structure, timing and palette
  match, but the craft is animatic-level. Body parts are merged, hands are circles, no knit /
  newsprint / wood-grain textures, no creases, no perspective on moving paper, a rectangle
  face, twelve identical sticks for the flower.

## Round 3 (user · detail, piece by piece)

> «Cosas como el perro denotan el poco esfuerzo en la forma · la chica es gordita y con poca
> artesanía · su Claude es irregular y los "tentáculos" se van moviendo y agrandando ·
> en el corazón se nota que cada elemento ha ido al detalle · nuestras formas son muy
> poligonales · el anillo del planeta está mal hecho. En definitiva cada elemento tiene que
> ir al detalle.» (The dog shows little effort in its shape; the girl is chubby and crude;
> their Claude flower is irregular and its rays keep moving and resizing; in the heart every
> element got detail; our shapes are polygonal; the planet's ring is badly made. Every
> element has to go to detail.)

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
