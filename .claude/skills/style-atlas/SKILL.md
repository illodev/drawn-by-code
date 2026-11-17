---
name: style-atlas
description: Atlas style, in testing — a page of a fine early-20th-century school atlas drawn from a heightfield: Swiss shaded relief lit from the upper left, colours read from a measured table of (tint elevation × shade) (green valleys, cream lights, violet-grey shadows, brown heights), dense warm-brown contour lines, blue rivers and lakes with waterlines, a red dashed route, a radial town, field parcels, serif lettering and a ruled frame. Real terrain (a DEM) renders crisp in it. Use it for maps, geography, history, routes, water, documentary or educational («divulgativo») explainers, «Swiss atlas», relief map, or when working with styles/atlas/.
---

# Style · Atlas

Reference and style test: `sandbox/2026-11-17-atlas-test/` (the plate `ref/atlas-4.png`,
generated with the user's ElevenLabs account and chosen by the user out of four «serious»
directions; review/sheet.jpg). The plate is matched (detail gate PASS); the test's motion
follows the water from the dam to the town.

## Code

`styles/atlas/atlas.js` (global `Atlas`), the relief in WebGL2; everything on top is canvas
ink in **map px** (pixels of the heightfield). `styles/atlas/erode.js` (global
`AtlasErode`): stream-power erosion. `styles/atlas/sample.js` (global `AtlasSample`): a
480×270 piece of the plate for templates and covers.

```js
const height = await Atlas.load(url16, meta, tintUrl16)   // uint16 heights, optional tint
const R = Atlas.relief(env, height)                      // or Atlas.relief(env, AtlasSample.terrain())
R.draw(g, { cx, cy, zoom }, { span, contour, lineAlpha, lineWidth, erosion: [cell, amp, branch], detail, paper })
Atlas.onMap(g, env, view, span, () => { /* draw in map px */ })
Atlas.lake(g, shore) · Atlas.river(g, pts, widths, o) · Atlas.channel(g, pts) · Atlas.dashed(g, pts, { upto })
Atlas.road(g, pts, { main }) · Atlas.town(g, cx, cy, R, { spokes }) · Atlas.village(g, x, y, n, seed)
Atlas.blocks(g, Atlas.radialBlocks(cx, cy, R, o) | Atlas.gridBlocks(x0, y0, x1, y1, angleAt, o), { lot, keep })
Atlas.fields(g, x0, y0, x1, y1, where, o) · Atlas.dam(g, a, b, o) · Atlas.label(g, text, x, y, o)
Atlas.scaleBar(g, x, y, len, o) · Atlas.neatline(g, { W, H }) · Atlas.along(pts, u) · Atlas.inside(poly, x, y)
```

- **The view:** at `zoom: 1` the map's width `span` fills the frame; `cx, cy` is the map px
  at the centre. The relief and `onMap` take the same view, so ink stays on the ground.
- **Heights** are in map px of height (slope = rise / run in the same unit), stored as
  `uint16` of 0..`hmax`. A real DEM: metres ÷ metres per map px × an exaggeration (2–2.5 for
  mountains). **The tint** is what the colours follow: an elevation with the bumps blurred
  out (0 = green lowland, 1 = brown height); without one, `load` blurs the heights.
- **The palette** (`Atlas.SWISS`) is a 16 × 24 table of (tint × shade) measured on the plate
  (`tools/lut.py` in the test): mean hue per cell, brightness matched by quantiles inside
  each tint band, then calibrated against our own render (`tools/embed-lut.py … gain`).
  Contour lines are the ground × `SWISS.line` (the measured line cores, a touch warm).
- **Erosion in the shader:** gullies that run downhill (waves across the slope in random
  cells, branching on the octaves before), only where an octave's wavelength is over ~2
  screen px: a closer camera finds finer gullies; contours take only 35 % of it, so they
  bend at a gully and do not fray.
- **Towns** are BLOCKS cut into LOTS (`Atlas.blocks`): a block is a quadrilateral between
  streets, its lots small rounded dark-grey quads on the block's own bilinear grid, each with
  a darker rim and a lit corner, hairline gaps between them; the streets are the town's pale
  ground showing between blocks. `radialBlocks` gives the plate's radial town (rings, radial
  streets, cross lanes, every corner nudged); `gridBlocks` lays a jittered street grid along a
  real town's grain (a direction field), district by district. Decide each block as a whole
  (there or not), then thin lots only in the fringe, or the town reads as a scatter of dots.
  Draw a real town once into a canvas at 3 × map px in `setup` and paste it each frame.
- **A real place** (`sandbox/2026-11-17-malaga-atlas/tools/`): `fetch.py` takes a frame (a
  centre, a zoom, a size) and downloads the relief (Terrarium) and OpenStreetMap tiles one
  zoom finer, plus named rivers' courses from Nominatim, into the experiment's `private/`
  (third-party data, never committed); `derive.py` reads the tiles by their colours into the
  sea (water touching the frame's edge), reservoirs, built-up land (an outline closed over its
  streets, and a density), fields, main roads (traced and chained by their ends), the town's
  grain, and streams from the relief's drainage. Overpass does not answer from this
  container; the tiles and Nominatim do. Credit both on screen.
- **Terrain sources:** a real DEM (open Terrarium tiles: `https://s3.amazonaws.com/
  elevation-tiles-prod/terrarium/{z}/{x}/{y}.png`, height = R·256 + G + B/256 − 32768 m;
  z11 ≈ 58 m/px at 41° N) renders crisp; a heightfield measured off a picture
  (`sandbox/2026-11-17-atlas-test/tools/relief.py`) holds its layout but is softer;
  `AtlasErode.erode` carves a surface with a drainage network (slow: ~0.6 s a step at
  1280×720 in node).

## Style rules

- **Light from the upper left** (azimuth 315°, elevation 45°), always. Shadows are violet-
  grey, lights cream; the colour comes from the table, never from a hand-picked fill.
- **Tint by elevation, shade by slope:** valleys and plains green, heights buff to brown.
- **Contours everywhere on relief, none on the plain:** brown hairlines (≈ 0.9 px at 1280)
  every 2–3 height units, faded where they would crowd under 2 px. A plain is flat in the
  heightfield, so it has no lines, and carries **fields** instead.
- **Water is blue ink:** rivers taper upstream, lakes are pale with three or four
  waterlines fading inward from the shore; no blue anywhere else.
- **One red:** the route (a canal, a road, a front) in red dashes anchored at its start;
  everything else is grey, white or the ground's colours.
- **Lettering:** EB Garamond (OFL, `fonts/EBGaramond-*.woff2`): letter-spaced capitals for
  places (`EMBALSE`), larger capitals for towns (`CIUDAD`), italics along the line for water
  (`Canal`); ink `#2b2622`, no halo.
- **The page:** a ruled frame (thick outer, thin inner) on paper `#e3d5c0`, a scale bar with
  0 · half · whole and the unit. The frame is drawn in map px, so a camera that goes in
  leaves it behind; never let the camera past it (the heightfield ends there).
- **Camera:** slow, eased pushes and follows; zoom up to ~1.7 on a measured heightfield,
  further only on a real DEM.

## Detail checklist

- [ ] The relief reads as mountains at 1:1 (crisp facets, not blobs) and at the deepest
      zoom of the piece; crop both.
- [ ] Contour lines brown, thin, dense on slopes, absent on the plain; no jagged fraying.
- [ ] Rivers smooth (splined), tapering, continuous into lakes and the town; no polyline
      corners at the zoom used.
- [ ] Lake: shore line plus waterlines; the dam an arch (crest toward the water, face
      downstream), not a blob.
- [ ] Town: a dark mass of blocks cut into lots, threaded by white streets (main ones wider),
      fraying at its edge into small groups; never houses scattered on a pale ground. Crop it
      beside the plate's town at 8×.
- [ ] Roads and streams continuous (no broken pieces at crossings); no pale halos round
      scattered houses; the sea and lakes appear with the relief, not as a patch before them.
- [ ] Fields as strips of parcels with faint boundaries, a few washed in field greens.
- [ ] Lettering in EB Garamond at its measured size and place; nothing of a reference's
      own lettering left as a patch in the relief.
- [ ] With a reference: `engine/detail.mjs` PASS on the matched frame.

## Lessons

- 2026-11-17 · atlas-test · A heightfield read off a painted relief (shape from shading) holds the layout but is soft: integrate along the light lines, take the broad elevation from the tint (greenness is an inverted elevation map on a hypsometric plate), and put the fine shading back with a leaky sum along the light; it still never gets a DEM's crisp ridges. Real terrain is the source that looks like the plate.
- 2026-11-17 · atlas-test · Colour a relief by a table of (tint elevation × shade), not of (height × shade): hue follows the broad elevation, brightness the slope. Read hue as the cell's mean and brightness by quantiles, or a conditional mean washes the contrast out and quantiles alone average the hues to khaki.
- 2026-11-17 · atlas-test · A camera clamp must fall back to the centre when the view is wider than the allowed range: an inverted range moved the matched frame 6 px and cost the gate 1.5 points.
- 2026-11-17 · malaga-atlas · «What fits least for me is the city, which doesn't look as much like the reference in its details»: the plate's town is blocks cut into lots and threaded by white streets, not houses on a ground. Crop a town at 8× beside the reference before calling it done; a town of rows of separate houses passed at plate size and failed at once to the user's eye.
- 2026-11-17 · malaga-atlas · A real place is the atlas's best subject: open relief tiles render crisp at once (the plate's own relief, read off a painting, never did), and OpenStreetMap tiles read by colour give the sea, reservoirs, towns, fields and roads in their true places. Close a built-up outline over its streets, but take its density from the tiles' own built-up pixels, or the houses scattered in the hills become solid blobs of town.
