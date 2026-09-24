---
name: style-liquid-light
description: Liquid light style: the oil-and-ink projections of 60s concerts, with blobs that flow, merge (metaballs), shift color and have rings like oil on water. Use it for psychedelic, hypnotic, liquid or organic videos, or when working with styles/liquid-light/.
---

# Style · Liquid light

Approved. Reference: `sandbox/2026-09-24-exquisite-corpse/` (jellyfish segment, 12–16.5 s).

## Code

`styles/liquid-light/kit.js` → `Liquid`: `field(g, env, blobs, { res, bg, bands, hueShift,
glow, threshold, sat })` paints the blob field `[{ x, y, r, hue }]`; `drift(seed, n, t,
env, o)` gives blobs that drift on their own; `glowDot` is a sharp point of light on top. For layers: first a faint background
(`gain: 0.4`) and the figure on top with `transparent: true`. `pulses: [{ x, y, r, w, hue, amp }]`
are light waves that tint whatever they cross (and show as rings in empty water).

The field is computed per pixel at low resolution (`res` = 360 px wide) and upscaled with
smoothing: that blur IS the projection look. It costs about 30 ms per frame with about
40 blobs.

## Style rules

- **Two layers:** a faint, dense background sea (20+ small drifting blobs, with `gain`
  0.4) and the bright figure on top. An empty black background = a scene without context.
- **The figure moves like the real thing** (look at a reference): a jellyfish swims in
  strokes (contracts, rises, glides) and the tentacles trail behind.
- **An action that reads:** the waves (`pulses`) on the music beat give cause and effect
  (something emits and the sea changes color).
- **Figure of medium blobs; loose particles, small.** With many, everything merges into a color soup: to form
  a figure (a jellyfish, a face), push the rest to the edges and make it smaller.
- **Figures are built from blobs** (a bell in an arc + a core, tentacles as chains) that
  arrive from scattered positions: that way the figure «condenses».
- **Color by families:** one hue per part of the figure (magenta bell, turquoise
  tentacles); `hueShift` rotates everything slowly (20–30 °/s).
- **Soft rings:** 2–3 rings per blob at most; the densest part, smooth.
- Whatever must read on top (the through-line, a text) is sharp and uses `glowDot`.

## Style checklist

- [ ] Does the figure read, or is it a blob soup?
- [ ] Are the thin parts (tentacles) at least 4× their radius apart?
- [ ] What does the figure do? And does the background have life?
- [ ] Are there bullseyes or moiré in the center of the blobs?
- [ ] Is the background dark and clean?

## Lessons

- 2026-09-24 · exquisite-corpse · Linear rings bunch up in the center of each blob (moiré); on a logarithmic scale and capped they look like oil (now in `field`).
- 2026-09-24 · exquisite-corpse · 34 large blobs = soup; 5 small background ones pushed aside + the figure = the jellyfish reads.
- 2026-09-24 · exquisite-corpse · Tentacles 50 units apart with radius 13: the halos join and come out as one mass. At 60 units with radius ≤ 11, threads.
- 2026-09-24 · exquisite-corpse · Scattered particles before condensing, small (×0.45): large, they turn back into soup.
