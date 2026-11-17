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

## Round 2 (user → auto) · the script, and the animatic v1

> I like it quite a lot; write a carefully crafted script and let's go with it.

The script is in `brief.md`: «Fresh!», 30 s, nine shots at 120 BPM, a spot for an imaginary
bakery (Early Bird Bakery). Two threads: the print run (the plates land one by one, and lift
off in reverse at the end) and the cat eyeing the bread (an ear, a whole shot, the bite). The
night in the window pays off as the sun rising behind the logotype. Joe and the cat exist
only as the two generated panels, so the piece is limited animation, as a 1950s TV spot
was: held drawings with moving pieces, and a cut between the two panels where the action
would need a new pose (he is at the oven in C-a; after the close-ups he is leaning back with
the peel out in C-b).

- **Pieces cut from the separation.** `tools/separate.py` now writes each moving piece apart
  (a polygon and a pivot, measured on 50 px grids and 10 px zooms) and fills the background
  under it from around (normalised blurs of growing width), so a piece can move or vanish.
  Graphics printed on paper (the starbursts, «Fresh!») are cut by their own ink and their
  hole is filled with paper, not inpainted: a polygon that clipped the F's tail smeared
  orange and teal across the sky.
- **A piece over ink is opaque.** The loaves printed over the inpainted (dark) oven came out
  black: inks multiply. Each piece knocks its own polygon out of everything under it before
  it prints; so does every code-drawn object over another ink (the logotype's orange over its
  own turquoise shadow, the loaf over its badge).
- **The camera moves over a printed page:** `Riso.press` prints with `zoom`, the dots grow
  as the camera moves in (shots 3, 5, 6).
- **Steam is a hole in the glow, not a thing.** Cut as a piece it took the whole glow with
  it; the glow stays in the background and live wisps of paper rise over it, clipped to the
  oven's mouth.
- The cut to the second panel is a boomerang wipe; the end card (sun, logotype, script,
  address, the loaf in a starburst, the bite) is drawn in code with the kit.
- **The screen belongs to the page.** Anchored to the output, every drawing of a camera move
  re-laid the dots under the picture and the push-in boiled; `Riso.press` prints with `origin`
  (where the page's (0, 0) lands) and `zoom`, so the dots travel and grow with the page.
- Auto review: no warnings; the large jumps it lists are the push-in into the window (a fast
  move on twos, softened to 2.5 s) and the plates landing.
- Still off (for the next rounds): the hop of the loaves is the only action Joe's shot has
  besides a nod and a blink; the steam doubles the reference's own wisps; the end card holds
  for 1.5 s with little moving; no sound yet.

## Round 3 (user) · «The animation doesn't convince me»

> The animation doesn't convince me.

The limited animation by pieces (loaves hopping, a head nodding, a cat's head turning on a
pivot, all over held drawings with their holes filled in) reads as a cut-out puppet, not as
animation: the lesson of pier-pressure again («a still drawing moved is not animation»).
Characters move by drawings. With no drawings of Joe and the cat beyond the two panels, the
choice of where new drawings come from goes back to the user at this first rejection, as
**new-style** asks.

The user chose **no acting characters** (over generated key poses, their own drawings, or
poses redrawn in code). Animatic v2:

- Joe and the cat are held exactly as printed: the character pieces are gone from the
  separation, so no inpainted holes either.
- What carries the motion now: the plates landing and lifting, the camera over the page,
  «Fresh!» brushed on with a sweeping edge, the starbursts, the fire breathing (an orange
  screen swelling over the oven's mouth), live steam, the night's windows going dark and its
  stars coming out, period call-outs (a paper tag with a hand-lettered name and an arrow that
  draws itself: «Joe · up since 4 a.m.», «Whiskers · head taster»), a ribbon «Golden crust!»,
  the price badge spinning in like a coin, and the end card.
- The cat's gag is told with print, not acting: its tag names it the head taster, and on the
  end card ink paw prints walk in from the left edge to the loaf before the bite.
- A tag measured its width before setting the letter-spacing of its second line, and the
  text ran over its border: measure with the spacing the line is set in.
