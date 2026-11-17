# Reviews · readme-cover

## Round 1 (auto, by eye)

- The first paper card was the template's blob on purple: nearly empty at polaroid size.
  Now a lined sheet with a handwritten title, a paper sun and a waving hand.
- The hand holding the last tile first came in from below with its sleeve running down
  over the cards: the forearm now goes up to the top right, fingers behind the tile,
  thumb in front ('hold', side right).
- The line card was bare: a sun with rays, a cloud, grass and a balloon.
- «skill it» ran together in the hand font: the subtitle says «lesson» instead.
- Each style's kit paints into its own offscreen canvas with a small env ({W, H, k, px}):
  every kit worked unchanged at polaroid size, the clay3d renderer included.
- `review.mjs`: no warnings.

## Round 2 (user)

> «I think the finger in the repo's GIF is not right.»

- The 'hold' thumb lay flat across the tile's top edge with the palm above it: a mitten.
  The hand is turned so the thumb points down over the tile's face, the fingertips peek
  from behind its left edge and the forearm goes off to the right: a real pinch.

## Round 3 (user)

> «4 fingers should show, with the thumb behind; I think that is the most natural.»

- The tile is now held with PaperDetail 'wrap': the thumb behind it (part back), the back
  of the hand and the four fingers over the top of its face (part front), the forearm up to
  the top right; small enough and high enough to leave the letter clear.

## Round 4 (user)

> «The part of the hand should not stand out from the rest as a polygon.» «I would turn the
> images at the bottom into a carousel that moves in a loop, and add each style to it.»

- 'wrap' drew the back of the hand as a separate oval over the fingers: now the back of the
  hand comes first (narrow at the wrist, widening to the knuckles) and the fingers over its
  edge, one hand (detail.js; the saas-promo mugs checked).
- The polaroids are a carousel that slides left in a loop (6 s, on twos), one per style:
  each style's own template is loaded (capture.js collects its Motion.scene) and painted at
  a chosen second into its polaroid. A new style adds one line to STYLES.

## 2026-11-12 · cereal-ad joins the carousel

One line in STYLES (`cereal ad`, its template at 3.2 s: the starburst, RADICAL! and the box),
its two fonts in the cover's list. With ten polaroids the last one (pixel art) no longer
reached the frame in 6 s at 160 units a second: the carousel runs at 200 now, so every style
still passes. `render/cover.gif` (900 px, 12 fps), `cover.jpg` (frame 76) and the MP4 re-made.

## 2026-11-17 · lightfield and micrograph join the carousel

Two lines in STYLES (their templates at 3.4 s and 3.2 s) and their three fonts in the cover's
list. Both templates declared a top-level `const TPL_GLSL`: loaded into the same page, the
second one stopped it («Identifier 'TPL_GLSL' has already been declared»), so each template's
shader constant has a name of its own now (`LIGHT_GLSL`, `SPECIMEN_GLSL`). With twelve
polaroids the carousel runs at 300 units a second: six places in the six seconds, so all
twelve pass once. The README no longer says «one polaroid per style»: eighteen styles do not
fit a six-second loop, the carousel shows a dozen. `render/cover.gif` (900 px, 12 fps),
`cover.jpg` (frame 120: line, clay, clay 3D, lightfield, micrograph, risograph) and the MP4
re-made; `review.mjs`: no warnings.
