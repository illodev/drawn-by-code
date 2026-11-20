---
name: style-souvenir
description: Souvenir style, in testing: a place told through its painted emblems, in the manner of tattoo flash, cigar-box and fruit-crate labels and holiday postcards — opaque paint modelled with light (pieces with a dark contour and airbrushed shade, still lifes in brush strokes with no line), packed with small true things (coins, relics, labels, creatures) on a painted ground, lettering on ribbons — as nested pictures that a camera dives through, each inside a hole of the one before (depth of field, an open-shutter smear, a mist filter, lifted blacks). Use it for emblems, allegories of a place, its history or its culture, «kitsch», painted labels, studio idents, an «infinite zoom» through paintings, anything «packed with detail», or when working with styles/souvenir/.
---

# Style · Souvenir

Reference in progress: `sandbox/2026-11-19-souvenir-test/` (review/sheet.jpg): «Recuerdo de
Andalucía», the emblem and the dive through the guitar's mouth into the lemon tree. Not yet
approved by the user: the style is **in testing**.

A souvenir film is a stack of paintings. Nothing in a painting moves: it is painted once,
in layers at different depths, and the only actor is the camera, which goes through a hole
in one picture into the next. What reads as «painted» is that every piece is modelled with
light; what reads as «filmed» is that near things smear and blur and the lights glow.

## Code

`styles/souvenir/souvenir.js` → `Souvenir` (here `S`).

**The brush manner (no line): `S.form(o)` → `{ canvas, box }`**, then `S.put(g, sprite, { x,
y, rot, s })`. One piece painted per pixel as a lit volume, once, cached by the caller:

- `mask(g)` fills the silhouette; `inflate: 'round'` (default) blows a balloon over it
  (exactly a sphere over a circle, an ellipsoid over an ellipse, no creases), `'bevel'`
  raises a rim `R` wide, `'none'` leaves the surface to `height(x, y)` (a folded leaf).
- `ramp: [[tone, hex], …]` from dark to light (tone 0.5 is the terminator), `soft` 0.85–0.95.
- `light: S.lightFor(rot)` for a sprite that will be pasted turned by `rot`: the light stays
  at the top left however the piece is turned (snap `rot` to a few steps and cache each).
- `marks(g)`: brush strokes in greys on mid-grey (`S.dab`), read back as lighter and darker
  tones **of the ramp**; `stroke` streaks that follow the form (or `stroke.field` for a
  grain of its own: a leaf's veins); `mottle`; `spec` a sheen whose edge the streaks break;
  `edge` a brushed, broken outline; `tint(x, y, tone, rgb, m)` the last word (bounce light,
  a green tip); `over(g)` details clipped to the piece.
- `S.cast(g, drawFn, { blur, dx, dy, color })`: only the shadow of what `drawFn` paints, and
  only on paint already there: how a leaf shades the fruit under it.

**The emblem manner (contour + airbrush): `S.piece(g, pts, { fill, shade, light, detail,
line, ink, heavy, cast })`.** `shade`/`light` are airbrushed in from the shadow and the lit
side (`S.spray`), `line` is the contour (blue-black `S.INK`, heavier on the shadow side),
`cast` its shadow on the pieces under it. `S.ink` a brush-pen line; `S.textOn` lettering
along a curve; `S.tooth(g, box)` the board's grain, last, on each layer.

**The dive: `S.rig(env, layers)`** with `layers: [{ id, z, box, paint(g, res), hole? }]`. A
layer `D` (1000) away from the camera is drawn at its painted size, origin at the frame's
centre; nearer ones grow as `D / distance`. `rig.draw(g, t, camAt, { bg })` with
`camAt(t) → { z, focus, aperture, roll }`: blur = aperture × |scale of the layer − scale of
the focus plane|, and the frame is an open shutter (several instants averaged, as many as
the sharpest moving thing needs; a layer that still jumps between two of them is softened
by that step, on its own). Every layer is kept as a pyramid of halves and drawn from the
level nearest its size on screen; blur is done on a reduced copy that sits on a fixed grid.
The film's camera is `{ z: START + SPEED * t, focus: z + FOCUS }`: one pace, on the axis.
`S.track(keys, t)` joins keys with a monotone cubic, for the rare value that does change. `S.finish(ctx, env, frame, { mist, lift, vignette,
grain })` in the scene's `post`.

**For volumes and many-part things** (lifted from the first film's painters):

- `S.sheet(box, res, paint)` → `{ canvas, box }`: a thing painted on its own sheet, so its
  casts and its holes stay its own. Every object of the first film is one.
- `S.sprayIn(sprite, res, { color, alpha, w, dir })`: the airbrush in from a sprite's own
  alpha edges, holes included; `S.stamp(g, sprite, { lw, heavy, cast })`: its ink contour,
  heavier towards the shadow. Together they bring a lit `form` volume back to the emblem
  manner. Airbrush first, stamp after.
- `S.reliefField(box, res, paint, blur)` → `height(x, y)`: a relief painted as greys with
  canvas strokes and lit by `form` (`inflate: 'none'`): coins, chased metal, filigree, carving.
- `S.frame(x, y, rot, s, flip)`: turn and mirror the geometry, never the canvas (`f.pts`,
  `f.dir`, `f.sub`), so the light stays at the top left.
- `S.brushwork(canvas, { amp, len, drift, warm, slant, wander })`: the hand in the paint:
  strokes that follow a finished layer's own forms and a slow drift of the mix. The rig
  lays it on every layer unless the layer says `brush: false` (the brush manner has its own).

Each picture is a file returning its layers (`tableaux/emblem.js`, `tableaux/lemons.js` in
the test); each group of things is a file with one global. The first film's files are the
library of this style, to read before painting anything like them:

| File · global | What it holds, and the trick worth taking |
|---|---|
| `things/guitar.js` · `Guitar` | marquetry (every tile its tone and two facets), wood grain, a bridge with tied strings |
| `things/fan.js` · `Fan` | a miniature painted in «band space» and bent along an arc; tulle lace; pierced fretwork (`pierced`) |
| `things/shawl.js` · `Shawl` | satin stitch thread by thread (tone from each thread's angle to the light); a packed layout by occupancy grid |
| `things/garland.js` · `Garland` | petals as fans projected from 3D, in nested tiers; leaves with a lit and a dark half (`blade`) |
| `things/sky.js`, `things/fauna.js` · `Sky`, `Fauna` | feathers one by one under one shared contour (`outlined`); creatures in both manners (`line: false`); water painted on what is under it (`Fauna.drop`) |
| `things/ribbon.js` · `Ribbon` | cloth as one strip drawn from a plan; lettering fitted on a curve |
| `things/coins.js` · `Coins` | struck reliefs from layered height fields; a stroke font; script as texture |
| `things/relics.js`, `things/heirlooms.js` · `Relics`, `Heirlooms` | patina per pixel; cloisonné, tesserae and cut tile (a tone and two arrises per piece); exact interlace |
| `things/charms.js`, `things/wares.js`, `things/library.js`, `things/papers.js`, `things/devotion.js` | rope and tassels, glass, tortoiseshell, books as boxes with affine faces, letterpress with its wear, flame and smoke laid on the layer after the object |
| `things/citrus.js` · `Citrus` | the brush manner whole: fruit at every age, eight kinds of leaf with blemishes, wood as a lit tube, blossom at every stage |

## Style rules

- **One manner per picture, and one dominant hue family.** The emblem: indigo night, pieces
  with contour and airbrush. The still life: greens and one fruit colour, brush, no line.
  The reference this style comes from changes manner at every picture; that change is half
  of its charm.
- **Packed, and worked at every pixel.** The user's bar: «packed with details, and very
  worked at the level of every pixel». Any 300 × 300 px of the 1920 frame holds at least
  eight distinct drawn things, and at 4× there is still drawing there (hairlines of 1–1.5
  units, stipple, hatching, grain, wear). **Repetition is not detail:** fourteen identical
  pleats, a row of identical scallops, a tiled motif read as a pattern fill; whatever
  repeats varies (size, turn, tone, one missing, one mended) and carries drawing of its own.
  The ground is never empty: it is painted (a shawl's embroidery, foliage), close in tone,
  behind.
- **Things to find.** Small true details that reward a second look (a fly on a label, a
  stapled crack, a maker's mark, an ant on a branch), and references in layers: some read
  at once, some only by who knows. Write each one down in the brief as «read at once / the
  deep one».
- **True to the thing.** A relic follows a real, documented type; its painter writes the
  anatomy and ten true details at the top of the file before painting, and reports what
  was from memory. Those licences go into the experiment's review.md. Sacred or foreign
  script is never imitated on an object of devotion (leave the band plain); on coins and
  instruments it is a texture of strokes, flagged for a reader of that script to check.
- **No piece is flat.** Emblem manner: local colour, a darker and cooler tone sprayed in
  from the shadow side and from under whatever overlaps, a warmer light on the lit side, a
  small clean highlight. Brush manner: a ramp with a real form shadow (a third of every
  round form is in shade: the house light rakes, `S.LIGHT`), bounce light in the shadow's
  rim, strokes that follow the form.
- **The light is at the top left, for everything**, including pieces pasted turned.
- **Contours are blue-black, 2–3 units, never hairlines, never pure black.** The brush
  manner has none: its edges are broken by the last stroke (`edge`).
- **Every piece shades the one under it** (`cast`), or a pile of pieces reads as stickers.
- **A picture has four or five depths:** a plate that closes it (opaque, bigger than the
  frame, with the hole to the next picture), a far layer stepped back in the air (a veil of
  the picture's own colour on the paint only), the main layer, a near layer that leaves
  the frame blurred, and whatever the camera brushes past (strings, a twig).
- **A bright picture is bright in its depths too.** The lemon tree's far layers started
  near black and the frame's median luminance was 0.33 against the reference's 0.50: deep
  in a sunny tree is green light, not darkness. Measure the frame (luminance at 5/50/95 %,
  median saturation) against the mood wanted before painting more.
- **A picture is a passage, not a poster.** The user, of a packed emblem the camera pushed
  in on: «it shows that there are a lot of symbols and they have been put there scattered
  all over the paper… it is not a poster that the camera approaches, it is overlap after
  overlap». The things of a picture are spread along the axis in strata hundreds of units
  apart (680 in the first film), each of three sheets a little apart, each with a body (a
  mass of flowers or foliage round the way through) and with its pieces large, lying on one
  another, the near ones cut by the frame. Every layer has `far`, so it comes out of the
  dark as the camera nears it: never everything at once. The last stratum (the emblem
  proper) is seen small at the end of the tunnel from early on: it is where the passage
  goes. Loose objects floating in depth are the same scatter with haze on it.
- **The order of the strata means something** (in the first film depth is time and light:
  from a candle in the dark, through the peoples who passed, to the guitar and out into
  day), and **the entrance belongs to the subject**: the film fades up on something of
  its own world, already going in. No device borrowed from the reference (its star, its
  whip-in were rejected: «it says nothing to me»).
- **One pace from the first frame to the last, on the axis.** The user, of a camera that
  eased in, settled on the guitar, rose to frame it and sped into its mouth: «the camera
  should have the same rhythm all the time… it should not pause on reaching the guitar,
  nor go up to get into the guitar». The depth is a straight line in time (432 units a
  second in the first film: a stratum every second and a half), `x`, `y` and roll stay at
  zero, and the lens is focused a fixed distance ahead for the whole film (1000: a thing
  is sharp when it is at the size it was painted for). So every layer's blur depends only
  on how far it is, the same for all: nothing racks, nothing breathes. No picture is held:
  the emblem is one more stratum, in focus for less than a second like the rest, and the
  film ends with the camera still going in (a short fade back into the night). What a
  picture needs in order to be read is put in the painting (larger, on the axis, lit),
  never bought with a slower camera. A small aperture: with strata this close a wide one
  leaves everything soft.
- **A packed picture is composed by its framings.** Work out what the first, widest
  framing shows of each layer and place every piece whole inside it; the push then
  carries the edges out and leads the eye to the hole. Nothing lies on what must be read
  (castanets on a poster's headline); what hangs across (lanterns, bunting) goes behind;
  the centre is brighter and more saturated than the ring round it (a veil of the
  ground's colour on the ring, on the paint only).
- **Contrast between pictures is the film's structure:** dark against light, mystical
  against plain day, abstract against realistic; one fan at dusk and one at noon.
- **The grade lifts the blacks** (`lift` screens a dark violet-grey over the frame) and a
  mist filter spreads the lights; nothing clips. Tooth on every layer, grain on the frame.
- **The hole is on the axis** (the layer's origin) and is cut through every layer of the
  picture behind it; what is seen through it from afar is the next picture, small, out of
  focus and glowing: a promise.
- **Lettering is painted** (on a ribbon, a label, a seal), in the film's language, set on
  the curve of what carries it.
- Forbidden: flat vector fills, plain two-stop gradients across a whole object, geometric
  primitives left visible, hairline outlines, pure black/white/red, anything that moves
  inside a painting, a cut (the film is one dive), someone else's logo or characters.

## Detail

- **Emblem pieces that are volumes** (a key, an olive, a pomegranate): a lit `form` sprite
  alone reads as 3D clay. Spray shade and light in from its edges and give it the ink
  contour: that brings it back to the emblem manner.
- **Many small pieces** (a wing's feathers, a rosette's tiles): one heavy contour shared by
  the group and inner lines of about 1 unit; a full contour on each of sixty feathers turns
  the wing into all line. A feather reads from three things: the shadow of the one over
  it, a broad light from its free edge, a thin gleam where that edge faces the light.
  Marquetry reads when every tile has its own tone and a lit and a shaded facet on a dark
  ground. Size the motif for film size, and drop what is under about 6 units: it reads as dirt.
- **Dark things on a dark ground** (a blue-black bird, castanets, the shadow side of a key
  on the night): the contour is not enough. Push the lit side fully to its sheen, lay a
  thin warm light on the lit edge or a reflected light at the shadow edge, and use an ink
  darker than the kit's for blue-black pieces.
- **Made by hand:** an outline built analytically (count its curvature sign changes: a
  waist through spline points wobbled), then a seeded imperfection: eased corners, a unit
  of jitter, one branch wider than the other. Perfect rectangles and symmetry read as vector.
- **Joins:** a part that grows from another (teeth from a calyx tube) has no contour and no
  hard edge at its root; a thin part narrower than twice the contour paints as a black tick
  (widen it or start it under what it grows from); a cord entering a hole shows a dark
  crescent of the bore.
- **Cloth and lettering:** a ribbon is one strip drawn from a plan (split into faces where
  it turns back, painted far to near, tone from which way each stretch faces the light),
  with a hem that shows its thickness. Measure the font before promising a letter height:
  wide old-style capitals need about 12 em of line at half the face's height.
- **Flowers:** tiers of petals as nested funnels (inner ones shorter and more upright), each
  petal lit by its own facing plus the whole head as a dome under the same lamp. White is
  shaded lighter than expected (a lilac-grey at about 60 %), or the flower reads lavender.
- **Highlights:** on metal or enamel a thin tapered light reads as a scratch; a short fat
  streak with a dash under it reads as gloss. The bounce light in a shadow stays in the
  very rim, or it lifts the whole form shadow and the sphere goes flat.

- A piece of fruit: its real outline (a lemon has a nipple on a slight neck and a collar
  under the calyx: it is a profile of revolution, not an ellipse with bumps), the calyx and
  a stub of stalk as their own pieces over it, shallow pores, a form shadow, bounce light,
  strokes about the point nearest the light.
- A leaf: a trough (its halves rise from the midrib, so one takes the light), a margin
  that waves, a midrib with its own shade, veins as quiet hairlines, a gloss that only
  some leaves have, three lights (in the sun, in open shade, deep in the tree), every leaf
  pasted at its own attitude (turned, tipped: `fx`/`fy`), a broken painted edge.
- Leaves grow from a twig, alternately, never all from one point; fruit hangs from the
  twig by its stalk; blossom sits on pedicels at the tip.
- An emblem piece made of repeated parts (a fan's pleats, feathers, petals): each part its
  own piece with a face in the light and one in shade, what is painted on it running
  across the parts, then the folds' shade laid over the paint.

## Style checklist

- [ ] Density: eight drawn things in any 300 × 300 px; drawing still there at 4×; nothing that repeats is identical.
- [ ] Every piece has modelling (crop it at 2×: no flat fill, no bare gradient).
- [ ] Every reference is true to its source, and what was from memory is written down.
- [ ] Every piece whole in the widest framing; nothing lying on lettering; what must be read, reads.
- [ ] Light from the top left on every piece, turned ones included.
- [ ] Contours with weight in the emblem manner; none, and broken edges, in the brush manner.
- [ ] Overlaps cast shadows.
- [ ] Each picture: one manner, one hue family, a plate, a far, a main and a near layer.
- [ ] The frame's luminance and saturation measured against the mood (bright pictures ≈ 0.45–0.5 median).
- [ ] It is a passage: at any instant a near stratum leaving (cut by the frame, soft), one being read, the next through its middle, and the goal small at the end.
- [ ] Nothing that is hidden behind a nearer layer shows before that layer has faded in (a far picture's plate as a rectangle in the night).
- [ ] The hole is on the axis and cut clean through (fill opaque before `destination-out`).
- [ ] The camera's depth is linear in time, `x`, `y` and roll are zero, focus is a fixed distance ahead: no ease, no hold, no rack.
- [ ] Tangents and overlaps: nothing in front crosses a thing it has nothing to do with (a wing over a moon, a wing over a fruit); what is held touches what holds it (crop the contact).
- [ ] Rendered and watched moving, and six consecutive frames of a corner tiled side by side at 1:1: each blur grows by a hair from one frame to the next, no frame is suddenly softer or streaked, no ghosts, nothing pops on.

## Lessons

- 2026-11-19 · souvenir-test · A distance field has a crease along every ridge and light finds it (a lemon came out faceted): inflate a silhouette by solving ∇²u = −1 inside it and taking √(4u), coarse to fine.
- 2026-11-19 · souvenir-test · Brush strokes laid over a lit form as translucent colour flatten it. Paint them in greys on mid-grey and read them back as tone before the ramp (`marks`).
- 2026-11-19 · souvenir-test · A hole cut with `destination-out` takes the alpha of the current `fillStyle`: set an opaque fill before cutting, or the next picture shows veiled.
- 2026-11-19 · souvenir-test · Anything that must register with a thing on another layer (knots on a bridge, a key in a bill) belongs to that thing's layer, or is placed by reading the contact off a render (pixel → logical → the layer's units) and cropping it at 1:1.
- 2026-11-19 · souvenir-test · A fast zoom needs more than averaged instants: twelve exposures of a whip-in read as twelve ghosts. (The first cure, smearing the whole sum along the zoom, was wrong: see round 4.)
- 2026-11-19 · souvenir-test round 2 · «Packed with details, worked at every pixel»: the first assembly was clean pieces on a quiet ground. What closed the gap, in order of effect: the ground painted (a shawl of eleven thousand motifs), the largest pieces given a subject of their own (a landscape on each fan), a ring of small true things round the emblem, a string of coins, then brushwork inside every fill.
- 2026-11-19 · souvenir-test round 2 · Relief (coins, chased bronze, filigree) is layers of greys blurred as float fields and lit by `form`; colouring the types by height turns them into stickers: keep the patina on everything, rub only the top of the relief, and add (blurred height − height) to the tone.
- 2026-11-19 · souvenir-test round 2 · Before painting on something half hidden (a fan behind a guitar), paint a numbered map over it in the real picture and compose in the gaps: the first landscapes put both monuments behind the olive.
- 2026-11-19 · souvenir-test round 2 · Cost: a `ctx.filter` blur on each of hundreds of marks costs seconds; draw the group on a sheet and blur once. Layers the lens will blur are painted at a fraction of the size (`res`). Painting in `setup` holds the page's load event (the renderer gives up past 30 s): paint on the first frame, as the rig does.
- 2026-11-19 · souvenir-test round 2 · `S.spray` floods everything outside its polygon inside the current clip: clip to that polygon first. `S.piece` takes `{ from, to, stops }`, not a `CanvasGradient`. `form`'s `tint` runs after `spec`: a tint that replaces colour kills the sheen.
- 2026-11-19 · souvenir-test round 2 · Strokes that imitate a script read as letters as soon as two cross: for a texture of script use strokes that spring from one foot, tails under the line and a drawn-out baseline, and still have a reader of that script look. On objects of devotion, leave the band plain.
- 2026-11-19 · souvenir-test round 4 · «The blurs flicker and are not well made.» Three causes, all of them a quantity that jumped between frames: (1) a smear of the whole frame along the zoom, sized by the nearest layer and switched on past a threshold, so the things in focus were streaked on some frames and not on others; (2) the blur's working copy halved at thresholds and was drawn straight from the full-size painting, point-sampled, so the paint's grain came through as combs that changed every frame; (3) the number of exposures followed the fastest layer. Now: each layer softened only by its own step between exposures, a pyramid of halves under every layer, the blur always 3–6 px of a copy on a fixed grid, and the exposures counted against each layer's own blur. Test for it with consecutive frames side by side, not with stills seconds apart.
- 2026-11-19 · souvenir-test round 4 · A camera with keys has a rhythm of its own (it slows into each key) and a focus with keys breathes. A dive is `z = start + speed × t` and `focus = z + constant`; anything else is a decision to justify to the user first.
- 2026-11-19 · souvenir-test round 5 · A picture is painted on a bench, not in the film: the film's camera through that one picture, a plate of the colour and hole of the picture before, a glow for the one after (`dev/picture/scene.js`). Seven painters worked at once this way and the pictures chained at the first try.
- 2026-11-19 · souvenir-test round 5 · A sheet is only ever seen through the openings of the bodies in front of it: at focus, through an opening of half-width r in a body Δ in front, about r × 1000 / (1000 − Δ) of it shows. Work that window out for every sheet before composing (a two-second script over camera positions), put what must be read inside it, and keep the rest for blur. The first moons, labels and bridges of three painters sat where the camera never looks.
- 2026-11-19 · souvenir-test round 5 · Something meant to be seen whole at one instant from pieces at several depths (a guitar in planes, a ladder that runs through four strata) is drawn on rays from the axis: each piece scaled by (its depth − the camera's) / 1000 for that instant.
- 2026-11-19 · souvenir-test round 5 · A hole shows whatever is behind it at that moment. Fade a whole picture in, its plate too, together with the plate it is seen through (`behind` in the film's scene), time the picture after it on the distance that plate would have kept on its own (one picture ahead, never the whole chain), and if the way out is «light», fill the gap with a few thin veils of it: one veil pops as the camera crosses it, five clear little by little.
- 2026-11-19 · souvenir-test round 5 · The last image cannot be held by a camera that never slows: put it far and paint it large (the moon 4.8 times farther and larger, `blur` near zero). A far thing keeps its size while the near strata rush by, as a moon does, and then gives seconds of slow growth for the signature.
- 2026-11-19 · souvenir-test round 5 · Thousands of repeated pieces (tesserae, tiles, muqarnas cells, hammer dents) are painted per pixel: colours and heights on sheets, each piece's tone, tilt and wear from a hash of its index, then ONE lighting pass. Light a picture last, as a pass per layer over finished paint (a dawn line, a fire as a point light with falloff): walls, pots and plants then share one sun. The grade lifts blacks: paint the dark at 0.1–0.2 with a directional ambient, or the forms vanish.

