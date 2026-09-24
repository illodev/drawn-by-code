---
name: style-clay3d
description: Clay 3D style, in testing: raymarched plasticine puppets (WebGL2 in the headless browser) built from lumpy pressed-on pieces (flat disc eyes, ball noses, hair in clumps), matte clay with fingerprints, soft studio light on a seamless backdrop, stop motion on twos. Use it when asked for claymation, plasticine or stop-motion characters that should look like real clay, or when working with styles/clay3d/.
---

# Style · Clay 3D

Status: **in testing** (first test: `sandbox/2026-09-24-clay3d-test/`, render/clay3d-test.mp4).
For flat, illustrated plasticine use `style-clay` (2D) instead: quicker, less real.

## Code

`styles/clay3d/clay3d.js` → `Clay3D.renderer(env, { scene, scale })` compiles the scene's
GLSL with the kit's prelude and lighting; `R.render(g, key, { a, cam, target, fov, focus,
aperture, light, noDof })` draws the frame (memoised per `key`: pass the drawing index, so
the two frames of a drawing on twos share one render).

The scene GLSL defines `map(p) → vec2(distance, material)`, `albedo(m, p, n)`,
`material(m) → vec4(specular, shininess, translucency, bump)` and `background(rd)`.
Animation goes in `uA[0..94]` (`#define` names for them); `uA[95]` is the boil (the
drawing % 3: the fingerprints move with it). Prelude: `sdSphere, sdEllipsoid, sdCapsule,
sdRoundCone, sdRoundBox, sdTorus, sdCylinder, smin, smax, opU, opSU, rot, hash, noise, fbm`.
Worked scene: `sandbox/2026-09-24-clay3d-test/set.js` (Laura: head with carved mouth, eyes
with pupils and lids, glasses as tori; body with knit; hands wrapped round a mug as finger
capsules on a circle; mug with dots; the brand logo in relief on a plaque; tablecloth with
folds, chair, wallpaper, a panelled door).

## Style rules

The user's verdict on a first, «photographed set» version: «parece más 3D que plastilina».
What makes it plasticine and not CG (from their references: a puppet on a seamless
backdrop, pieces pressed on):

- **Hand-made, never perfect:** every clay piece gets `lumps(p, amp)` added to its
  distance (a head ≈ 0.012, small pieces ≈ 0.004): dents and bulges, no perfect ellipsoid.
- **Pieces pressed on, joins visible:** eyes are flat white discs with a flat black dot
  (`disc()`), the nose a ball, the mouth a flat piece (a curved sausage; a D with a teeth
  strip for a grin), eyebrows and lashes sausages, cheeks flat pink dabs, hair in clumps of
  balls (hard unions, not smooth), collars and lapels flat strips, buttons flattened discs,
  the brand's logo a flat badge (lobes from its SVG). Use `opU` for pressed pieces and keep
  `smin` for the body's own forms.
- **Matte material:** specular ≈ 0.05, shininess ≈ 5; skin translucency ≈ 0.4; bump 1.4
  for fingerprints; fine pigment speckle in albedo (tiny, faint: big dots read as dirt).
- **Studio light:** a seamless backdrop (floor and wall joined by `smin(p.y, p.z + d, 1.2)`)
  in a saturated pastel, a soft key from the front left (`soft` 8), a strong fill (`fill`
  0.55), a long lens (`fov` ≈ 0.36), little depth of field (`aperture` ≈ 0.06), a light
  vignette, film grain per drawing.
- **Characters:** a big egg head, a slab torso, sausage arms with cuffs, four-finger hands
  (open for a wave: palm to camera, thumb on the inner side; a fist with the thumb up).
- **Stop motion on twos**, boil per drawing (`uA[95]`), blinks and winks as a black line.
- **Pressed pieces sit ON the surface, not at it.** Work out where the surface is (the
  front of the jaw ellipsoid at the mouth's height) and put the piece a hair in front,
  following the surface's curve to the sides (`z += k·x²`). At surface level the lumps
  bury it: the resting smile vanished and only the open grin showed.
- **Clothes follow the limb, not the hand.** A cuff is a cylinder along elbow → wrist
  (`sdCappedCylinder`) at the end of a sleeve that stops short of the wrist; built in the
  hand's frame it becomes a disc the hand sits on whenever the wrist bends.
- A table-top room (the first version) is possible too, but it drifts towards CG: keep the
  pressed-piece rules there as well.

## Pitfalls (each cost a round)

- **A sign error in a plane** (`-p.z - 1.9` for a wall behind) puts the camera inside it:
  a black frame, no error. Planes: distance = how far in front of them the point is.
- **Bounding spheres cast ghost shadows:** a bound is a surface to the soft-shadow ray.
  Bounds return **material 0**: the kit's soft shadow steps over them without casting (and
  resets its estimate after one: a stale estimate reads as full shadow, streaks everywhere).
  A bound must also be big enough to hold the character's penumbra, or the shadow on the
  backdrop is cut in a sharp arc (Laura: radius 1.6 round the torso).
- **Soft-shadow banding:** coarse steps band into contour lines on round forms; use the
  improved estimate with fine steps (the kit does) and a fairly frontal key.
- **Depth in 8 bits** makes the depth-of-field blur jump in steps (contour lines): the kit
  stores the signed blur radius in alpha instead of the depth.
- **SwiftShader (CPU) is the GPU here:** ~2.5 s per drawing at 1920 with `scale` 0.6 and
  bounds; everything on twos is rendered once per drawing (the memo). `noDof: true` for
  quick previews.

## Style checklist

- [ ] Camera at table height, focus on the face, background out of focus?
- [ ] Every character built from pressed forms; hands with separate fingers round what they hold?
- [ ] No rings or contour lines on faces (bounds margin, shadow steps)?
- [ ] Eyes and glasses glossy, clay waxy, fabric patterned?
- [ ] The brand's logo from its SVG?

## Lessons

- 2026-09-24 · clay3d-test · Round 3 (user): «el doblez de la camisa siempre muestra la misma posición» (the cuff was in the hand's frame) and no mouth at rest (buried under the face's surface). Both rules above.

- 2026-09-24 · clay3d-test · Round 1 (a photographed table-top room, perfect SDF forms, glossy eyes) read as «más 3D que plastilina». Round 2 with lumps, flat pressed-on features, matte clay and a studio backdrop is the style.
