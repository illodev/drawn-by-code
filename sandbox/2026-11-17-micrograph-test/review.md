# micrograph-test · review

## User feedback (verbatim)

- With three colourised micrographs (and the two stills that became lightfield): «Crees que
  podríamos replicar estos tonos y estilos como estilos científico/biológicos? Sé que son
  diferentes imágenes, pero es captar un poco el estilo científico».
- After lightfield was merged: «Vamos por micrograph?»

Translation: build the second of the two styles proposed then, false-colour micrographs
with the three palettes as variants, and show a style test.

## Round 1 (auto)

**What was measured before drawing.** Grain in flat patches of the three stills: its
period (≈ 9 px on the dark still, ≈ 13 px on the others, at 1920), its strength, and how
it relates to colour: only luminance moves, and the channels follow the tint
multiplicatively below the tint's own luminance and towards white above it. That fixed the
kit's model before any pixel: one grey signal, an instrument, and a ramp black → ink →
light per pixel.

**The kit, as it changed during the round.**

1. First version: signal blurred by focus, grain added by the detector as a share of the
   signal. Frame of the dark shot: right family, but «sand» (too fine, white specks) and the
   spikes were sticks with heads (a diagram).
2. Shot noise (`power` 0.5) and a tinted `light`: black stays clean, no white specks; but
   with all the grain in the specimen and blurred with it the image went to mush, and the
   gate said so (virion tiles at 0.35–0.45 of the reference's texture).
3. `grit`: a second render target for the specimen's own grain, multiplied in after the
   softening. Structures soft, grain sharp, and the grain rides its particle. This is the
   kit's final shape.

**The three shots against their stills** (detail gate at 12 × 12, film seconds):

| Shot | colour median (≤ 8) | colour p90 (≤ 27) | too clean (≤ 6 %) | too busy (≤ 12 %) | flagged tiles |
|---|---|---|---|---|---|
| Section, 3.5 s | 8.0 | 13.0 | 0.0 | 3.5 | 5 |
| Stain, 8.0 s | 5.1 | 11.6 | 0.0 | 1.4 | 3 |
| Dark, 13.5 s | 5.4 | 20.0 | 3.2 | 6.3 | 7 |

All three PASS. The flagged tiles that remain, said plainly: the tiles under the databar
(ours, not in the stills) read as too busy, three in the section and two in the stain shot;
the section has two more, in the wisp of thin matter at the top left, grainier than the
still's; the stain shot has one beside the particle at the limit of too clean (0.60); the
dark shot has one tile wrong in colour (42: an arm of the cell that reaches towards the
lowest virion and that the sixteen discs do not make) and six, at the edge of the cell and
between two virions, that are busier or cleaner than the still.

What each shot took:

- **Dark**: went through the three versions of the kit above. Virions from ellipse fits
  and a radial profile in a few numbers; then nothing centred (core to one side, shell
  thicker on the other), teeth instead of sticks for the fringe, a mauve shell for the dim
  virion, grain combed outwards in the shell (first three times too long: a citrus slice).
- **Stain**: the radial colour table gave the colours at once (median 7.8); the pool of
  stain was lopsided and first fitted too strong and without its decay (the top of the
  frame 35 levels too dark); the spikes went from trumpets on sticks to beads to lumps.
- **Section**: the long one. Positions by eye were off; ellipse fits by rays put them
  within 4 px (checked by cross-matching each body) and the gate stayed at 17. The interiors
  were too light (dark particles are almost black inside) and the granules were dots at
  one scale («leopard»): 13. A signed difference map showed rings round every body, not
  blobs: the edge profile was wrong, not the tone. Measured outlines (32 radii per body),
  the tone inside in rings × sectors (10.8), then the tone just outside too (8.1), and a
  cloud removed (7.8). Then the granules as dark clumps on a lighter ground and lumpier
  membranes, keeping the measure (8.0).

**The film.** Cuts are changes of magnification (the image rushes in or out, loses focus,
the beam dips); the first shot opens grey and out of focus and is tinted by a wash; the
title is specimen (stained, soft, grainy) in the black of the last shot. Two things fixed
on the first sheet: cream showed in the highlights before the wash arrived (`light` now
follows the wash), and the title touched the spikes of a virion (smaller, further right).

**Automatic review** (`review/auto.md`): deterministic, no flashes, no still stretch of a
second or more. One warning, fixed: the first frame was flat black (the beam off); it now
starts dim instead (gain 0.12), which also gives a first frame worth showing. The jumps it
lists at 0.17 and 0.33 s are the beam coming on.

**Cost.** The section shot took 8 s a frame at 960 and 25 s at 1920: the renderer here runs
every branch, so every pixel computed the grain of all eighteen particles. Shading only the
nearest ghost and the nearest cut body (and the nearest virion in the dark shot) made it
three times faster with the same gate numbers. The measured tables went into a data
texture the kit now offers (that alone changed nothing in speed; it keeps 1 600 constants
out of the shader).

**Not done / known limits.** No sound. The three shots are matched stills animated by the
instrument's motion and a little of their own; there is no original scene yet. The gate
passes the section at its limit (8.0) and its membranes are still smoother than the
still's. The stills' source is not confirmed (they look like NIAID's): to credit.

## User feedback, round 2 (verbatim)

- «Sí, propón ideas de escenas originales»
- «Haz las tres recomendadas como una pieza montada, yo también propongo naegledia. Podemos
  poner quizás algún título a cada una? o lo ves innecesario?» · «naegleria*»
- Then, with no words, three pictures of Naegleria: a living trophozoite in contrast (a
  slug-shaped cell, the nucleus as a ring, the rear full of vacuoles, a thread at the tail),
  a 3D illustration (lobed cells full of round vesicles) and a stained smear (two foamy
  amoebae among neutrophils).

Translation: four original scenes (budding, a mitochondrion in serial sections, a phage on
a bacterium, Naegleria) cut with the three reference shots into one piece; a title for
each, which I proposed as the databar's caption, not a title card; the pictures taken as
anatomy for the amoeba, not as a look to copy.

## Round 2 (auto)

**The piece.** Seven shots from the largest specimen to the smallest (see brief.md), 37.5 s.
The wash that tints the film's first shot moved from Section to Naegleria; Section and
Stain now start later in their own time (1.5 s and 1 s in) and arrive like any other shot.

**The four new shots** (no reference: built from the traits in brief.md, checked by
cropping each at full size against the style's checklist):

- **Budding** worked at the first render: the cell's edge joined to each bud by a smooth
  union whose width is the neck, the virion of the Dark shot (extracted to `virion.js`;
  Dark's gate unchanged) shown only where it has come out of the membrane.
- **Phage** read as a T4 in stain at once. Fixed: a seam in the pool of stain half way
  between two phages (only the nearest was shaded: the next nearest now pools too, roughly)
  and fibres that showed as dark smudges instead of pale threads.
- **Mito** came out first as a textbook diagram: clean double outline, cristae as pale
  rods with round ends, granules as squares (thresholded value noise shows its lattice),
  reticulum as ruled lines. Rebuilt: many thin warped cristae with dark walls, membranes
  of uneven weight that wander off each other, granules from gradient noise in 3D, rough
  reticulum that breaks and is studded, vesicles as slices of spheres, softer focus.
- **Naegleria** came out first as a cell diagram: every organelle and the cell itself had
  an even dark line round it. At 2 µm to the bar a membrane cannot show: the lines went,
  edges became changes of density with an uneven cortex, and the whole softened. After the
  user's pictures: the foam of vacuoles (most of them towards the rear), lobes welling up
  along the sides, threads at the tail (first three clean whiskers, then faint and fading).
  The bacterium in the cup was hidden by the cell's own halo: it is now drawn after it.

**Captions.** First in the corner opposite the bar, then on the bar's own line, as an
instrument writes them: one block of text instead of two.

**The reference shots in the new film.**

| Shot | colour median (≤ 8) | colour p90 (≤ 27) | too clean (≤ 6 %) | too busy (≤ 12 %) |
|---|---|---|---|---|
| Section, 13.5 s | 7.8 | 12.1 | 0.0 | 5.6 |
| Stain, 23.0 s | 5.4 | 11.9 | 2.1 | 2.8 |
| Dark, 34.5 s | 6.2 | 19.8 | 3.2 | 6.3 |

Section had passed at exactly 8.0 and failed at 8.1 in the new film with nothing changed
but the frame number (another exposure of the same noise) and the caption: it had no
margin. Tuning inks by mean bias moved it between 8.0 and 8.4. What gave margin was the
same thing as before: measuring. The ghosts were ellipses with random mottling; with their
tone in rings × sectors, like the cut bodies, it is 7.8. The orange and umber inks were
also brought to the measured hue (less red, more blue). Dark's median rose from 5.4 to 6.2
because its caption is white text on tiles that were black.

**Automatic review** (`review/auto.md`, 900 frames): no warnings, deterministic, no flashes
(the serial sections change every three frames but stay within the limit), no still
stretch. On the sheet the mitochondrion's caption fell on a sheet of reticulum: the sheet
was moved up.

**Render.** This round at 1280 × 720 (≈ 45 min here; 1080p would take ≈ 1 h 45 min): the
committed copy is that size anyway. A 1080p render is owed once the piece is approved.

**Lessons.** A style test passes on what was measured and its originals fail on what was
assumed: both first versions of the section-palette shots were diagrams, because a
membrane was drawn as a line wherever one exists. What shows is decided by the
magnification, not by the anatomy.

