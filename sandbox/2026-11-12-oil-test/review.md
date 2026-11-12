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
