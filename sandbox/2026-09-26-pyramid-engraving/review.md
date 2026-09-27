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

## Round 2 · «It still doesn't look like the plates»

The user: «demasiado 3D y no tanto como esto que me enseñaste», and the rings cut through
stones. Three passes of tone and line work did not get there; putting a crop of plate 11
beside our render at the same size did: the plates draw a face as a mosaic of tiny stones,
not ruled lines. Built the masonry mosaic, the slabs (each face opens in panels of many
drawn stones), an aged-print filter measured on the plates (their paper is greyish, not
cream), then — the user's idea — charcoal: «¡Lo has clavado!». Rings are now sized every
frame to the room they turn in.

## Round 3 · the whole film, shot by shot (stills only)

- PIR-01: the plate opens the film and the camera goes into the engraving; the ground after
  plate 11 (dunes everywhere, spoil mounds with a broken crest, no terraces: «demasiado
  artificial»), side sun, shade and dirt on the dunes; signature «illodev x Claude sculp.».
- PIR-04 gallery, PIR-05 gravity shaft, PIR-06 resonance chamber (rooms at 1, 3, 9), PIR-07
  nursery, PIR-08 the sky inside the seed, PIR-09 the stone goes back, PIR-10 one more star
  and the closing plate.
- Interiors after the user's notes: «parecen ladrillos de casa», «los jeroglíficos se notan
  demasiado / son muy simples y repetidos», «las paredes deberían ser lisas… rellenas de
  motivos y secciones», «hace falta mucho detalle, ambientación»: Dendera walls (registers,
  frieze, torus, cornice), 16 invented signs in pairs, five scene compositions, Hathor
  capitals, starred ceilings, furniture and rubble, a finer paper tooth indoors.
- The creature as a sign: the user asked for it («ponerte a ti como jeroglífico»), then
  «demasiado visibles»: now rare in the registers and worn in its cartouche.
- The last shot's ground «no tan currado»: patchy ripples, mottling, a camera over the dunes.

## Round 4 · detail, zone by zone (bench.js, then the whole film)

The user: «trabajaría meticulosamente (lento) en las paredes… que no queden espacios en
blanco… trabajar a más profundidad y zonas más pequeñas». A corner bench (`bench.js`) with a
view per element, each beside a crop of Dendera at the same size:

- Walls: text columns in every gap, figures filling the registers, relief by its bevel,
  banded columns, no mosaic on dressed walls.
- Capital: the creature in the place of Hathor's face («donde has puesto la cara, pondría
  la mascota de Claude»), in a sunk niche inside the shrine, lappets and collar; lotus bell.
- Ceiling: bands of vultures, stars and boats between beams. Floor: flagstones, joints,
  sand, cracks, chips, pebbles («se nota un suelo más viejo»).
- Across the film («aplicar todas estas técnicas… incluso a las vistas exteriores»): the
  limestone up close, engraved rings and rods, dust never a disc, flagstones sized per room.
- The shaft's walkways carried on corbels and struts; loose stones in facets; figures
  rebuilt to the canon.

Still open (next rounds): the seed's close-up tint, the joint's last blue answer and the
capstone's size (fixed in code, to verify in frames), banding in the seed's sky, the cut
from the nursery to the outside.
