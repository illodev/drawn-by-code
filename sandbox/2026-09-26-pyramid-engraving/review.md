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

## Round 5 · the first full render, seen moving (local GPU)

The first render of the whole film (local, `--gpu`). The user, having worked in the cloud
without seeing it move:

> «Para empezar el filtro lo quitaría, creía que se vería a nivel de texturas y no de
> pantalla y queda raro. Lo siguiente son las transiciones, dan saltos, creía que serían
> transiciones naturales.»

What that meant, and what changed:

- **The filter.** The aged-print pass laid its grain, charcoal strokes, toning patches and a
  darker rim in screen space, over the finished frame: still, it read as paper; moving, as a
  dirty lens the world slides behind. Now nothing is fixed to the screen. The tooth and the
  strokes are each surface's own texture (`charcoalAt()`: triplanar in the piece's space, two
  octaves cross-faded so the grain keeps its size on screen), the sky's in its directions;
  the ager only downsamples and maps to the plates' colour; the sheet's toning and foxing
  live on the printed plate's margins, which grow with it. Room dust in the light is a light
  tone, not paper white (it read as snow on the dark walls).
- **The transitions.** Every change of room was a cut through a fade to dark. Now every
  room is joined to the next by an opening in the shot, a portal (`junctions.js`,
  `Engrave.portal`, material 7 holes, `R.mask`), and the camera flies through it without a
  cut, its speed matched across:
  1. heart → gallery: the machine's middle ring leaves the axis, stands up as a gate, and the
     gallery is already seen through it (its entrance ring is the same ring);
  2. gallery → shaft: the exit ring is the shaft's floor ring; the gallery's forward is the
     shaft's up (gravity turns); the structure goes through first, at its speed, and rights
     itself to the shaft's down;
  3. shaft → resonance: the tunnel ends in a membrane (the blue triangle); the hall beyond
     is turned to meet the camera's 90° roll;
  4. resonance → nursery: the middle room's side door opens into the nursery's wall over the
     +z channel; the structure leads through and glides down onto its channel;
  5. into the seed: from the first light the sphere holds the seed's own sky (the galaxy
     forms inside it, the bulge first); the skin parts where the camera goes in;
  6. out of the seed, backwards, through the same gap;
  7. nursery → pyramid: the sphere rises into a shaft in the ceiling that opens onto the
     heart of the pyramid; outside it is the seed, the same skin and the same sky, K7 times
     smaller, and it keeps its sky until it becomes the star.
- Camera: stops that were artefacts of segment-wise easing (the end of the gallery, the
  seed's path, the start of the climb up the pyramid) are gone; a camera scan
  (`tools/geo.mjs`, speed and turn per frame) found them.
- Engine: `--gpu` takes the laptop's NVIDIA card (PRIME offload, ANGLE Vulkan): 0.27 s a
  heavy frame instead of 1.75 s on the Intel.
- Sound: four cues added on the new doorways (the gate, the floor ring, the side door, the
  ceiling shaft).
- Seen once the screen grain was gone, and fixed: hard-edged rectangles on the dunes (value
  noise jumped at its lattice lines on the NVIDIA card: integer lattice hash, `highp int`),
  whorls in the sky (the stroke angle wandered continuously: patches of straight strokes
  blended), square flecks of sand on the flagstones (round, jittered grains), a straight
  crease in the dunes behind the pyramid (a rounded-square footprint and an uneven drift at
  its foot), far dune crests drawn as straight edges (a finer far mesh), a darker dusk at the
  end so the new star reads; room motes toned down further.

### Round 5 (user)

> «[De 3 s a 4 s] la cámara hace un zigzag raro. El torbellino ese lo quitaría también, queda
> fatal. Cuando aparece el símbolo las losas se vuelven más claras. Hay transiciones que
> tiemblan un poco y hacen zigzags raros, hay que suavizar. En general me hace falta que se
> vea mucho más dibujado a mano, como si estuviera dibujado con lápiz y carboncillo, que era
> la idea original. Que se note poco que es un render 3D.»
> «Aparte todo debería tener más ese color desgastado que tienen los aros, como más papel
> viejo.»

What changed:

- Camera: key paths are monotone Hermites (central-difference tangents overshot a key and
  came back: the zigzag at 3–4 s); the opening travelling starts from rest and story time
  speeds up without a kink; every doorway's bridge is two Béziers joined at the opening with
  an even speed profile (the old one trembled where either side's camera turned); the climb
  up the pyramid keeps its up leaning back so the view never flips; the seed's inside path is
  one curve with one stop. `tools/camscan.mjs` scans the camera frame by frame for reversals,
  flips and jumps.
- The dust devil is gone; the stone's mark no longer lights its own face.
- Colour: the plates' gradient map aged to old yellowed paper (the rings' tan in the light
  mid-tones, sepia darks). The user: «bastante mejor a nivel de color».

## Round 6 · drawn, not rendered

> «Me faltan las texturas, que parezca dibujado.» … (on a pencil-hatching pass) «Te has
> pasado de lápiz, pero mucho. La idea es que fuera carboncillo.» … (on the charcoal pass,
> seeing the full render) «Está muy bien.»

- Charcoal on every surface: the tone laid with the side of the stick (broad soft strokes,
  ~16 px rows, each patch its own angle, fixed to the surface and kept at their size on
  screen by octaves), on the paper's tooth (pits stay paper, darks fill in); the sky rubbed.
  Hatching in thin pencil lines read as an engraving or a comic: too much line, not charcoal.
- Contours: a pass over geometry buffers (normal, distance, world position, drawn marks)
  draws every silhouette and fold, and the carving's edges, as a broad soft charcoal line
  that wanders and swells with pressure (noise fixed to the world), lifts here and there,
  doubles where the hand went over it twice, lighter far off.
- The mark: the user asked for the Claude mascot in place of the blue triangles, then «solo
  en el inicio cuando se pinta en la pirámide… que se pinte por líneas en vez de aparecer»:
  on the first stone only, one blue line traced round the figure at an even pace with a
  bright point at its tip, then the eyes (1.8 s); everything else keeps its triangle.
- Cost: the charcoal passes took the full render from ~5 to ~24 minutes on the GTX 1650.
- Automatic review (`review/auto.md`, GPU): no warnings. The still stretches are the plate
  holding at the start and the closing plate; the «large jumps» at 28.5–28.8 s are the
  shaft's roll turning the camera over dense masonry, watched and approved in the film.
- Published: `render/pyramid-engraving.mp4` (crf 26), `render/strip.jpg`,
  `render/pyramid-engraving.gif` (3 MB), the README gallery, `sandbox/INDEX.md`.
