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
