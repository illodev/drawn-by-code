# Reviews · oil-test

Each round: what was seen (automatic and by eye), what was changed and what lesson comes out.
Lessons that apply to other videos go up to the matching skill (see review/SKILL.md).

## Measurements (the user's ten Monets, `tools/paintstats.py`)

Each image scaled to 800 px wide; «broken» is the median variation inside 10 px tiles.

| Picture | Darks | Lights | Luminance 1 % / 99 % | Median saturation | Broken (lightness / chroma) |
|---|---|---|---|---|---|
| Japanese footbridge | `#0d2124` | `#a9b6ac` | 18 / 194 | 0.41 | 26.6 / 22.6 |
| Woman with a Parasol | `#313e2c` | `#d8d3c5` | 40 / 224 | 0.22 | 11.4 / 12.1 |
| The Tuileries | `#0a0c15` | `#d5d1c2` | 6 / 220 | 0.24 | 30.7 / 17.0 |
| A walk at Argenteuil | `#232929` | `#dee1d4` | 26 / 234 | 0.16 | 17.3 / 10.1 |
| Vétheuil | `#5c583a` | `#dee1d2` | 68 / 229 | 0.22 | 9.9 / 11.3 |
| The Magpie (winter) | `#424643` | `#d2d7d1` | 44 / 220 | 0.06 | 10.9 / 3.3 |

What it fixed in the kit: darks are blue, green or violet (never brown-black); whites are
cream; a sunlit picture needs a chroma breakup of 10–17, a grey winter one about 3.

The test, measured the same way: the memory patch (door and wall) 13.8 / 10.3, darks
`#31303c`; the tree and village 15.1 / 14.1, darks `#28474b`; the present 10.0 / 3.0,
saturation 0.06 (The Magpie: 10.9 / 3.3, 0.06).

## Round 1 (auto)

Seen on stills at 1920 and crops at 1:1:

- The present, painted only with huge strokes, was an abstract of slabs: nothing could be
  named. A last pass of strokes dragged over the edges made it worse. → The present is now
  laid from a blurred study (`blur: 13`) with medium brushes: soft, and every mass reads.
- Branches, the cable, the rails and the tag were sharp lines over a soft picture. →
  `lines: false` for the present; boughs widened in the study; rails as one dark veil.
- Stray pink and lilac slabs in the greys (accent strokes). → no accents in the present.
- The car had the value of the paving and vanished. → dark blue-grey body, darker glass,
  a light along the roof.
- The memory was a cream cut-out: white wall, white ground, a clean ellipse. → whites
  lowered to cream and broken with rose, yellow and pale blue; ground darker than the wall;
  the patch's rim wanders (three lobes that turn slowly) and the finished area reaches
  almost to it.
- Interior darks were brown-black. → deep blue-violet.
- Greens were acid. → bluer darks, quieter lights, some blue strokes in the shade.
- Fine strokes had jagged edges. → paint stamped at 1.5× and scaled down.
- The bicycle's wheels were strings of beads. → line pieces short, overlapping, round.
- The door was at the frame's edge when he reached it. → the canvas is wider than the
  frame and the head turns after the eyes (0.3 of the way, 0.3 s late).
- Bare canvas at the corners (as in the self-portrait) came out as rectangles with the
  flat brush, and could not follow the head. → dropped; open question below.
- One dark comb of bristle ends in the light paving caught the eye even on the contact
  sheet. → dry ends shorter, and every end breaks into dry-brush speckle.

`review.mjs`: no warnings, deterministic, no still stretch over 1 s.

Open questions for the user:

- Nothing yet says «these are his eyes» except the head following the gaze: no hands, no
  cap's brim, no blink. The film will need one of them.
- Things inside the memory do not move in this test (she stands still). Moving them means
  laying that part of the study again per drawing: possible, not built.

## Round 2 (user)

> Importante llevar los detalles a nivel extremo, cada microdetalle cuenta. Yo te paso las
> imágenes que te hagan falta

Translation into changes:

- The paint itself gets its micro-detail: dry brush that catches the canvas threads, wet
  paint dragging what is under it, lights laid thick and darks thin, a finer brush.
- Every element of the memory is taken apart into its real pieces, down to what a 1.5-unit
  brush can hold (a face's features under the hand's shadow, the print of a dress, the
  letters of the shop sign, a bicycle's chain guard, roof tiles, a stork on the tower).
- Something small moves inside the memory (leaves, swallows).
- A detail sheet (every element cropped at 1:1) goes to the user with the render.
- Ask the user for the references that decide what guessing cannot (see the end).

### Round 2 (auto), after the user's «cada microdetalle cuenta»

The paint (kit):

- Dry brush now catches the tops of the canvas threads (the weave is shared by the ground
  and the stamp); a first version drew a visible grid of dots, so the threads count for
  less than half of the test and noise for the rest.
- Lights are laid thick and darks thin; wet paint drags what is under it along the
  stroke; a sixth brush of 1.5 units; the memory's study at 1.25 px per unit.
- `lay` no longer lays the pieces of a line that a later shape covers in the study. Until
  then the grain of the door ran across the cat on the step, roof tiles across the tree
  trunk and flagstone joints across every shadow.

The memory, element by element (`detail.js`, sheet in `review/detail.jpg`):

- Her: calves and ankles, espadrilles with ribbons, a skirt in three folds with a pale
  hem, a print of sprigs, collar, buttons, belt and buckle, a medal, the face with the
  shade of her hand across brow and eyes, mouth, ear and earring, hair with a bun; the
  basket with ribs and weave, a scored loaf, greens, a tomato; the hand on the handle with
  its knuckles; the raised hand palm down with the thumb under.
- The door: reveal and lintel with a keystone, bevelled panels, grain, studs, hinges,
  letter slot, lock with its key, a hand-shaped knocker; the hall's tiled floor, a coat,
  the patio beyond; the fly curtain of coloured strips gathered on the jamb; the worn step;
  number 7 on a blue tile, a bell push, an aspidistra, an orange cat asleep on the step.
- The shop: ULTRAMARINOS lettered on the board; tins with labels and bottles with corks
  on three shelves; salt cod, garlic and sausages on a rail; the strip curtain of the back
  room; a marble counter with scales, a jar of sweets and wrapping paper; crates with
  slats and nail heads, every fruit lit and shadowed, price cards; two sacks with a scoop;
  a rush chair, a broom, a doormat; the awning with a braided scalloped valance and arms.
- Tree and bicycle: boughs with bark, leaves one by one at the crown's edge, seed balls on
  threads, sparrows, a heart cut in the bark, the pit of stones; mudguards, cream tyre
  walls, twelve spokes a wheel, chain guard, pedals, saddle, a parcel on the rack, bell,
  lamp, brake cable, reflector.
- The village: tile rows, chimneys, television aerials, windows with shutters and pots,
  washing on a line, a belfry with its bell, a stork on its nest, a dog by the garden
  wall. Wall: cracks, a patch of fallen lime, wires on insulators, a drainpipe, the lamp.
- Moving: six swallows over the roofs and leaves turning in the light (`live(d)`).

Faults found on the crops and fixed: the awning was behind the top shelf (repainted
last); a lamp and its glow hung behind the awning as a brown arch (removed); hung goods
were hidden by the awning (moved under the lintel); the stork was behind the crown, then
white on a white cloud, then had a leaf on its head (tower lowered, cloud moved, leaves
kept off it); boughs were flat planks (painted with bark); a pink slab on the white wall
(fewer accents on the two widest brushes); the door's grain read as bars (fewer, quieter).

Still open:

- Her hands are 15 units long: a wedge, a thumb and three knuckle marks. They have not
  been through the hands skill's check sheet, which wants a reference per grip.
- She does not move yet.

References asked of the user: see the message of this round.

### Round 3 (user)

> Yo creo que no está mal, podemos avanzar e ir retocando

The look is accepted to go on with; the film is `sandbox/2026-11-12-donde-miro/`, and
retouching continues there (this folder stays as the style test).
