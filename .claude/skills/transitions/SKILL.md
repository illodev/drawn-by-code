---
name: transitions
description: Transitions between shots and between styles in drawn-by-code (engine/transitions.js): entering through a point (eye, mouth), iris, engulf, vortex, frame within a frame, paper ball. Use it when linking two shots or two different styles, in «exquisite corpse» videos, or when a hard cut feels poor.
---

# Transitions

Reference: *Rick and Morty · Exquisite Corpse*. Each segment is made by a different studio
and **there is never a hard cut between styles**: the action continues and the transition
passes **through** something in the shot (an eye, a mouth, a picture frame, some clouds).

## Rules

- **The transition is a shot**, with its own slot in `shots` (1–1.5 s) and cuts on the beat.
- **It passes through the through-line** (the object or character linking the segments) or
  through something already in the outgoing shot. If the transition doesn't come out of
  the shot, it's a crossfade by another name.
- **The transition's edge belongs to the outgoing style** (the edge of the spore clouds
  is 70s poster; the edge of the paper ball is paper): that way the change reads as
  something world A does, not the edit.
- **First you see the point, then the new world** (`enter` with `fadeIn`): if the portal
  replaces the eye on the first frame, it reads as a flat disc.
- **The through-line never disappears**, not even in the smallest frame of the vortex.
- Vary: don't repeat the same transition twice in a row.

## Catalog (`Trans.*`, load `engine/transitions.js` in `uses`)

| Function | What it does | When |
|---|---|---|
| `enter(g, env, u, { a, b, cx, cy, r0, zoom, spin, fadeIn, edge })` | The camera pushes toward a point in `a`, which travels to the center; inside, `b` opens up spinning | Eyes, mouths, keyholes, screens, holes |
| `iris(g, env, u, { a, b, cx, cy, edge })` | `b` grows in a circle from a point, no camera | Something that opens or unfolds (a paper ball, a flower) |
| `engulf(g, env, u, { a, b, origin, seed, count, puff })` | Clouds come out of a point and cover `a`; `b` is already inside | Sneezes, smoke, ink, foam, explosions |
| `vortex(g, env, u, { a, b, cx, cy, turns })` | `a` twists in a spiral and shrinks to a point | Whirlpools, drains, portals; a good lead into a climax |
| `frame(g, env, u, { inner, outer, at, rim })` | The camera pulls back: `inner` was a picture, a drawing or a screen inside `outer` | Reveals ("it was a drawing"), galleries, screens |

**Ink blot (sumi-e and any paper style):** a drop lands on the outgoing shot, spreads as an
organic stain and thins out into the incoming one: `inkBlot` in
`sandbox/2026-11-04-red-thread/scene.js` (both shots rendered into layers for 1.2 s around
the cut; the stain is a mask of lobed blots, the ink a radial gradient inside it fading
with `u`, the wet rim the mask minus its blurred copy). Land the drop on the next shot's
subject.

**Between 3D rooms: portals.** When the shots are places a camera travels through (rooms of a
building, a sky inside a sphere), don't cut between them: join them by an opening in the shot
and fly through it. Each room keeps its own coordinates, scale and light; the opening is a
portal (a hole in this room's layer, the next room rendered from the mapped camera beneath
it). Engraving kit: `Engrave.portal`, material 7, `R.mask`; worked example with seven
doorways (a ring, a floor ring, a tunnel's membrane, a side door, a sphere's skin both ways,
a ceiling shaft) in `sandbox/2026-09-26-pyramid-engraving/junctions.js`.

`u` goes from 0 to 1 (`Ease.seg(t, start, end)`); `a`, `b`, `inner` and `outer` are
functions `(g) => void` that paint their shot full-bleed. `Motion.layer(env, name, fn)`
paints a shot on a separate canvas when the transition needs to deform it as an image.

Full example with all five, plus a paper ball that crumples and opens:
`sandbox/2026-09-24-exquisite-corpse/scene.js` and `segments/doodle.js` (`Segment.paperBall`).

## Lessons

- 2026-09-24 · exquisite-corpse · In `engulf`, the cloud edges are painted before `b`; otherwise each circle leaves its full ring and you get a tangle (now in the engine).
- 2026-09-24 · exquisite-corpse · Everything deformed with clipping (crumpling, tearing) is also clipped to the shot rectangle, or bits poke out of the sheet.
- 2026-09-25 · physics-newton-faraday · A morph across a pan (an orbit winding into a coil while one set slides out and the next slides in) lives in screen space, not in either set. It stays mid-frame and lands on its target exactly when the pan ends. The target's own copy is hidden until then: a copy that travels with its set flies off, and one that is always drawn doubles up.
- 2026-09-27 · pyramid-engraving · A fade to dark between two 3D rooms is a cut by another name; the user saw «saltos». A portal through something already in the shot, with the camera's speed matched across it and whatever leads going through first, made the ten shots one travel.
- 2026-09-30 · external product promo · The user saw «saltos raros» in an abstract-shapes promo, and a per-frame image difference found two. (1) A camera term switched on at a threshold (`t > X ? 0.06 * (1 − ease) : 0`) is 0 up to X and its full amplitude on the next frame: a one-frame jump 13× the median change. Every camera term starts at 0 and rises with its own curve. (2) On one beat, five things changed together within 0.2 s (the hero's size with overshoot, the others' position, size and brightness, the camera's zoom and a rolling number): each smooth, together a lurch (7–11× the median for five frames). On a hard beat change one big thing, and stagger the rest by 0.1–0.2 s. Find them before showing: the mean absolute difference between consecutive frames, frames above ~5× the median.
- 2026-10-02 · product videos (four styles) · At low frame rates (pixel art, riso drawn on twos) measure `jumps` on the DRAWINGS, not the file: a 24 fps video on twos repeats every second frame, the median goes to ~0 and everything is a «jump» (decimate with `select='not(mod(n\,2))',setpts=N/12/TB` to 12 fps first). On a nearly still frame any abrupt change of a small object counts: a 12 px step, a 1 px shake of the whole scene, a blinking flash or ghost, a label appearing in one drawing. What passed: steps slid over 0.1 s on whole pixels, dither (Bayer) fades instead of blinking, a flash arriving 0.04 s after the hit and rising over 0.06 s, no camera shake. Big things need ≥ 6 drawings and a smooth curve (a 200 px headline slid out in 0.4 s was ×30 the median; dissolved in halftone over six drawings it was none), and a word that must appear is printed over several drawings, not dropped in one.
- 2026-10-02 · product videos · A cubic ease-in exit is at its fastest right as it leaves the frame, and the next drawing is already empty: a spike. Use a quadratic curve and make it longer, or sweep it with a constant-speed bar or belt, whose per-drawing difference is flat.
- 2026-10-02 · product videos · If `jumps` shows high «movement» with no spikes, look for what coincides with a camera move: a camera sliding at the same time as a full-screen light change or a wave of pieces dominated the difference (×9.5); with the camera still during those, nothing passed ×5. «One big thing at a time» holds for the camera too.
- 2026-10-02 · product videos · A linear spin of a plate switches its shadow on (∝ sin θ) in the first frame; use an S-curve. Flap/tile panels scheduled to «land on» a target start turning earlier by the number of flaps between; a flap's spin following gravity (p^1.25) and the falling half drawn as ~4 strips, wider the farther from the axis, gives volume without 3D. An image laid over flaps reads cut by the gaps, and fading it to the whole image afterwards looks like a sticker: use one large flap that folds, with its own axis and the same light, and the photo of what it folds with the background of the gap behind.
- 2026-10-02 · product videos · A sign or label leaves in dither, not by dropping at full opacity (it reads as a cut), and the next one does not enter until the previous has gone.
- 2026-10-14 · external explainer · Entering a screen inside an orthographic (isometric) world is a camera move, never a deformation of the screen: interpolating the screen's projected parallelogram towards the frame reads as the screen peeling off its device and bending. Make the orthographic camera orientable (azimuth and elevation as parameters of the projection, same scale at the isometric angles so nothing else changes), turn it to face the screen while zooming in log scale, and pick the end zoom so the screen's own rectangle fills the frame; the interface stays mapped on the face the whole time. If an object in front would cover the screen when facing it head-on, end a few degrees above (the vertical face stays a rectangle) instead of fading the object.
- 2026-11-04 · red-thread · The user found hard cuts «bruscas» in an ink film and asked for ink stains on the paper. Organic stains: modulate the radius with low-frequency noise over the angle (lobes) plus a small high-frequency term (feathered fibres); per-vertex random noise on a big radius gives a star. Never stroke each blot's outline (overlapping blots make a web of lines): take the rim from the union mask (mask minus a blurred copy).
- 2026-11-04 · red-thread · Ten ink blots on ten cuts of the same place with the same people «hace que se vea peor todo»: a transition marks a change of world or act, not a change of framing. On one set, join shots with one continuous camera (each shot keeps its last framing; the camera travels to the next shot's next key) and keep the transition for the one turn of the story.
- 2026-11-04 · red-thread · The user preferred the film's own opening gesture to a new effect for its one transition: the painting erased back to blank paper and the next one blooming onto it, as the title did (`actChange` in that scene). Rhyme the transition with the film's opening before inventing one.
