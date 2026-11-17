# micrograph-test

- **Style:** micrograph (new: an image made by an instrument and tinted afterwards; the
  second of the two «scientific» styles the user asked for, after lightfield)
- **Format:** 16:9 · 16.5 s · 24 fps (the detector reads out every two frames)
- **Purpose / audience:** the style test of `micrograph`. The user, with three colourised
  micrographs: «Crees que podríamos replicar estos tonos y estilos como estilos
  científico/biológicos? Sé que son diferentes imágenes, pero es captar un poco el estilo
  científico», and once lightfield was merged: «Vamos por micrograph?».
- **One-line idea:** one session at the microscope: a field of cut virions is found out of
  focus, pulled in and tinted; the magnification is turned up onto a single particle in
  its pool of stain; then down again onto virions leaving a cell, on black, where the
  title is stained matter like the rest.
- **References** (the user's stills, kept in `private/`, never committed; all three are
  colourised transmission electron micrographs of a coronavirus, which look like NIAID's
  SARS-CoV-2 images: source to be confirmed with the user):
  - `section169.png`: a thin section, orange particles with dark membranes (two of them
    budding) and mauve ghosts on pale blue (cropped 47 px top and bottom to 16:9).
  - `stain169.png`: one particle, olive core, rose envelope and spikes, in a dark pool of
    stain on lilac (the centre 16:9 of the square still).
  - `dark169.png`: four virions (red core, yellow shell, blue-grey spikes) by a teal cell
    on black (padded to 16:9 with the black it already had on its right).
- **On-screen text (literal):** «micrograph» («micro» in gold Lora, «graph» in white
  Poppins Bold, the same wordmark build as «lightfield») and under it the signature
  `illodev x Claude` (Lora; exactly so): specimen text, in the dark shot only. Databars:
  `200 nm`, `50 nm`, `100 nm` (VT323).
- **Music / rhythm:** none yet (`bpm` undeclared): a silent style test.
- **Must NOT happen:** anything that reads as drawn (outlines, flat fills, a spike as a
  stick with a ball, dots on a grid); colour carrying a shape; white specks; grain sliding
  over a particle; a glow.

## Shot list

| Time | Shot | What happens |
|---|---|---|
| 0–5.5 | Section (reference) | The beam comes on over a grey, out-of-focus field. The operator pulls focus (through it and back, 0–1.6 s); from 1.3 s the colourist's wash crosses the frame from the left with a ragged front and the grey becomes orange on pale blue. The stage creeps; outlines breathe; the two buds pull a little further from their parents. At 3.5 s the frame is the reference still. At 5.15 s the magnification is turned up: the image rushes in, loses focus, the beam dips. |
| 5.5–10.5 | Stain (reference) | The new field arrives soft and a little wide, and is pulled into focus: one particle in its lopsided pool of stain. The magnification creeps in, the spikes sway. At 8.0 s (2.5 s local) the frame is the reference still. At 10.15 s the magnification is turned down: the image pulls away, soft, the beam dips. |
| 10.5–16.5 | Dark (reference) | Virions by the edge of a cell, on black; focus is found once more. They drift off the cell, each at its own rate, and turn slowly; the cell's edge ruffles. At 13.5 s (3 s local) the frame is the reference still. From 14 s the title appears in the black to the right, stained and grainy like everything else; the beam goes off at the end. |

## Detail gate

- Section: `node engine/detail.mjs sandbox/2026-11-17-micrograph-test/scene.js sandbox/2026-11-17-micrograph-test/private/section.mp4 --times 3.5 --grid 12 --out sandbox/2026-11-17-micrograph-test/review/detail-section`
- Stain: `… private/stain.mp4 --times 8 … --out …/review/detail-stain`
- Dark: `… private/dark.mp4 --times 13.5 … --out …/review/detail-dark`

The `.mp4` references are the stills looped for the film's length (`ffmpeg -loop 1 -i
private/dark169.png -t 18 -r 24 -pix_fmt yuv420p -crf 12 private/dark.mp4`).
