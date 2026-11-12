---
name: style-oil
description: Oil painting style, in testing: a picture painted in brush strokes of thick paint (bristle tracks, rails at the stroke's borders, dry-brush ends, relief lit from the top left), laid coarse to fine over a flat study, with broken colour and coloured shadows after Monet. Two brushes on one canvas, a loose out-of-focus picture and a finished one that appears where the eye rests. Use it for oil, impasto, impressionist, «pintura al óleo», Monet/Sorolla looks, painted memories or points of view, or when working with styles/oil/.
---

# Style · Oil

In testing. Reference: `sandbox/2026-11-12-oil-test/` (`review/sheet.jpg`), a first-person
shot: the present painted out of focus, a memory painted fine where the eye rests.

## Code

`styles/oil/oil.js` (global `Oil`). A picture is made in three steps:

1. **Study** — `const st = Oil.study(box)`: the flat picture, drawn with ordinary canvas
   calls inside `st.paint({ dir, dab }, (g) => { … })`. `dir` is the angle the brush takes
   in what that call draws (walls up and down, ground and sky across, an awning along its
   slope); `dab: 1` gives short dabs in every direction (foliage, flowers, fruit).
   `st.line(points, colour, width, { level, taper })` is a thing painted in one go (a
   branch, a rail, a spoke): it is drawn into the study and laid as strokes along its path.
2. **Lay** — `Oil.lay(st, levels, { seed, blur, lines })` decides every stroke: per level
   (coarse to fine) a jittered grid, a stroke wherever the picture so far is further than
   `tol` from the study, its colour taken from the study and broken (lightness,
   temperature, hue, a share of accents), its length cut where the study's colour changes
   (`edge`). `Oil.LOOSE` (3 wide brushes) and `Oil.FINE` (6 brushes down to 1.5 units) are
   the two sets. `blur` (units) reads the study out of focus, `lines: false` drops the
   authored lines: together they give a picture that is soft because it was painted soft.
3. **Paint** — `const pic = Oil.painting(env, box)`; `pic.base(strokes…)` stamps the
   picture every drawing starts from; `pic.frame(d, (sf) => sf.stamp(set, sel))` repaints
   on top for drawing `d` (only what changed is stamped and lit); `pic.draw(g)`.
   `Oil.marks(list, levels, level)` makes a set from strokes placed by hand (what moves).
   `Oil.focus(set, d, gaze)` returns the strokes of a set that exist in drawing `d` around
   `gaze(d) → { x, y, r, ph }`: coarse levels reach further than fine ones, strokes linger
   a few drawings behind the eye (the finest go first) and are laid in over three drawings.

The box can be wider than the frame so the camera can pan over the canvas. Everything is a
function of the drawing index; `frame` only caches the last drawing. Paint is stamped at
1.5× the output and scaled down. A 1920 drawing of the test takes about a second.

`sandbox/2026-11-12-oil-test/tools/probe.mjs` lists the strokes near a point (to find what
a mark is made of).

## Style rules

- **Paint, don't filter.** Softness comes from the brush (a blurred study, wide strokes),
  never from a blur over the frame. Sharpness comes from small strokes kept inside their
  colour area.
- **Broken colour.** No area is one colour: neighbouring strokes differ in hue and
  temperature, and whites carry rose, yellow and pale blue. Measured on the references
  (`sandbox/2026-11-12-oil-test/tools/paintstats.py`, 800 px wide, 10 px tiles): chroma variation 10–17 for sunlit outdoor
  pictures, 3 for a grey winter one.
- **No black.** The darks of the references are blue, green or violet (`#0d2124`,
  `#0a0c15`, `#313e2c`). Shadows on light surfaces are violet-blue, never grey.
- **Whites are cream.** The lights of the references sit near `#d8d3c5`–`#dee1d4`; keep
  study lights at or under `#f4ecd8`, the relief's light adds the rest.
- **The brush follows the form.** Give every area its direction; a picture with every
  stroke horizontal reads as a filter.
- **Values first.** In a loose picture only the masses survive: give each thing its own
  value (a dark car against mid paving against a light sky) or it disappears.
- **On twos.** Strokes appear and go per drawing (12 a second); the camera may move on ones.
- Forbidden: outlines, gradients left smooth (they must be laid in strokes), photographic
  blur, pure white, pure black, sharp authored lines inside an out-of-focus picture.

## Detail

Crop every element at 1:1 and check: the strokes can be counted; small things are a few
deliberate strokes, not a smear (a face is two tones, a hand one stroke and a dab); edges
of fine strokes are clean; thin things (rails, spokes, a bicycle frame) are `st.line`s, not
left to the grid; nothing reads as a row of beads or a comb.

## Style checklist

- [ ] Each area has a brush direction and the direction suits its form
- [ ] Darks are coloured, lights are cream, shadows are violet-blue
- [ ] Colour is broken inside every large area (measure it against the references)
- [ ] The loose picture still reads: you can name every mass
- [ ] Where two pictures share a canvas, their geometry is the same to the unit
- [ ] The patch that follows the eye has no geometric edge and no hard rim
- [ ] Nothing in the loose picture is sharper than its neighbours

## Lessons

- 2026-11-12 · oil-test · A loose picture made only of bigger strokes turns abstract (slabs, nothing can be named): blur the study and paint that with medium brushes, and the picture stays legible and soft.
- 2026-11-12 · oil-test · Authored lines over an out-of-focus picture read as a drawing on top of a painting: drop them there (`lines: false`) and widen them in the study so they survive the blur as soft marks.
- 2026-11-12 · oil-test · `st.line` pieces that a later shape covers in the study are not laid (the kit checks the study under each piece), so depth order in the study is depth order in the paint. Anything that hangs in front (an awning over shelves) is still painted last in the study.
- 2026-11-12 · oil-test · Accents (a share of strokes in another hue) are for a finished, sunlit picture; on a grey loose one they show as stray pink slabs: set the share to 0 there.
- 2026-11-12 · oil-test · Relief must not depend on the render size: the slope of the paint falls as the picture grows, so the light's gain rises with it (`rel ∝ k^0.45`), or a small review render looks twice as embossed as the final.
- 2026-11-12 · oil-test · Thin closed shapes (a wheel) laid as few long pieces come out as beads: short overlapping pieces with round ends and no dry tails (`kind = 1`).
- 2026-11-12 · oil-test round 2 · Micro-detail is authored in the study, at the size of the finest brush (1.5 units): lay the detailed picture from a study at 1.25 px per unit, give every small thing a light side, a shadow side and one highlight, and put thin things (spokes, braid, a key) in as lines at the finest level. Then crop each element at 2× and name every piece; what cannot be named is redone.
- 2026-11-12 · oil-test round 2 · A texture tied to the canvas (dry paint catching threads) shows as a grid of dots if the threads decide alone: let noise carry more than half of the test.
- 2026-11-12 · oil-test round 2 · White things need a ground that is not white: a stork against a cloud, washing against a lime wall and a collar on a pale dress all vanished until what was behind them changed colour.
- 2026-11-12 · oil-test round 2 · What moves inside a painted picture is placed by hand per drawing (`Oil.marks`: birds, leaves turning) and goes through the same `focus` as the rest, so it only exists where the picture is finished.
