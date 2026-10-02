---
name: style-tabletop3d
description: Tabletop 3D style, in testing: «an office in miniature» — real desk objects (a paper clip, an eraser, a stapler, a sheet of paper) brought to life as stop motion and photographed like a miniature. Raymarched in WebGL2 with physically-based materials (chrome that reflects the desk, matte rubber, card with fibres, glossy plastic, printed paper from a canvas), a softbox plus a warm practical, a very shallow depth of field, film grain. Use it for object characters, «things on my desk come alive», stop motion with real objects, tilt-shift/miniature looks, or when working with styles/tabletop3d/. Render it on the GPU (DBC_GPU=1).
---

# Style · Tabletop 3D

Status: **in testing** (template: `styles/tabletop3d/template.js`; first style test: a
client's 9:16 piece, kept in the client's repo). For clay puppets use `style-clay3d`, for
wool `style-felt3d`: this style is about **real, hard-and-soft desk materials**, not clay.

## Code

`styles/tabletop3d/tabletop3d.js` → `Tabletop3D.renderer(env, { scene, scale, params, band })`
compiles the scene's GLSL; `R.render(g, key, f)` draws the frame (memoised per `key`: the
drawing index). `f`: `cam, target, fov, focus, aperture`, `keyDir, keyCol, key, soft` (the
softbox), `lampPos, lampCol, lamp, lampReach` (the warm practical), `fillCol, fill`,
`exposure`, `p` (scene data: `PF(i)`, `P3(i)`, `M3(i)`, `local(p, o)` in GLSL), `textures`
(up to 4 canvases → `uTex0..uTex3`, re-uploaded only when the canvas object in a slot
changes), `noDof`, `debug` (1 albedo, 2 normals, 3 key shadow, 4 occlusion).
`Tabletop3D.post(g, env, d, { grain, vignette })` in the scene's `post()`;
`Tabletop3D.flicker(d)` and `Tabletop3D.nudge(d, seed, amp)` for the shoot's unevenness;
`Tabletop3D.ik(shoulder, hand, a, b, pole)` for two-bone limbs; `Tabletop3D.V` (3×3 helpers).

The scene GLSL defines `map(p) → (distance, material)` (material 0 = a bound),
`albedo(m, p, n)`, `material(m) → (roughness, metalness, wrap, bump)` (metalness < 0 is a
light source: a bulb) and `relief(m, p)` (micro-relief height). Prelude: the usual SDFs plus
`sdBox`, `sdExtrude` (a 2D shape pushed into a slab with rounded edges: die-cut erasers,
card), `woodGrain`, `fibres`. Units are **centimetres**; the table top is `y = 0`.

## Style rules

- **Real objects at real size.** A 5 cm character next to a real mug (9.5 cm), a real
  pencil and a real stack of books: the contrast of scales is what says «miniature».
- **Materials say what they are** (roughness, metalness): chrome wire 0.1, 1 · brushed
  steel 0.3, 1 · glossy plastic 0.2–0.3, 0 · glazed ceramic 0.14 · matte rubber 0.55 with
  a faint pore relief (bump ≈ 0.0025: more reads as sponge or felt) · paper and card 0.85
  with `fibres` · varnished wood 0.5 with fine grain along the board. Metal needs something
  to reflect: the room environment (a bright softbox panel, lit walls) and the traced bounce.
- **Characters are one object** (a die-cut eraser, a clip, a sharpener) with pieces
  **inset or pressed on**, like novelty erasers: eye whites as thin proud discs, heavy lids
  as proud pieces over them, brows as pressed sausages, a mouth carved as a groove. Limbs
  of the same material one shade darker, hands as a mitt (palm, three fingers, thumb).
- **Light:** one softbox (front-left, `soft` ≈ 7), a warm practical out of frame or in the
  background (a desk lamp: `lamp` ≈ 2.4, orange), a cool fill (≈ 0.4). The table bounces
  warm light up. Palette of a lived-in desk: oak `#a8744a`, cream paper `#f6f1e6`, cork,
  one or two saturated props (a yellow pencil, a mint clock, a red or blue book).
- **Camera at table height, long-ish lens** (`fov` ≈ 0.8 for 9:16), focus on the
  character's face, `aperture` 0.25–0.3: only a slice of the desk is sharp; the background
  melts into colour shapes and a foreground prop on a diagonal is pure blur.
- **The set in depth:** a back layer (wall, cork board with notes, a pen cup), a mid layer
  close behind the character (books, a clock, a mug), the character on a surface with its
  traces (eraser crumbs, a printed sheet), and a blurred prop in front.
- **Stop motion on twos** (12 drawings/s): poses and props change per drawing; the shoot's
  unevenness is a 0.6 % exposure flicker and sub-millimetre nudges, **never** a surface
  that boils (hard objects don't change between frames).
- **Printed things** (a document, a note, a label) are canvases mapped as textures, drawn
  complete; small print needs supersampling (`scale` 1.25).
- Forbidden: CG-perfect plastic without relief, surfaces that boil, text in the
  environment of social apps' buttons (vertical: top 150 px, bottom 250 px at 1080×1920).

## Speed (GTX 1650, `DBC_GPU=1`)

- Template (16:9, `scale` 0.6): three stills in ~1 s.
- 9:16 style test, 1080×1920, `scale` 1.25, `band` 240: ~6 s per drawing (4 s ≈ 5 min).
  At `scale` 0.75 the same frame took ~0.7 s, but in one long pass per frame.
- Without the GPU (SwiftShader) it is not practical: use it only for a still.

## Pitfalls (each cost a round)

- **The context is lost and every later frame is black**, with no error: one long GPU job
  per frame (a big `scale`) makes Chrome reset the GPU. The kit traces the frame in bands
  (`band`, finished one by one) and throws if the context is lost. Stills (`--at`) can pass
  while the MP4 fails: always check the MP4's frames.
- **A region `if` in `map`** (evaluate the background only when `p.z < z0`) lets rays tunnel
  into objects that cross the boundary. Return a bound instead: `if (d > 0.5) return
  vec2(d, 0.0)` and evaluate the group near it, with every object of the group fully inside.
- **A thin sheet's edge aliases into a dotted line:** give paper ≥ 0.3 mm of thickness at
  centimetre units, colour its side like the paper and supersample.
- **An arm behind a held sheet with the hand in front reads as the hand through it:** pole
  the elbow so the whole arm stays in front of the sheet's plane (beside its edge).
- **Pupils under heavy lids vanish** when the character looks up: clamp the pupil below
  the lid line.
- **IK clamps silently** when the hand is out of reach and the arm stops short of the hand:
  check the reach when placing a grip.
- **A hand moving between two far poses in a straight line** crosses the face: key the arc
  (out and up), one pose per drawing.

## Style checklist

- [ ] Rendered with `DBC_GPU=1`, and the MP4's frames checked (none black)?
- [ ] Every material reads as itself at full resolution (metal reflects, rubber matte with
      pores, paper with fibres, wood with fine grain)?
- [ ] Only a slice in focus, the character's eyes sharp, background and foreground blurred?
- [ ] Real-size props in three depths, one diagonal foreground prop?
- [ ] Hands: right side, right view, never through what they hold; arms in front of held
      sheets?
- [ ] Printed text complete, legible and out of the social-app zones?
- [ ] Stop motion on twos, a hair of flicker, no boiling surface?

## Lessons

- 2026-09-26 · first style test (a client's 9:16 piece) · A long render came out black from
  the 9th drawing on while stills were fine: the GPU was reset. Bands with `gl.finish()` and
  a loud error on context loss are now in the kit.
- 2026-09-26 · first style test · Rubber with a strong pore bump read as sponge; at bump
  0.0025 and a faint mottling it reads as an eraser.
- 2026-09-26 · first style test · A hand check sheet (the same scene, a close camera on each
  grip) showed three faults the frame hid: the arm behind the sheet, a thumb sticking out
  past its edge and a crossed arm hidden behind the other.
