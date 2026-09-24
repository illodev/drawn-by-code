---
name: style-line
description: Line style: black line on white paper that wobbles on purpose (line boil), like hand-drawn animation at 12 drawings per second. Use it for doodles, sketches, hand-drawn explainers, «it was a drawing» moments or when working with styles/line/.
---

# Style · Line

Approved. Reference: `sandbox/2026-09-24-exquisite-corpse/` (the doodle, 23.5–27.5 s).

## Code

`styles/line/kit.js` → `LineArt`: `stroke(g, pts, { t, seed, width, jitter, closed, fps })`
(a stroke that wobbles on twos), `circle`, `paper` (fibrous paper), `drawing(t)` (drawing
number), `INK` and `PAPER`.

## Style rules

- **The wobble is the style, but deterministic:** it changes every 1/12 s with the
  stroke's seed and the drawing number, never with `Math.random`. Each stroke has its
  own seed.
- **Black and white;** color is reserved for what matters (the through-line). If
  something has color in this style, it's because it's special.
- **The page is a notebook, not an empty canvas:** doodles around it (sun, spiral, cloud,
  illegible notes) that wobble like everything else.
- **Color can spread:** whatever has color leaves a trail on the black and white, and
  that tells a story on its own.
- **Characters of few lines** (round head, dot eyes, stick body), with clear poses: the
  silhouette has to read.
- **Width 4–6** in 1600-wide units; thinner disappears when scaled down.

## Style checklist

- [ ] Does the wobble go on twos (not at 24 fps) and is it the same on every render?
- [ ] Does only what must stand out have color?
- [ ] Do the poses read without detail?

## Lessons
