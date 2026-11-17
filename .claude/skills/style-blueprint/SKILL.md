---
name: style-blueprint
description: Blueprint style, in testing: a drawing office's cyanotype — white line work on a folded, handled sheet of Prussian blue, drafted in front of the viewer in the order a draughtsman sets it out (axes, outlines, hatching, dimensions, lettering), with elevations, sections, plans and details that agree with each other because they are drawn from one model in real units. Use it for engineering, architecture, machines, products explained by how they are built, «technical drawing», «plano», serious or institutional pieces, or when working with styles/blueprint/.
---

# Style · Blueprint

Reference in testing: `sandbox/2026-11-17-blueprint-test/` (review/sheet.jpg), not yet
approved by the user. Measured on one still of a lighthouse sheet (kept in `private/`).

The model is the print: **one scalar** (how much light the paper took) through one measured
ramp from Prussian blue to the bare sheet. Wear and ink are the same thing in different
amounts, so everything on screen is either the sheet or white line work on its own layer,
broken by the paper's tooth.

## Code

`styles/blueprint/blueprint.js` (global `Blueprint`), 2D canvas. Font: `RoutedGothic`
(`fonts/RoutedGothic.ttf`, OFL: the lettering of Leroy templates).

```js
// setup(): build the drawing once. Units are logical; { u } scales the pens when the
// drawing is authored in another space (u = 0.8 for a 1280-wide still painted through 1.25)
const D = Blueprint.drawing();
D.group('outline').bold().poly(pts, true).circle(cx, cy, r);     // items go to the current group
D.group('hatch', { overlap: 0.05 }).fine().hatch(poly, { gap: 4, holes: [inner] });
D.group('notes'); Blueprint.dimV(D, x, y0, y1, { label: '7.750' }); Blueprint.title(D, x, y, 'SECTION A–A', 'SCALE 1:100');
// draw(): the sheet, the camera over it, and how much of each group has been drafted
Blueprint.frame(g, env, { cam: [x, y, zoom], zoomMax, paper: { folds, seed } }, (ink) => D.paint(ink, (group) => progress01));
```

- **Pens:** `bold()` what the cut or the outline goes through, `med()` edges, `fine()` thin
  lines and dimensions, `faint()` what is seen through glass, `hidden()` dashed,
  `centre()` dash-dot, `free(w)` round-capped for freehand, `pen(w, { dash, a, cap })`.
- **Items:** `line`, `poly`, `rect`, `circle`, `ellipse` (arcs too), `curve` (freehand
  through points), `fill` (poché, arrowheads), `shade` (a graded wash: the rounding of a
  drum), `dot`, `stipple` (concrete), `hatch` (clipped to a polygon, out of its holes),
  `text(str, x, y, cap, { align, track, clear })`.
- **Conventions:** `Blueprint.arrow`, `dimV`, `dimH`, `level` (the triangle on a level's
  line, with its note) and `title` (name, rule, scale).
- **Drafting:** `paint(ink, reveal)` asks `reveal(groupName)` for 0..1. Inside a group the
  items are drawn in the order they were added, each for a share of the group's time
  (`overlap`: 0.05 = one pen, 0.5 = many at once); a stroke in progress ends in a wet dot;
  lettering appears a letter at a time; fills and washes fade in.
- **The sheet:** `paper(env, { w, h, folds: { x: [fractions], y: [...] }, wear, seed, res })`
  is painted once (clouds of exposure, brushed mottle, grain, the cloth's weave, creases
  with cracked coating, edges and corners worn to the bare sheet) together with the
  **tooth** mask that breaks the ink where the paper did not take it. `frame` lays the
  sheet, then the ink through the tooth with a soft bleed. Pass the largest zoom of the
  shot as `zoomMax` so the sheet is painted once at that resolution.

## Style rules

- **Palette (measured):** ground `rgb(30,62,93)` (5 % … 95 %: `23,52,81` … `37,68,99`),
  thin line on paper ≈ `181,189,193`, the strongest white `211,216,216`, bare sheet at a
  torn corner up to `232,235,232`. Nothing else: no second ink, no black. If a film needs
  an accent, propose the office's own (a red pencil revision) to the user first.
- **Line:** ruled lines are ruled: straight, even, mitred corners. Never wobble a ruled
  line to make it «handmade»; what is by hand on a sheet (rock, coast, break lines) is
  drawn freehand and comes from a drawing, not from a generator (see Lessons).
- **Three weights that mean something:** bold for what is cut and for outlines, medium for
  edges, fine for joints, hatching, dimensions and extension lines. Hidden edges dashed,
  axes dash-dot and drawn first.
- **Truth:** views agree. Draw the object once in real units (`lighthouse.js`: heights in
  metres, a radius function) and derive the elevation, the section and the plan from it;
  every dimension's figure is computed from the geometry it measures (`fig(px / M)`), and
  a level's note from its height. A round body is set out round its axis: joints, bars and
  posts at equal angles, so they crowd towards the edges (`sin θ`).
- **Lettering:** capitals only, Routed Gothic, tracked 0.12–0.2; cap heights on a 1280 sheet:
  title block 8.5–10.6, view titles 7.6, notes 5–6.7. Titles are underlined, the scale goes
  under them. A figure that sits on line work breaks it (`clear: true`).
- **Motion:** the drawing is drafted, in a draughtsman's order: axes and ground, outlines
  from the ground up (both sides together), bands and openings, then texture (courses,
  hatching), then dimensions, then lettering. Mostly linear pen speed with a little ease;
  no bounce, no pop, nothing fades in except tone. The camera moves over the sheet on
  eased keys with a hold at each (close on where the pen starts, wider as the drawing grows,
  the whole sheet for the lettering); it never rotates.
- **Texture:** the sheet does not move or boil; all the life is in the pen and the camera.
- **Forbidden:** glow effects on lines, gradients of blue as «lighting», drop shadows, icons
  or emoji, lower case, a grid of graph paper (a cyanotype has none), anything in colour.

## Detail (the bar)

- [ ] Each view crops as a finished drawing at 1920: openings have frames, sills and jambs;
      cut walls are closed outlines with hatching that stops at their edges; nothing floats.
- [ ] Materials are told by their convention: masonry cut = 45° hatch, below ground = cross
      hatch, concrete = stipple, earth = wide hatch under a freehand ground line.
- [ ] Round things show their roundness in the spacing of what is on them, and a wash where
      the reference has one.
- [ ] Every figure is true to the drawing and the same object has the same size in every view.
- [ ] Freehand parts are traced strokes with their own weights, joined where the drawing's
      lines were continuous.

## Style checklist

- [ ] One sheet, one ramp: ground within the measured blues, no pure white areas except
      worn corners.
- [ ] Folds where a sheet of that size would be folded, and the same folds all film long.
- [ ] Axes first, lettering last; no group starts before what it is measured from exists.
- [ ] Text never crosses line work without `clear`.
- [ ] With the reference: `node engine/detail.mjs <scene.js> <ref.mp4> --times <end> --grid 12` PASS.
- [ ] The title block carries the signature `ILLODEV x CLAUDE`.

## Lessons

- 2026-11-17 · blueprint-test · Freehand cannot be generated: two rock generators (joints of slanted cells; ridges with cross joints) read as crazy paving and as roots. Read the strokes off the reference instead (`sandbox/2026-11-17-blueprint-test/tools/trace.py`: lines above the local ground, hysteresis so a stroke's faint parts stay joined, centre lines walked into polylines with each stroke's strength) and keep the code for what is ruled.
- 2026-11-17 · blueprint-test · A generated reference contradicts itself (a 2.4 m dimension on 100 px at «1:50», floors at the windows' height, a section fatter than its elevation). Copy its layout and its look; draw the object once in real units and let the figures come out of that, even where they move a note a few pixels from the reference.
- 2026-11-17 · blueprint-test · Paper wear is one field: how worn a spot is (handling, folds, edges, corners) first hazes the coating grain by grain and only then goes bare. Separate «scratches», «rubbed blobs» and «white edges» each looked pasted on (hairs, leopard spots, clouds).
- 2026-11-17 · blueprint-test · A wall cut at its windows reads as loose blocks until each opening gets its jambs (the faces carried across), a sash near the outer face and a sill; a door gets its leaf.
