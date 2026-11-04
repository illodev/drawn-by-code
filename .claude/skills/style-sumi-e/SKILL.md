---
name: style-sumi-e
description: Sumi-e style, in testing: Japanese ink painting on washi — one black ink in many greys, brush strokes with tapered ends and dry-brush streaks (kasure), boneless mountain washes dissolving into mist, water as horizontal dry strokes with reflections, tiny ink-silhouette people, vermilion as the only colour (a sun, blossoms, a thread). Use it for Japanese, ink, brush, zen, haiku, parable or «tinta china» looks, or when working with styles/sumi-e/.
---

# Style · Sumi-e

In testing. Style test: `sandbox/2026-11-04-red-thread/` («The kite», 7 s; review/sheet.jpg).

## Code

`styles/sumi-e/sumi.js` → `Sumi`:

| Call | What it paints |
|---|---|
| `stroke(g, pts, { w, ink, dry, prog, taper, blunt, press, color, seed, raw, core, bleed })` | a brush stroke: a solid wet core that narrows where the brush runs dry, overlapping bristles that leave white streaks (kasure) and a ragged edge. `ink` 0..1 is the tone (water, not colour), `dry` 0..1 how fast it runs out, `prog` draws it on |
| `cachedStroke(key, pts, opts, k)` | the same, as a sprite you move (`.draw(g, dx, dy)`): ripples, rain, distant figures |
| `dab(g, x, y, rx, ry, { ink, color, rot, rough, seed })` | a wet ink blob with a drying rim: heads, hands, buds, petals, moss dots |
| `wash(key, box, k, shapeFn, { ink, blur, rim, fade, grain, color })` | a soft-edged wet area (bokashi), granulated, optionally fading down into mist; returns a sprite |
| `mountains(g, env, key, { x0, x1, y, h, ink, peaks, sharp, blur, contour, cun })` | a boneless (mokkotsu) range: a wash dense under the ridge that dissolves into mist; contour and texture strokes are optional and off by default |
| `sun(g, env, x, y, r, { color, alpha })` | the sumi-e sun: a ragged disc with dry horizontal streaks (RED, or a grey) |
| `paper(g, env, box)` · `tooth(ctx, env, { scale, ox, oy, amount })` | washi (mottling, kozo fibres, bark inclusions), and the paper's relief over everything from `post`, anchored to the ground plane |
| `seal(g, env, x, y, size, text)` | a red hanko with the characters cut out |
| `smooth`, `blobPts`, `fillPoly`, `tone`, `mix`, `INK`, `PAPER`, `RED` | helpers |

Figures: `sandbox/2026-11-04-red-thread/cast.js` (`Cast.figure`): ink silhouettes built
from a few strokes on an IK rig (fixed bone lengths, feet planted, hands as world targets).
It returns the hands as drawn: attach strings and props to those, never to the pose's
targets (a target out of reach leaves the prop hanging in the air).

## Style rules

- **One ink, many greys.** Tone is how much water: far mountains 0.15–0.2, middle 0.35–0.4,
  ground and figures 0.85–1. No other colours except vermilion.
- **Vermilion is meaning.** Only what the story is about is red (a sun, blossoms, a thread,
  a ribbon). If more than two things are red, nothing is.
- **The brush shows.** Every stroke lands blunt, leaves sharp and runs dry along its length.
  Thick strokes (trunks, banks) need `dry` ≥ 0.5 or they read as tubes; hair-thin lines
  (a kite string) use `dry` ≈ 0.15 and `taper: [0, 0]`.
- **Boneless landscape.** Mountains, mist and water are washes, not outlines. A contour, if
  any, is broken and dry, on part of the ridge only: a continuous outline reads as wire.
- **Leave paper (ma).** Banks and sky are mostly empty paper defined by a few strokes: a
  shoreline, stones with moss dots, reeds, tufts. Washes along a whole bank read as a road.
- **Water** is a pale wash darker towards the far shore, horizontal dry strokes denser near
  the banks, and reflections (posts as a wavy stroke, mountains mirrored at ~0.3).
- **People are ink silhouettes, no faces.** Who they are reads from posture, hair and
  clothes: a robe is one broad stroke pressed harder towards the hem; a hand at this size
  (figures 120–190 units tall) is one dab at the sleeve's end. Any close-up of a hand goes
  through the **hands** skill.
- **Motion:** figures and props on twos (`floor(t*12)/12`), camera and mist continuous.
  Keyed paths (camera, a kite) go through a monotone spline, never eased segments between
  keys: those stop dead at every key.
- **Texture:** the paper's tooth is subtle (amount ≈ 0.17) and moves with the ground plane.
- **Forbidden:** outlines around everything, flat vector fills, gradients that look digital,
  colours other than ink and vermilion, cartoon faces.

## Style checklist

- [ ] Is red used only for what the story is about?
- [ ] Do thick strokes show dry streaks and ragged edges at full resolution (no tubes, no hatching)?
- [ ] Are mountains washes that dissolve into mist, with no continuous wire outline?
- [ ] Do the banks leave paper, and does the water read as water (wash, ripples, reflections)?
- [ ] Do figures read by silhouette alone, and do strings and props attach to the drawn hands?
- [ ] Does anything stop dead at a key (camera, flying objects)?

## Lessons

- 2026-11-04 · red-thread · `Ease.bump` in core is `(t, start, dur)`, not a 0..1 hump: passing one argument gives NaN, and the strokes fed by it silently vanish. Use a local `sin(π u)` for a hump.
- 2026-11-04 · red-thread · A brush made of thin parallel bristles reads as a striped cable: it needs a solid wet core that narrows where the brush runs dry, and few, wide, overlapping bristles on thin strokes (3 for a string), or they fall under a pixel.
