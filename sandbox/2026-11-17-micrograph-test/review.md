# micrograph-test · review

## User feedback (translated from Spanish)

- With three colourised micrographs (and the two stills that became lightfield): «Do you
  think we could replicate these tones and styles as scientific/biological styles? I know
  they're different images, but the idea is to capture a bit of the scientific style».
- After lightfield was merged: «Shall we go for micrograph?»

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
still's. The stills' source is not known: the user found them through a Google image search
(they look like NIAID's).

## User feedback, round 2 (translated from Spanish)

- «Yes, propose ideas for original scenes»
- «Make the three recommended ones as one edited piece; I also propose Naegleria. Could we
  maybe put a title on each one? Or do you think that's unnecessary?»
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
committed copy is that size anyway (at crf 29, not 26: with this much grain and the serial
sections' flicker crf 26 was 18 MB). A 1080p render is owed once the piece is approved. In
the rendered film the mitochondrion's caption still crosses the lower sheet of reticulum on
some slices (the sheet wanders with depth): legible, not clean.

**Lessons.** A style test passes on what was measured and its originals fail on what was
assumed: both first versions of the section-palette shots were diagrams, because a
membrane was drawn as a line wherever one exists. What shows is decided by the
magnification, not by the anatomy.

## User feedback, round 3 (translated from Spanish)

- «Let's move on to the music»

## Round 3 (auto): sound

**The grid.** The picture already had a rhythm: cuts on half seconds and a new slice every
eighth of a second in the serial sections. At 120 BPM those are beats and sixteenth notes,
so the score was asked for at that tempo and `bpm: 120` is declared in the scene.

**The score.** One prompt describing the film's arc second by second, four takes
(ElevenLabs Music v2.5, 39 s each; the download host was checked before generating).
Nobody listens here: they were chosen by measuring level per second, tempo and beat phase,
a sixteenth-note pulse per shot, the strongest onsets against the cuts and events, pitch
classes per shot and the last seconds.

| Take | What it does | Verdict |
|---|---|---|
| 1 | on the grid, but one level (−17 to −14 dB) from second 0 to 32, then gone: no arc, silence under the title | no |
| 2 | near silence for 12 s, then a hit every 4 s; drifts to C in the middle | no |
| 3 | in D throughout, beats on the half seconds; grows as the first image forms (accents at 2.5–3.5 s, the wash), dips under the serial sections, a sixteenth pulse in the budding shot, onsets at 29.6 s (the pinch) and 31.5 s (the last cut); fades from 33 s | **used** |
| 4 | silent to 5 s, quiet to 12 s, then one level to 36 s and a clean stop at 37 s | no (its ending was considered as a splice for take 3; not done: two takes may not sound like one piece, and nobody can check that here) |

What take 3 lacks is the ending (the title comes at 35 s, in its fade): its tail is raised
up to 7 dB from the last cut and a synthesised wide D minor with bells on the title
(`music.mjs --ending`) is laid over it. `music.mjs` alone is the fallback score when the
private take is not there.

**The sound design** (`sound-design.mjs`) is synthesised from the shots' own constants: the
column's hum up and down with the beam, a shimmer crossing with the wash, the contractile
vacuole's two drops, a relay, a knock and air that rises or falls at each change of
magnification, a tick per slice (the first measurement had them 20 dB under the score:
raised and lengthened), the phage's four taps, the baseplate's knock, the sheath's ratchet
and snap, the air falling as the head empties, the bud's low swell and its pop.

**The mix** (`mix-sound.sh`): −15.9 LUFS integrated, LRA 5.7 LU, true peak −1.5 dBFS; no
flat stretch on the waveform; every slice and every event shows as a rise in the mix. The
picture was not rendered again: the sound was added to the existing video stream, so the
automatic review of round 2 stands (its cuts are on the beat of the declared tempo).

**Said plainly:** nobody has listened to this. The numbers say the levels, the timing and
the key are right; they do not say whether the take is beautiful, whether the synthesised
ending sits well on it, or whether the ticks and clicks are pleasant.

## User feedback, round 4 (translated from Spanish)

- «Add the narrator with a deep voice, as in lightfield. Can it be done without effects?
  Just the music, with the ticking of time»

Translation: the narrator of the lightfield film, here too; and every sound effect out:
only the music, with a ticking of time. Read as: a clock running through the film (and the
tick per slice the serial sections already had), nothing else. If only the slices' ticks
were meant, the clock is one block of `sound-design.mjs` to delete.

## Round 4 (auto): narrator, and no effects

**Removed:** the column's hum, the relay, knock and air at every change of magnification,
the wash's shimmer, the vacuole's drops, the phage's taps, ratchet, snap and falling air,
the bud's swell and pop. **Kept / added:** a clock, one tick a second, tick and tock in
turn, on the half seconds, so every cut of the film falls on a tick (they are beats of the
score); and the tick per slice. The clock is not ducked under the voice: it keeps time.

**The narrator.** Seven lines, one per shot, written to follow the pictures as one thought
(swallowing → the guest that stayed, the mitochondrion → things not quite alive → a machine
with one instruction → a message → leaving in the skin of its reader → we have only just
learned to look). Same voice and direction as lightfield (ElevenLabs v4, «Connery», `[deep
voice] [slowly]`), two takes a line (one of the fourteen was still queued when the rest
were mixed; its twin was good). Chosen by measuring: speech bounds, the pause inside the
line, and the last 40 ms against the peak (all end clean, 54 dB or more under it; one take
that starts at 0.00 s was passed over for its twin, in case its first sound is clipped).

**Placement** is by the second each line's first sound is heard, against the picture and
against the score: «Smaller still…» begins 0.2 s before the magnification changes; «copy
me» falls as the head begins to empty; «leaves» ends where the bud pinches off (29.6 s);
«look» comes as the title forms. Two lines were moved for the score's hits at 16.0, 20.0
and 24.0 s: the first measurement had the voice 6 dB under the bed on «message» (the hit
at 24.03), so that line now starts over the emptied phage and ends at 23.88, and the
phage's line sits between the hits at 16 and 20.

**The mix:** −14.8 LUFS, LRA 3.8 LU, true peak −1.5 dBFS. On stems, where the voice speaks
it is 11.9 dB over the bed at the median (10th percentile 4.3; the windows under that are
the quiet ends of words, and three loud ones at 17.1, 17.2 and 19.5 s within 3 dB). Every
clock tick shows in the mix as a rise (3–7 dB for most, after the first version's 0–3 dB:
given more body, 9 ms and a lower pitch, rather than only more level).

**Said plainly:** nobody has listened to this either. What the words say was checked
against the prompts, not transcribed blind. Whether the clock is the «ticking» that was
meant, and whether it sits well with the score, only the user can tell.

## User feedback, round 5 (translated from Spanish)

- «It's fine as it is, we can open the PR»

Approved as it is: the clock was the «ticking» that was meant, the narrator's lines stay.
The style goes from «in testing» to approved, the film goes on the site (first in the
programme, with its poster) and in the README's gallery, and the pull request is opened.
Still owed: a 1080p render (this one is 1280 × 720), and the style's place in the README
cover's carousel, which needs the cover rendered again (lightfield is waiting for the same).

