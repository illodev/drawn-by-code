---
name: style-clay3d
description: Clay 3D style, in testing: a raymarched plasticine set (WebGL2 in the headless browser) with a camera at table height, soft shadows, occlusion, waxy skin, glossy eyes, fingerprints and depth of field, in the manner of classic claymation. Use it when asked for claymation that looks photographed, a 3D clay set, «like a stop-motion film», or when working with styles/clay3d/.
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

- **Build like a sculptor:** balls, sausages and slabs pressed together (`smin` for clay
  joins, `smax(-…)` to carve a mouth or a panel). Rounded everything; nothing sharp but
  glasses and teeth.
- **Camera at table height**, a long-ish lens (`fov` 0.45–0.55), focus on the face,
  `aperture` ~0.2: the background melts, the foreground cloth is soft. That is the scale
  cue of a table-top set.
- **One warm key from the front left** (`light` ≈ [-0.65, 0.72, 0.7]), a cool sky fill, a
  warm bounce from the table, a vignette in `post`, film grain per drawing.
- **Materials:** skin with translucency ~0.45; clay `specular` 0.2–0.35 with low shininess
  (waxy); eyes, pupils, glasses glossy (shininess 80–140); fabric with a pattern in albedo
  (knit Vs, woven cloth) and a little bump; wood with grain.
- **Stop motion on twos**, a boil of the surface per drawing; contacts squash.
- **Logos:** from the brand's SVG (lobes, proportions and gaps), e.g. in relief on a plaque.

## Pitfalls (each cost a round)

- **A sign error in a plane** (`-p.z - 1.9` for a wall behind) puts the camera inside it:
  a black frame, no error. Planes: distance = how far in front of them the point is.
- **Bounding spheres cast ghost shadows:** a bound is a surface to the soft-shadow ray,
  so a near one draws rings of penumbra on everything. Switch bounds at a wide margin
  (`BOUND = 0.5`).
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
