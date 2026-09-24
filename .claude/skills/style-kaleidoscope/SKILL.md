---
name: style-kaleidoscope
description: Kaleidoscope style: radial mirror symmetry, pieces coming out of the center, rotation and color cycling. Use it for psychedelic climaxes, mandalas, looping music visuals or when working with styles/kaleidoscope/.
---

# Style · Kaleidoscope

Approved. Reference: `sandbox/2026-09-24-exquisite-corpse/` (climax, 18–22 s).

## Code

`styles/kaleidoscope/kit.js` → `Kaleido.draw(g, env, { source, n, cx, cy, rot, scale,
hue, sat, key })` turns whatever `source(g)` paints into a kaleidoscope: the wedge of
angle 0..2π/n around (cx, cy) is shown, repeated and mirrored. `Kaleido.beads` paints a
ring of beads.

## Style rules

- **The pieces tell a story:** use recognizable bits of what has already appeared (eyes,
  hats, blobs, the through-line), not generic confetti.
- **Hypnotic, not strobing:** global spin ≤ 0.3 rad/s, pieces at 60–120 units/s. The
  energy comes from the pulse on every beat (`scale` × `Motion.pulse`) and a hue change
  on a strong beat.
- **An unmirrored cube in the center** (the through-line) so the eye has somewhere to
  rest.
- **The wedge background: dark bands** coming out of the center, painted from largest to
  smallest.
- After `hue-rotate`, raise `saturate` (1.3–1.5): otherwise the colors get muddy.

## Style checklist

- [ ] `review.mjs` reports no **Flashes**, and the «large jumps» aren't bothersome when watching.
- [ ] Are the pieces recognizable?
- [ ] Is there a center to look at?

## Lessons

- 2026-09-24 · exquisite-corpse · At 0.55 rad/s and 240 u/s the kaleidoscope changed almost entirely every 1/6 s: slower looks better and still feels like a climax.
