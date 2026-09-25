# Reviews · opus5-riso

## Round 1 (auto, by eye): the style test on the lighthouse card

- The riso press built from the reference's inks: plates per ink, halftone screens at
  different angles, multiply overprints, register offsets, starved blotches, grain.
- First print: digital-looking dots and a pink too warm. Pink and blue re-measured, a
  0.9 px ink spread over the whole print: side by side at 2× the dots, the overprints and
  the offset porthole read like the reference.
- Still to match on the card: the haze band's shape, the waves' brush strokes and the
  splashes, the rock's lit edges, the beams' texture.

## Round 2 (auto): the whole film

- 42 cards by six parallel agents (one brief: separations, measured in reference pixels,
  compared side by side and at 2×), merged by file with their helper files (`_g*-util.js`).
  None is at the lighthouse's crop-level finish yet; each agent listed what is still off.
- The choreography: sonar rings (radii measured per drawing), circles opening (the coin
  under the grasshopper), cards full frame on the half and eighth beats, re-inked repeats
  with a white ring, the mosaic (36 circles measured, then blue and scattering), orbits and
  the flower, the pink run (eight cards, the rocket mirrored), the night sky, the title.
- Cards landed one drawing late from 12.5 s: the film cuts every 1/8 s (3 frames), not on
  twos. The shot is now picked from the 24 fps frame; drawings hold from the cut.
- `compare --every 0.5`: 17.1 over the whole film. review.mjs flags flashes (> 3/s at
  12–16 and 23–24 s): that is the original's rhythm, kept in the study.
- Not committed: the reference, its audio, the side-by-side (out/).

## Round 3 · the detail pass (capped by the user)

User: «falta ir al detalle … su imagen tiene como un filtro de ruido que el nuestro no se nota
… nuestra medusa no sale … Los animales les falta detalles. A los círculos les faltan las
ondas … Debería ser regla general.»

Done (on main):
- `engine/detail.mjs`, the detail gate, mandatory before showing anything (CLAUDE.md). Colour
  at a 12 px blur (over a halftone pitch), limits median ≤ 8, p90 ≤ 27, calibrated on the
  approved what-do-you-love replica; texture at 4 px, clean ≤ 6 %, busy ≤ 12 %.
- Press: paper fibres and cloud, no confetti, voids per ink, inks re-measured on the film
  (pink [240,76,183], yellow [255,250,55], blue [58,146,197], navy [32,56,146]).
- Sonar, orbits (call and answer), the orbits' finale with the flower, and the night:
  rebuilt from per-frame measurements. Sonar passes the gate; the orbits pass on colour.
- Edit: shots cut on frame numbers; the re-inked run from 15.0 cuts every 2 frames; the
  repeats have measured ink maps and push-ins (`o.zoom`); the pink run starts at 23.0.
- Cards get `lf` (frame inside the shot) for per-frame camera pushes.
- G2, G3 and G6 first passes merged (hand-set screens on measured lattices, many pieces added).

Still to do (no card passes yet, first-showing medians ≈ 11–25):
- Second passes per group, driven by an element audit (ref | ours at full size, list every
  element, gradient and line missing or flattened, draw each). Notes sent: savanna (glow,
  birds, ragged trees, murmuration haze), hummingbird (lemon glow, speck ghost wings),
  turntable (bigger platter, streaked wedges), sunflower (spiral seeds), wave (curl lines).
- G1 (owl, bell, lighthouse, wolf, koi, grasshopper, jellyfish), G4 (whale … balloons) and
  G5 (cello … chimes) first passes: in their worktree branches, to merge.
- Ink maps of the pink run for whale…lightning (G4) and the frogs/wave/cat repeat zooms.
- Then: gate on the whole film (`--every 1`), render, GIF, strip, INDEX, commit, show.

### Closed (2026-09-25)

User: «Creo que deberíamos ponerle límite al repaso, llevamos horas y tampoco hemos avanzado
mucho y el uso de tokens por mejora se está volviendo carísimo.» The pass stopped there.

Final gate over the film (`--every 0.25`, 112 instants, with the private data): **FAIL on colour
median 9.6** (limit 8; round 2 scored 18); p90 21.7 ✓, too clean 5.3 % ✓, too busy 4.0 % ✓.
66 of 112 instants still over 8. Cards that pass on their own: savanna, whale, cello, volcano,
train, campfire (snowflake and dunes within a point). Worst left: the 14–16 s repeats, the
mosaic cells (miniatures in the reference, not scaled cards), bicycle, waterfall, sunflower.

The committed film is the described version: cards read their grids and traces from
`private/<card>-data.js` (gitignored); without them they draw from committed, described
tones and shapes, and score a few points worse. Earlier commits in this round still carry
some scan tables in the git history (G5's first commits and others moved later).

User: «Lo doy por bueno.» Approved at this state; no round cap added to CLAUDE.md, git history left as is.
