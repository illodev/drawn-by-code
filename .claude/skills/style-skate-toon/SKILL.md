---
name: style-skate-toon
description: Skate toon style, in testing: the look of a late-'90s extreme-sports TV cartoon. A thin, even, hand-held black line, flat saturated colour with no shading under a yellow sky, kids with huge heads of their own silhouette, goggle eyes, wide mouths with real teeth, clothes far too big hanging off stick limbs, chunky boots, fat-fingered hands, and sets in crooked perspective with loose tick marks. Use it for '90s cartoon, Nicktoon-like, skate/surf/BMX kids, fake show intros, or when working with styles/skate-toon/.
---

# Style · Skate toon

**In testing.** Key art: `sandbox/2026-11-14-pier-pressure/review/key.jpg` (the cast of an
imaginary show, «Pier Pressure», on its set); model sheet `…/review/cast.jpg`; hand chart
`…/dev/handcheck/hands.png`; a whole set drawn with the kit: `…/set.js`. The look was
measured on five frames of the genre the user gave; characters and places are always our own
(never a show's cast, logo or town).

## Code

`styles/skate-toon/toon.js` → `SkateToon` (line, shapes, sets, hands) and
`styles/skate-toon/kid.js` → `SkateKid` (the figure). Load them in that order. Fonts: Bangers
for hand lettering (`fonts/Bangers-Regular.ttf`).

- **Time:** `onTwos(t, t0)`, `drawing(t, t0)` (12 drawings a second; give each hit its own `t0`).
- **Paths:** control points are `[x, y]` (smooth) or `[x, y, 1]` (a corner). `path(pts, closed)`
  makes the dense line; `ribbon(pts, w0, w1, { mid, wave, tip })` a band of varying width (a
  limb, a sleeve, a lock); `ellipse`, `capsule`.
- **Line and fill:** `line(g, pts, { w, seed, color, closed, taper })`, `shape(g, pts, { fill,
  w, seed, inside(g) })` (returns its outline; `inside` paints clipped: prints, stripes),
  `skin(g, parts, { fill })` (several pieces, one silhouette: tubes `{ tube, d }` or polygons).
  Every call takes `w` in local units: under `g.scale(s)` pass `LINE / s`.
- **Sets:** `slab(g, quad, { fill, over })` (each edge ruled by hand, corners overshoot),
  `ticks(g, poly, { n, dir, len, pair })` (the only texture), `pane(g, quad)` (glass with
  gleams), `palm(g, x, y, h, { lean, sway })`, `sign(g, text, x, y, { size, fill, drop })`.
- **Hands:** `hand(g, pose, size, { side, back, fill, arm })`: `open`, `relaxed`, `fist`,
  `thumb`, `point`. Drawn as a right hand seen from the palm, wrist at the origin, fingers up;
  `side: 'L'` mirrors, `back` mirrors again.
- **Figure:** `SkateKid.draw(g, spec, pose, x, y, s)`. A spec gives sizes (`leg`, `torso`,
  `shoulder`…), the head's outline, `eye`, `nose`, `mouth`, `ear`, `top`, `bottom`, `shoes`,
  `socks`, and hooks drawn at their depth: `behind`, `hairBack`, `underFace`, `face`,
  `hairFront` (head's frame), `over` (on the shirt), `front`. A pose gives `hip`, `turn`
  (the body in three quarters), `lean`, `tilt`, `feet` (each with `{ scale, view: 'sole',
  flip }` for a boot kicked at the camera), `arms` (two angles each), `hands`, `handScale`,
  `armFront` (`true`, or `'fore'` for a fist on a hip), `head { tilt, turn }` (a real
  three-quarter head; give the spec's head a `pts34` outline), `face { look, lid, blink, brow,
  mouth }`. The head's frame always faces right (a head turned left is mirrored), so hooks
  draw for `H.turn` 0..1 and `H.fx`; `Cast.turned(pts, H.turn)` carries a cap of hair or a
  helmet round the skull. Mouths:
  `smile grin open yell ooh flat frown smirk`. See the header of `kid.js` and any file in
  `sandbox/2026-11-14-pier-pressure/cast/`.

## Style rules

- **Palette** (`SkateToon.COL`, measured): sky `#ffe36d`, sea `#027da1`, sand `#e2c196`, road
  `#3e7999`, concrete `#ccdcd4`, wood `#ad923b`/`#665002`, palm `#3f5a26`, skins `#fcb950`,
  `#fcdcc4`, `#cf8440`, mouth `#7b1f2a`, magenta `#eb008b`, blue `#4c8ccc`, maroon `#a70531`,
  ink `#120c0e`. The sky is always that flat yellow. No gradients, no shadows, no shading.
- **Line:** black, 3 units in a 1600-wide frame for figures, 2.2 for sets; **folds, teeth,
  creases and lashes are drawn almost as heavy as the contour** (2.5). It wanders a little and
  swells by a tenth, never more: this is a marker held by hand, not a brush. The same weight
  at every size: a figure far away keeps its line.
- **The figure** (a kid is 100 units): head 34–38 high and 45–57 wide, each with its own
  silhouette (a bean, a bun, a tall egg, a jaw); the shirt hangs from the shoulders and is
  **two thirds of the head's width** at its hem, which sags and ripples; flap sleeves far
  wider than the arm; shorts like a box to the knee, hems with a band; thin limbs with a soft
  bend at the joint, a little thicker at the root; boots a quarter of the height long, with a
  round toe box, a tongue, lace bars, a thick sole with a coloured welt and a tread.
- **Faces:** two white ovals touching, of different sizes, with dot pupils; three lashes or a
  thin brow; a hook, a bump or a potato for a nose; a mouth as wide as half the head with a
  row of separate teeth, the dark of the mouth and a tongue; a hook at each corner of a grin;
  ears with a hook and a curl inside; freckles as dots. The features slide with `turn`; the ear
  on that side goes behind the head.
- **Hair and headgear** are chunky forms with corners (tufts of blades, a saw-toothed fringe,
  a flat-top block, sausage braids, a helmet), with two or three strand lines, never thin
  spikes or leaf shapes. One thing on every head or face that is only theirs (a plaster,
  braces, taped glasses, stickers, a visor).
- **Detail:** every character carries what they do (a camcorder on a strap, a spanner in a
  pocket, a fish slice) and wears prints and trims drawn piece by piece (hoops that sag with
  the cloth, flowers with leaves, a bib with buttons and one strap undone).
- **Hands:** five fat sausage fingers of even width fanned from a palm that is wider than the
  wrist, a thumb with a fat root, one hooked crease in the palm. One skin with the arm.
- **Poses:** never symmetrical and never flat to the camera: the body and the head in three
  quarters (`turn` 0.3–0.5 on the body, 0.5–0.85 on the head), the hips to one side, the
  shoulders tilted the other way, the head tilted, each arm doing something different, and in
  action one boot or one hand towards the camera, bigger (`scale` 1.4–1.5, `view: 'sole'`).
- **Staging:** a scene, not a line-up: figures at different depths and sizes, overlapping,
  the nearest cut by the frame, all of them after the same thing, in a set that is drawn
  whole.
- **Sets:** crooked perspective, flat pastel walls, every edge ruled separately so corners
  overshoot, loose ticks (often in pairs) on roads, walls and water, slanted gleams on glass.
- **Motion:** drawings on twos; a bob on the beat, a wave, a blink; held poses that snap.
- **Forbidden:** shading, gradients, thin spiky hair, limbs of perfectly even width with a
  sharp elbow, symmetrical poses, a shirt as narrow as the neck, any existing show's
  characters, logo or place names.

## Detail

Crop each character at twice the output size and check: the silhouette of the head; both eyes
and their lashes; every tooth; the ear's two lines; each hand (five digits, whole, the right
side); the hem's band and the folds; the boot's tongue, laces, welt and tread; the print
piece by piece; no hairline across an elbow; nothing of an arm in front of a sleeve it should
be under.

## Style checklist

- [ ] Sky flat `#ffe36d`, every colour flat, no shading anywhere?
- [ ] Inner lines (folds, teeth, creases) nearly as heavy as the contour, and one weight at every size?
- [ ] Shirt about two thirds of the head's width, shorts like a box, limbs thin with soft joints?
- [ ] Every head a different silhouette, with one mark that is only theirs?
- [ ] No pose symmetrical or flat to the camera; in action, something foreshortened towards us; a raised hand clear of the head (the head is huge: raise arms outwards)?
- [ ] Staged as a scene: depths, overlaps, a whole set behind?
- [ ] Hands: five digits, right side, one skin with the arm; a fist on a hip uses `armFront: 'fore'`?
- [ ] Sets: edges that overshoot, ticks on every large surface, nothing shaded?
- [ ] Original characters and place names only?

## Lessons

- 2026-11-14 · pier-pressure · A figure built as a parametric puppet (a shirt as wide as the neck, tube limbs with sharp elbows, a generic head, thin spiky hair, inner lines thinner than the contour) reads as a template next to a frame of the genre. Measure the reference's construction first (shirt width against the head, boot length against the height, line weight inside and out) and build the parts the way its drawings are built.
- 2026-11-14 · pier-pressure · With heads this big a hand raised straight up is behind the head: raise arms outwards (upper arm 1.7–2.0 rad, the forearm bent a further 0.5–0.9) or pass them in front.
- 2026-11-14 · pier-pressure · Locks built as short wide ribbons come out as hexagons and leaves; draw hair as one shape with corners at the tips and valleys (tufts, a fringe) and add strand lines.
- 2026-11-14 · pier-pressure · A forearm drawn again in front of the body (a fist on a hip) must start past the elbow, where the folded upper arm and its sleeve have left the forearm's band; clipped at the elbow it brought a wedge of upper arm over the sleeve and a hairline across the arm.
- 2026-11-14 · pier-pressure · A model sheet of figures standing in a row, however finished, was judged against the reference's group shot («todavía le falta muchísimo»): what reads as the genre is the drawing in space (three-quarter heads whose far eye reaches the edge, a body turned, a boot kicked at the camera, figures overlapping at different depths, a whole set). Show the style as key art, and build the figure so it can turn and foreshorten before designing a cast on it.
- 2026-11-14 · pier-pressure · A raised arm passed in front of the head brings its sleeve over the mouth: keep it behind the head and raise it outwards, unless the forearm alone crosses the body (`'fore'`).
- 2026-11-14 · pier-pressure round 6 · «Dibujos muy prematuros»: a puppet posed by numbers stayed a puppet through three rounds of finish. In this genre a character in a pose is **one drawing authored by hand** (a file per pose, every contour placed, checked beside the reference at the same height): lanky (the head a quarter to a third of the figure, never half), clothes as volumes with openings (a tee as a tube whose hoops bow round it, a sleeve as a bell with rings parallel to its hem, a shorts leg we look into), a kicked boot as a slab with its wall and tread, the line 1.3× the kit's. Use `SkateKid` for crowds and blocking only. See `sandbox/2026-11-14-pier-pressure/cast/kit-hero.js`.
- 2026-11-14 · pier-pressure round 7 · «Las líneas se notan muy artificiales… la cara, que no sea tan geométrica… las perspectivas (zapatos)»: (1) ink with `hand: true` (`shape`, `line`): one stroke per run between corners, pressed and lifted, meeting a little past the corner, never one even closed stroke; (2) no primitives in a character: author eyes, pupils, bobbles and openings as irregular outlines, teeth one by one in different sizes; (3) anything with a real form seen at an angle (a boot) is a small 3D model projected (`sandbox/2026-11-14-pier-pressure/cast/boot3d.js`: toe and up vectors, hulls of the projected parts, details only on faces that look at the camera), so the same boot is right kicked at the camera, dangling or standing; (4) a boot with its sole upwards reads as a flag: let a trailing foot hang.
