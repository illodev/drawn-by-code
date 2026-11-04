---
name: style-sand
description: Sand style, in testing: sand animation on a light table (Kseniya Simonova, Ferenc Cakó) drawn with code — warm light from below, thick sand near black, thin sand speckled and amber, finger lines as channels of light with piled rims, poured heaps ringed with loose grains, silhouettes with details scratched out, and transitions that are the medium itself (a palm sweep, a crest of sand) instead of cuts. Use it for sand art, light-table, «arena», parables, life stories, memories, metamorphosis, or when working with styles/sand/.
---

# Style · Sand

Approved reference: sandbox/2026-11-04-tide/ (style test approved by the user, round 1;
review/sheet.jpg).

## Code

`styles/sand/sand.js` (global `Sand`). The scene paints **amount of sand** (white, alpha =
how thick) into the table's own canvas, in logical units; `post` turns it into light.

```js
setup(env) { return { table: Sand.table(env) }; },
draw(g, t, env) { const d = env.state.table.begin(); /* paint sand into d */ },
post(ctx, t, env) { env.state.table.show(ctx, { light: Sand.LIGHT.morning, gain: 1 }); },
```

- `table(env, { res })`: the density canvas (half resolution by default: the bilinear
  upsample gives soft sand edges, the per-pixel grain field gives sharpness). `show` is a
  per-pixel pass: coverage by grain (thin layers break into single grains), per-channel
  transmission (blue lost first → amber), per-channel vignette (the lamp falls off warm).
- Adding sand: `mass(d, pts, { a, soft })` filled outline; `trickle(d, pts, { w, a, prog })`
  a line laid from the fist; `heap(d, x, y, r, { u, squash })` a poured mound with loose
  grains; `grains(d, x, y, r, n, seed, { inner })`.
- Taking it away: `finger(d, pts, { w, rim, prog })` a channel whose width breathes, the
  displaced sand on its rims; `press(d, x, y, r, { rim, squash, rot })` a fingertip, a
  footprint; `clear(d, pts, { soft, a })` a palm wipe; `striations(…)` palm marks.
- `sweep(d, env, u, { dir, range, old, new, front, ridge, wake })`: the palm crossing the
  table, the old picture ahead, the new behind, a lumpy ridge and a streaked wake.
- `LIGHT` (dawn, morning, noon, afternoon, sunset, dusk, night) and `mixLight`.
- Figures that appear or blow away: draw them on their own sheet and composite
  (`Cast.sheet` in the tide experiment: alpha, and a dissolve that erodes the figure with
  seeded holes and carries the lost grains off on the wind).

## Style rules

- **Light, not ink.** Bare glass glows; nothing is drawn in a colour. The light's colour is
  the only palette, and it can tell time (the tide: dawn → noon → sunset → a blue night).
- **Thin sand is grains.** Never a flat grey: a middle layer is amber with light between
  grains. Keep layers that must read behind a figure thin (the sea at 0.3, wet sand 0.42),
  and stop a layer where the next begins, or overlapping layers add up to black.
- **People are masses**, not outlines: legs and arms as thick trickles, a torso, a head
  with a nose toward where it faces; character comes from the silhouette (a sun hat, a
  dress, long hair, a bun and a stick). Details are scratched out (a pressed eye only on a
  close, small figure: on grown-ups a light dot reads as a glowing eye).
- **Everything is made with a hand's gesture**: poured (a heap rises, then is shaped),
  drawn with a finger (lines appear with `prog`), pressed, swept. A thing that should appear
  is poured as a heap that turns into it; a tower rises as a mound that flattens and
  straightens.
- **No cuts.** The medium transforms: a crest or a palm carries the old picture away and
  leaves the new one behind it. A sweep must look like sand being pushed (a broad lumpy
  ridge, grains thrown ahead, a streaked thin film behind), never like a wipe.
- **On twos.** Anything a hand would redraw (a gull, foam, a wave's edge, a flag) changes
  its drawing every 1/12 s, with seeds per drawing, so it boils a little like real sand.
- Side view for stories (sky of bare glass, a sea of thin sand, a beach of thick sand);
  perspective is fine on the ground (footprints smaller toward the horizon).

## Style checklist

- [ ] Every thin area shows single grains at full resolution (crop it), and is amber, not grey.
- [ ] The lamp's falloff is warm at the corners, never grey.
- [ ] Each figure reads by silhouette alone at its on-screen size (crop it: who is this?).
- [ ] No layer stack turns a middle tone black where a figure has to read.
- [ ] Every appearance is a gesture (pour, finger, press, sweep), every change of scene a sweep.
- [ ] Finger lines vary in width and have rims; none are clean vector strokes.
- [ ] Striations are short soft arcs of uneven length, never long parallel lines (scan lines).

## Lessons

- 2026-11-04 · tide · Transmission per channel (blue lost first) plus a per-channel vignette is what makes a light table read as warm glass; the same maths with equal channels looked like a sepia photo.
- 2026-11-04 · tide · Coverage from a grain field mixing fine grains with clumps reads as sand; fine grains alone read as TV static.
- 2026-11-04 · tide · A generic sweep from the horizon down read as an erasure; a crest of sand with a curling lip rolling across the table read at once as a wave, and as the artist's palm.
- 2026-11-04 · tide · Figures drawn as sticks vanished on a near-black beach: give the ground a middle layer where people stand, thicken limbs, and add one costume shape per person.
