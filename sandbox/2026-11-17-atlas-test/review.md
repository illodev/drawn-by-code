# Reviews · atlas-test

## Round 0 · choosing the style (with the user)

The user: «Let's look for serious, solid styles for a new video». Six directions were proposed
(a Swiss grid, Isotype, an atlas, a blueprint, a woodcut, a brutalist monolith); the video is
educational («divulgativo») and the user asked for reference images from ElevenLabs. Four
directions that suit an explainer were generated on one subject, how water reaches a city
(gpt-image-2.5, four takes each, the user's account): a Swiss grid, Isotype, an atlas plate,
a blueprint section. The user: «Let's go with atlas; don't generate more images with
ElevenLabs». `ref/atlas-4.png` is the plate matched here; the other three takes are kept
beside it.

## Round 1 · the plate, measured (auto, 1 round of the user's request)

How the plate was read into data (`tools/`, all on our own generated reference):

- **Relief** (`relief.py`): shape from shading with the light from the upper left (azimuth
  315°, checked against the tint: 300–315° explain the brightness best). The broad
  elevation is the **tint**: on a hypsometric plate greenness is an inverted elevation map
  (`out/green.png` reads like a DEM negative). The detail is the shading, high-passed, solved
  as least squares along the light (algebraic multigrid, 30 s at 1280 × 720), plus the fine
  shading integrated straight along the light lines with a leaky sum. The plain is held flat
  (a measured polygon), river floors level, lettering filled from the ground around it.
- **Palette** (`lut.py`): a 16 × 24 table of (tint elevation × shade): hue as the cell's
  mean, brightness by quantiles inside the tint band; calibrated on our own render
  (`embed-lut.py … 1.026,1.030,1.040`: the lines darken the ground the table was read from).
  Contour lines: the measured cores, ground × (0.76, 0.69, 0.65).
- **Ink** (`vectors.py`): 133 rivers as centre lines with widths (skeleton of the blue), the
  lake's shore and its waterlines (1, 3, 5, 8 px in from the shore), 47 canal dashes (13.4 ×
  3.8 px), the town's centre and size, the inks. Roads, village centres, the town's plan and
  the lettering placed from full-size crops (`plate.js`).

What did not work, kept as lessons: a conditional-mean table washed the relief to khaki; a
pure-quantile table averaged hues; isotropic detail noise made blobs; gully noise at the
plate's scale frayed the contours; stream-power erosion on the measured relief
(`tools/erode.mjs`) filled its inconsistent pits into flat plates. The relief stays softer
than the plate's own (it is read off a painting); real terrain is crisp in the same renderer
(`dev/dem/scene.js` on `tools/dem.py`).

**Detail gate** (`review/detail-plate/`, t = 1.75 s, the plate complete): **PASS** · colour
median 7.2 (≤ 8) · p90 10.5 (≤ 27) · no tile too clean or too busy.

## Round 2 · the motion (auto)

`review.mjs`: no warnings; two still stretches over 1 s (the plate 0–2 s, and 7.5–9.3 s where
the camera stopped at the frame's edge while the water slowed into the town). Fixed: the
plate is printed in the first 1.5 s (relief out of the paper, then its ink, then its
lettering; the gate moved to 1.75 s), and the camera eases out from 1.7× to 1.35× as the water
nears the town, so it keeps moving where the frame's edge stops it. Found on the way: the
camera clamp, with the view wider than its range, moved the whole plate 6 px (gate 7.2 →
8.7); it now falls back to the centre.

## Render

`render/atlas-test.mp4` (12 s, 1920 × 1080, re-encoded `-crf 26`, no sound), `render/strip.jpg`
(1.75, 4.5, 7, 11.5 s), `render/atlas-test.gif` (3–8.5 s, 480 × 270, 10 fps, 4.2 MB). Not yet in
the README's gallery, the site's programme or the cover's carousel (twelve polaroids fill its
six-second loop): those wait for the user's approval of the style.
