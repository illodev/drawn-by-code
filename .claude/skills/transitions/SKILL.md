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
