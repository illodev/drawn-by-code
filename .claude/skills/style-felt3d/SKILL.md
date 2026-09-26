---
name: style-felt3d
description: Felt 3D style, in testing: needle-felted wool puppets raymarched in WebGL2 (a halo of stray fibres on every silhouette, heathered matte wool, glass bead eyes, stitched mouths and toes), rendered over a TRANSPARENT background so any backdrop (a drawn set, a photo, a video) can go behind, with the puppets' shadows caught on the backdrop's floor. Use it for needle felt, wool, plush, felt dioramas, «same characters on many sets» (green-screen style memes), or when working with styles/felt3d/.
---

# Style · Felt 3D

Status: **in testing** (first use: `sandbox/2026-09-25-felt-cats/`, the «dancing cowboy
cats» in felt on swappable sets).

## Code

`styles/felt3d/felt3d.js` → `Felt3D.renderer(env, { scene, scale, params })` compiles the
scene's GLSL; `R.render(g, key, f)` pastes the puppets' layer (memoised per `key`: the
drawing index), `R.layer(key, f)` returns it. `f`: `cam, target, fov`, `zoom: [S, u, v]` (a
2D zoom about a point of the frame, exact and at full resolution: give the backdrop the same
transform), `light, keyCol, fillCol, key, fill, soft`, `shadow` (opacity of the caught floor
shadow), `floorY`, `p` (scene data, read in GLSL with `PF(i)`, `P3(i)`, `M3(i)`,
`local(p, o)`), `boil` (the drawing's variant: the fibres move per drawing), `debug`
(1 albedo — fast, for pose fitting —, 2 normal, 3 key shadow, 4 occlusion).

The scene GLSL defines `map(p) → vec2(distance, material)` (material 0 = a bound),
`albedo(m, p, n)`, `material(m) → (specular, shininess, wrap, fuzz)` (fuzz > 0 is felt: the
reach of its stray fibres in units, ~0.013; 0 is a hard material: beads, wire), and
optionally `#define FLOOR_DECAL` + `vec4 floorDecal(p, rd, L)` (premultiplied: a puddle, a
rug). `Felt3D.V` has small column-major matrix helpers for rigs. Worked example:
`sandbox/2026-09-25-felt-cats/cats.js` (a rig in JS: pose → joint frames; three kittens with
bead eyes, stitched mouths and toes, folds, a felt cowboy hat, wire glasses, a bald crown with
a comb-over, a resin puddle).

## Style rules

- **Felt reads at the edge:** the stray-fibre halo is what says wool. Keep `fuzz` on every
  wool piece; beads, wire, metal and resin have none.
- **Heathered, matte:** two or three shades of fibre mixed in the albedo (`heather`), deep
  wrap lighting (0.55), a fabric sheen at grazing angles; a fine faint fibre relief only.
- **Pieces a felter would make:** glass bead eyes (glossy black), a small felt nose, the
  mouth and the toes **stitched** in thread (albedo lines), ears as flattened cones, pink
  felt pads pressed in; hats of felt; glasses of dark wire.
- **Markings from the reference, pushed:** a character is recognised by its markings and
  its oddities (the user: the glasses cat «es conocido por estar medio calvo… y por mear
  mientras baila»). Make the oddity a clear piece (a bare pink crown with three strands
  combed over; a glossy yellow resin puddle that grows), not a hint.
- **Stop motion on twos** (15 drawings/s at 30 fps), the fibres boil per drawing.
- **Any backdrop:** the puppets have alpha; a set gives its light (`keyCol`, `fillCol`,
  direction) so the wool sits in it, and paints its own floor where the caught shadow lands.

## Pitfalls (each cost a round)

- **Marbled white felt:** the soft shadow's «improved» estimate (iq's `y = h²/2ph`) reads the
  inexact distances of smooth unions, squashed ears and bent brims as full shadow. Use the
  plain `h / t` estimate and trace shadows without lumps (`gLumps = 0`).
- **A bent-space brim** (`y -= k·x²`) makes shadows noisy: build curls by mirroring and
  rotating halves (exact distances).
- **A disc of shadow round a puppet:** its bound cut the penumbra. Bounds are material 0,
  with a wide shell (0.25) only for shadow rays, a thin one (0.03) for camera rays.
- **Fibres drawn over faces:** a near miss counts only once the ray moves away again.
- **A skipped part as 1e9 in a smooth union:** `mix(1e9, d, 1)` loses `d` to float
  rounding and the puppet turns into its bound. Skip the union itself, not the distance.
- **Speed:** SwiftShader runs one page on one core: render stretches in parallel
  processes. A data texture (`R32F` + `texelFetch`) rendered nothing here: pass scene data
  in a uniform block.

## Style checklist

- [ ] Every wool piece has its fibre halo; the hard pieces are clean?
- [ ] Mouth and toes stitched, eyes beads, markings matching the reference?
- [ ] The set's light on the wool (colour, direction) and the shadow on its floor?
- [ ] Nothing still for more than a second; stop motion on twos?

## Lessons
