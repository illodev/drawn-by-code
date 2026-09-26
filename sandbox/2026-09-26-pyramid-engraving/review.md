# pyramid-engraving · review log

## Round 0 · style still (PIR-03, 14.5 s)

The user picked the engraving style from references (plates of the «Description de
l'Égypte», Vol. V). First stills: the exploded view full bleed, the same inside a printed
plate, the closed pyramid. Fixed on the way:

- Tiny stones (30 courses) read as punched metal → 18 courses, longer stones.
- Scaling the shells about the axis hid the machine → each face moves out along its normal;
  the near corner opens into a V that shows shells and heart.
- Dense cross-hatching read as perforated metal → deep shadow is heavy parallel lines, the
  crossing set only in the half-dark.
- Ground lines converged like a record → lines along the camera's right, bent by the dunes.
- A shadow slab beyond the map's depth → fragments past the far plane count as lit.
- Rings printed as flat tan ribbons → gold is a wash under dark lines; round meshes hatch
  along or round their axis.
- Closed, the machine stuck out through the stone → it folds small inside and grows with
  the opening.

## Round 1 · motion test 5–17 s (PIR-02, PIR-03)

Timeline in `pyramid.js`: the joint wakes (5.0), the mark lights (5.4), the first stone
moves out (6.0) and presses dust, the neighbours answer upwards and through the shells
(7.0–9), the rings line up concentric behind the slot (9.0), bands part (10), faces move
out (11–13.5), hold (13.5–15.5), the camera leans into the V gap (16–17). Camera: Hermite
path through keys with time-aware tangents (it never stops at a key).

Fixed before rendering the sequence:

- A diagonal band of doubled, moiré lines across big close faces: faded odd lines still
  printed as half-coverage anti-aliasing → a line's coverage scales with its width.
- Blocky shadows in the close-up → the shadow map follows the subject (radius from the
  camera distance; depth range kept long).
- Flat grey smudges along edges (chips drawn at 60 % ink) → cut lines are full ink.
- Dust as tiny hatched cubes → stipple spheres, solid.
- The mark read as a warning sign (a bar in the middle) → an incomplete triangle with a V
  notch in its base.
