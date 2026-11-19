---
name: style-souvenir
description: Souvenir style, in testing: a place told through its painted emblems, in the manner of tattoo flash, cigar-box and fruit-crate labels and holiday postcards — opaque paint modelled with light (pieces with a dark contour and airbrushed shade, still lifes in brush strokes with no line), gold, ribbons with lettering — as nested pictures that a camera dives through, each inside a hole of the one before (depth of field, an open-shutter smear, a mist filter, lifted blacks). Use it for emblems, allegories of a place or a culture, «kitsch», painted labels, studio idents, an «infinite zoom» through paintings, or when working with styles/souvenir/.
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
the motion needs, then smeared along the zoom). `S.track(keys, t)` joins camera keys with a
monotone cubic (it never backs up). `S.finish(ctx, env, frame, { mist, lift, vignette,
grain })` in the scene's `post`.

Each picture is a file returning its layers (`tableaux/emblem.js`, `tableaux/lemons.js` in
the test); each group of things is a file with one global (`things/*.js`).

## Style rules

- **One manner per picture, and one dominant hue family.** The emblem: indigo night, pieces
  with contour and airbrush. The still life: greens and one fruit colour, brush, no line.
  The reference this style comes from changes manner at every picture; that change is half
  of its charm.
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
- **The grade lifts the blacks** (`lift` screens a dark violet-grey over the frame) and a
  mist filter spreads the lights; nothing clips. Tooth on every layer, grain on the frame.
- **The camera never stops and never backs up:** arrive decelerating, push slowly (the
  picture grows a few per cent a second), accelerate into the hole. Focus stays on the
  picture until the camera reaches it, then racks to the next.
- **The hole is on the axis** (the layer's origin) and is cut through every layer of the
  picture behind it; what is seen through it from afar is the next picture, small, out of
  focus and glowing: a promise.
- **Lettering is painted** (on a ribbon, a label, a seal), in the film's language, set on
  the curve of what carries it.
- Forbidden: flat vector fills, plain two-stop gradients across a whole object, geometric
  primitives left visible, hairline outlines, pure black/white/red, anything that moves
  inside a painting, a cut (the film is one dive), someone else's logo or characters.

## Detail

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

- [ ] Every piece has modelling (crop it at 2×: no flat fill, no bare gradient).
- [ ] Light from the top left on every piece, turned ones included.
- [ ] Contours with weight in the emblem manner; none, and broken edges, in the brush manner.
- [ ] Overlaps cast shadows.
- [ ] Each picture: one manner, one hue family, a plate, a far, a main and a near layer.
- [ ] The frame's luminance and saturation measured against the mood (bright pictures ≈ 0.45–0.5 median).
- [ ] The hole is on the axis and cut clean through (fill opaque before `destination-out`).
- [ ] The camera's track is monotone; focus racks only when the camera reaches the hole.
- [ ] Rendered and watched moving: the smear has no separate ghosts, nothing pops on.

## Lessons

- 2026-11-19 · souvenir-test · A distance field has a crease along every ridge and light finds it (a lemon came out faceted): inflate a silhouette by solving ∇²u = −1 inside it and taking √(4u), coarse to fine: exact spheres and ellipsoids, smooth swellings for anything else.
- 2026-11-19 · souvenir-test · Brush strokes laid over a lit form as translucent colour flatten it (pale strokes lifted the shadows, the form shadow vanished). Paint the strokes in greys on mid-grey and read them back as tone before the ramp: a stroke is then a colour of the palette, lighter or darker, and the modelling survives.
- 2026-11-19 · souvenir-test · A hole cut with `destination-out` takes the alpha of the current `fillStyle`: after a painter that left a translucent fill, the hole was 30 % cut and the next picture showed veiled in the night's colour. Set an opaque fill before cutting.
- 2026-11-19 · souvenir-test · Texture tiles pasted one by one leave seams (a line across the plate): lay them as a repeating pattern in pixels.
- 2026-11-19 · souvenir-test · A fast zoom needs more than averaged instants: twelve exposures of a whip-in read as twelve ghosts. After averaging, smear the sum along the zoom by the gap between two instants.
