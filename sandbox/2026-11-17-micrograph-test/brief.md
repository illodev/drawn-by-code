# micrograph-test

- **Style:** micrograph (new: an image made by an instrument and tinted afterwards; the
  second of the two «scientific» styles the user asked for, after lightfield)
- **Format:** 16:9 · 37.5 s · 24 fps (the detector reads out every two frames)
- **Purpose / audience:** the style test of `micrograph`. The user, with three colourised
  micrographs: «Crees que podríamos replicar estos tonos y estilos como estilos
  científico/biológicos? Sé que son diferentes imágenes, pero es captar un poco el estilo
  científico», and once lightfield was merged: «Vamos por micrograph?». After the three
  reference shots: «Sí, propón ideas de escenas originales» → «Haz las tres recomendadas
  como una pieza montada, yo también propongo naegledia [Naegleria]. Podemos poner quizás
  algún título a cada una?», and three pictures of Naegleria.
- **One-line idea:** one session at the microscope, from the largest thing to the smallest:
  an amoeba reaching round a bacterium; one of its mitochondria, slice by slice; a field of
  cut virions; a phage landing on a bacterium and emptying itself into it; one virion in
  its pool of stain; virions budding from a cell's edge; and the same virions adrift on
  black, where the title is stained matter like the rest.
- **References** (the user's stills, kept in `private/`, never committed; all three are
  colourised transmission electron micrographs of a coronavirus, which look like NIAID's
  SARS-CoV-2 images: source to be confirmed with the user):
  - `section169.png`: a thin section, orange particles with dark membranes (two of them
    budding) and mauve ghosts on pale blue (cropped 47 px top and bottom to 16:9).
  - `stain169.png`: one particle, olive core, rose envelope and spikes, in a dark pool of
    stain on lilac (the centre 16:9 of the square still).
  - `dark169.png`: four virions (red core, yellow shell, blue-grey spikes) by a teal cell
    on black (padded to 16:9 with the black it already had on its right).
  - `naegleria-ref-*` (three pictures the user gave of the amoeba: a living trophozoite in
    contrast, a 3D illustration, a stained smear; seen in the chat, not saved): anatomy only
    (the ring-like nucleus, the foam of vacuoles, the blunt lobes, the tail's threads), not
    their look.
- **On-screen text (literal):** «micrograph» («micro» in gold Lora, «graph» in white
  Poppins Bold, the same wordmark build as «lightfield») and under it the signature
  `illodev x Claude` (Lora; exactly so): specimen text, in the dark shot only. A databar in every shot (VT323): the caption the user
  asked for and the scale, on one line over the bar: `Naegleria · trophozoite · 2 µm`,
  `mitochondrion · section NN/40 · 200 nm`, `virions · thin section · 200 nm`,
  `bacteriophage T4 on E. coli · 100 nm`, `virion · negative stain · 50 nm`,
  `budding · 100 nm`, `virions leaving a cell · 100 nm`.
- **Music / rhythm:** none yet (`bpm` undeclared): silent.
- **Must NOT happen:** anything that reads as drawn (outlines, flat fills, a spike as a
  stick with a ball, dots on a grid); colour carrying a shape; white specks; grain sliding
  over a particle; a glow.

## Shot list

| Time | Shot | What happens |
|---|---|---|
| 0–6.5 | Naegleria (ours, section palette) | The beam comes on over a grey, out-of-focus field; the operator pulls focus; from 1.3 s the colourist's wash crosses the frame. An amoeba in thin section: clear rim, foamy inside, the nucleus as a ring round its karyosome. Two lobes go out round a bacterium and their tips curl in; lobes well up along its sides; the contractile vacuole fills and empties; the inside streams. At 6.1 s the magnification is turned up onto one of its mitochondria. |
| 6.5–11.5 | Mito (ours, section palette) | Serial sections through one mitochondrion, a new slice every three frames (40 of them, counted in the databar): cristae shift, branch and end, vesicles grow and vanish, the outline swells and thins; each slice lands a little off, a little turned, not equally sharp or exposed, with the knife's chatter across it. |
| 11.5–15.5 | Section (reference) | The cluster of cut virions (its own time from 1.5 s: already tinted). At 13.5 s the frame is the reference still. |
| 15.5–21.5 | Phage (ours, stain palette) | Phages in stain over the wall of a bacterium. One comes down (0–2.6 s), its fibres find the wall, the baseplate sits, the sheath contracts (3.0–3.5 s) and the head empties, from pale to dark with a pale shell (3.6–5.2 s). One did all that earlier; two are still adrift. |
| 21.5–25.5 | Stain (reference) | One virion in its lopsided pool of stain (its own time from 1 s). At 23.0 s the frame is the reference still. |
| 25.5–31.5 | Budding (ours, dark palette) | The edge of a cell: dense matter gathers under the membrane, a dome comes out with spikes on it, closes into a sphere on a neck, pinches off at 4.1 s and drifts away turning. Two more at earlier stages, one already free. |
| 31.5–37.5 | Dark (reference) | The same virions further away, by the cell, on black. At 34.5 s the frame is the reference still; then the title; the beam goes off. |

## What the four new shots are built from (no reference still: traits of the real thing)

- **Naegleria.** A trophozoite is a clear rim of ectoplasm round a granular, foamy inside;
  its lobes are blunt and clear and well up suddenly; the nucleus reads as a ring because
  of its huge dense karyosome in a pale halo; a contractile vacuole fills slowly and empties
  at once; food vacuoles hold what is left of bacteria; threads trail from the tail. At
  this magnification no membrane shows as a line. Licence: a section is of a dead cell.
- **Mito.** Two membranes with a pale gap; a dense, grainy matrix; cristae as folds of the
  inner membrane, pale inside, dark-walled, hanging from one side and stopping short,
  never evenly spaced; rough reticulum and vesicles round it. Serial sections flicker:
  registration, exposure and focus change from slice to slice.
- **Phage.** In negative stain a full head is pale (the stain stays out) and an empty one
  dark with a pale shell; the sheath is striated and shortens to half on contraction while
  the tube keeps its length; fibres are faint and kinked; stain pools darkest against
  whatever stands on the film. Licence: a dried preparation does not move.
- **Budding.** Dense matter under the membrane, a dome with spikes, a sphere on a neck, a
  free particle: the stages textbooks show side by side, here in one bud. The virion is
  the one measured for the Dark shot.

## Detail gate

- Section: `node engine/detail.mjs sandbox/2026-11-17-micrograph-test/scene.js sandbox/2026-11-17-micrograph-test/private/section.mp4 --times 13.5 --grid 12 --out sandbox/2026-11-17-micrograph-test/review/detail-section`
- Stain: `… private/stain.mp4 --times 23 … --out …/review/detail-stain`
- Dark: `… private/dark.mp4 --times 34.5 … --out …/review/detail-dark`

The `.mp4` references are the stills looped for the film's length (`ffmpeg -loop 1 -i
private/dark169.png -t 38 -r 24 -pix_fmt yuv420p -crf 12 private/dark.mp4`).
