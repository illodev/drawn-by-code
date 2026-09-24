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

`u` goes from 0 to 1 (`Ease.seg(t, start, end)`); `a`, `b`, `inner` and `outer` are
functions `(g) => void` that paint their shot full-bleed. `Motion.layer(env, name, fn)`
paints a shot on a separate canvas when the transition needs to deform it as an image.

Full example with all five, plus a paper ball that crumples and opens:
`sandbox/2026-09-24-exquisite-corpse/scene.js` and `segments/doodle.js` (`Segment.paperBall`).

## Lessons

- 2026-09-24 · exquisite-corpse · In `engulf`, the cloud edges are painted before `b`; otherwise each circle leaves its full ring and you get a tangle (now in the engine).
- 2026-09-24 · exquisite-corpse · Everything deformed with clipping (crumpling, tearing) is also clipped to the shot rectangle, or bits poke out of the sheet.
