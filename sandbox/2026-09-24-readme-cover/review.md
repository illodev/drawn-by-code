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

> «El dedo del gif del repo creo que no está bien.»

- The 'hold' thumb lay flat across the tile's top edge with the palm above it: a mitten.
  The hand is turned so the thumb points down over the tile's face, the fingertips peek
  from behind its left edge and the forearm goes off to the right: a real pinch.

## Round 3 (user)

> «Deberían salir 4 dedos y el pulgar atrás, creo que es lo más natural.»

- The tile is now held with PaperDetail 'wrap': the thumb behind it (part back), the back
  of the hand and the four fingers over the top of its face (part front), the forearm up to
  the top right; small enough and high enough to leave the letter clear.

## Round 4 (user)

> «La parte de la mano no debería diferenciarse como un polígono del resto.» «Las imágenes de
> abajo haría un carrusel que se moviera en bucle, y por cada estilo añadirlo.»

- 'wrap' drew the back of the hand as a separate oval over the fingers: now the back of the
  hand comes first (narrow at the wrist, widening to the knuckles) and the fingers over its
  edge, one hand (detail.js; the saas-promo mugs checked).
- The polaroids are a carousel that slides left in a loop (6 s, on twos), one per style:
  each style's own template is loaded (capture.js collects its Motion.scene) and painted at
  a chosen second into its polaroid. A new style adds one line to STYLES.
