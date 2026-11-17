# Review · magazine-ad-test

## Round 0 (user) · finding the style

A style search before any brief: six looks on one motif (`ref/search-1-six-looks.jpg`), then
four kinds of mid-century on a bakery (`ref/search-2-mid-century.jpg`), generated in the
user's ElevenLabs flow (20 images, about 3,800 credits). The user's words, in order: «Let's
look for serious and solid styles for a new video» → «Make them less serious» → «Generate
reference images with ElevenLabs so I can understand you better» → «For whatever reason, in
3 out of 4 sessions you've chosen a lighthouse as the reference» (lesson in **new-style**) →
«I'd go for mid-century» → «Don't generate any more references with ElevenLabs» → «I like
the magazine ad».

## Round 1 (auto) · the press, and the reference reprinted from its own separations

- **The press is the riso press with other inks.** `Riso.press` now takes `palette`, `order`,
  `paper`, `register`, `fibres`, `edge` and `spread` (the riso template renders byte for byte
  as before). `styles/magazine-ad/ad.js` (`Ad`) sets orange, turquoise and black on cream, and
  adds a brush stroke, a starburst, a boomerang and the script.
- **Measured, not guessed.** A first still with the set placed by eye looked like a poster of
  the scene, not the scene. `tools/separate.py` reads the reference as what it is, paper with
  three inks multiplied over it: per pixel a non-negative fit of the three densities, the black
  at ×2 as line art (polygons), every plate's tone cut into seven nested bands (polygons, filled
  even-odd, each band laid over the last with the alpha that brings the stack to its middle
  tone). `scene.js` fills those polygons on the press's plates: the reference's shapes, this
  press's screens.
- What the crops taught (`pairs` of the reference at ×3 against the render at ×2):
  - **A screen's tone is area, so convert in reflectance, not density.** Fitted in density,
    a 50 % orange screen came out at 28 %: the skin printed pale peach. Converting each pixel's
    density coverage to area on the channel the ink absorbs most (`(1 − a^c) / (1 − a)`)
    brought the skin back.
  - **The screens are fine:** about 2 px a cell at 1280 for the colours (3.2 at 1080) and a
    coarser black (×1.4), measured on 12× crops (the FFT was useless: the generated halftone is
    not a regular screen). Crisp dots (`edge` 0.6, `spread` 0.35), or the tints read as flat.
  - **Paper stays paper:** a blur over a screen cell crept into the whites of the eyes and the
    teeth; tone is zero where no ink lies within 2 px.
  - **The black screens only where it means to** (tone ≥ 0.2), or stray black dots freckle
    the skin; line art from coverage 0.32, so the cat's fine hairs stay lines.
- Still off: the night outside the window is a deep blue (`#0e4f6a`) that three inks cannot
  make (it prints teal-black); the oven's yellow core prints orange; the cat's finest hairs
  print as black dots. Nothing moves yet.

Next: the pieces. The baker, the peel and its loaves, the cat and the graphics cut out of the
separation as parts, and the test's action.
