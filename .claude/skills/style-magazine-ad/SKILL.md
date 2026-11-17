---
name: style-magazine-ad
description: Magazine-ad style, in testing: a 1950s magazine advertisement, printed — two spot inks (orange, turquoise) and a black key plate on cream stock, flat and through fine halftone screens, a little out of register; brush-ink outlines that swell and taper; «atomic age» starbursts and boomerangs; a brush-script word. Characters come from a reference separated into its inks; they move by drawings, not by pieces moved on pivots. Use it for 1950s, mid-century, vintage ad, retro commercial, «Fresh!»-style spots, or when working with styles/magazine-ad/.
---

# Style · Magazine ad (in testing)

Reference: `sandbox/2026-11-17-magazine-ad-test/` (two generated panels in `ref/`, the film
«Fresh!»). Chosen by the user from generated looks (`ref/search-*.jpg`).

## Code

`styles/magazine-ad/ad.js` → global `Ad` (load `styles/risograph/riso.js` first: the press
is the riso press with this print's inks).

- `const press = Ad.press(env)` in `setup`; per frame `press.begin(d)`, draw on plates,
  `press.print(g, { key: d, zoom, origin })`. Plates: `orange`, `turquoise`, `black`, each `'solid'`
  or `'screen'`; only the alpha counts (`Ad.tone(v)`). A camera over the printed page passes
  `zoom`, `origin` (output px of the page's (0, 0)) and `angle`: the dots grow, travel and turn
  with the page instead of boiling under it.
- `Ad.brush(g, pts, w, seed, o)`: a brush-ink stroke (smoothed, swelling, tapered ends).
  `Ad.starburst`, `Ad.boomerang`, `Ad.script` (Kaushan Script, slanted).
- A reference image is used through its separation (the experiment's `tools/separate.py`):
  per pixel, three ink densities fitted over the paper; the black at ×2 as line art; every
  plate's tone cut into nested bands; moving pieces written apart with a pivot and the
  background filled in under them. The scene fills those polygons on the press.

## Style rules

- **Three inks, measured:** orange `#eb5f18`, turquoise `#1e8c97`, black `#141411` (solids
  over paper), paper `#f4e2c5`. An ink's `rgb` in the kit is the solid divided by the paper.
  Overprints darken (inks multiply): a deep night blue cannot be made; it prints teal-black.
- **Screens:** fine round dots (≈ 3.2 px a cell at 1080 for the colours, ×1.4 for the
  black), crisp (`edge` 0.6, `spread` 0.35); colour plates 2–4 px off the black.
- **Anything over another ink is opaque:** knock its shape out of what lies under it before
  it prints (a piece of a panel, a letter over its shadow, a loaf over its badge).
- **White is paper:** steam, highlights, score marks are knockouts, never ink.
- **Motion on twos** (the drawing's time, `d / 12`). A character moves by drawings (key poses
  and in-betweens); moving cut pieces of one drawing reads as a puppet (round 3). Cut between
  drawings where there is no drawing of the action.
- Typography: brush script for the exclamation (Kaushan Script), a chunky display face for a
  logotype (Titan One, orange with a turquoise drop shadow and a black outline), a condensed
  face for small print (Anton, letter-spaced).

## Style checklist

- [ ] Three inks only; every element decided as solid or screen per ink.
- [ ] Crop at full resolution: dots read as dots, lines taper, whites are paper.
- [ ] No piece prints through another (dark mud where two shapes meet = a missing knockout).
- [ ] Every moving piece has its background filled in (move it and look at the hole).

## Lessons

- 2026-11-17 · magazine-ad-test · Read a print as inks on paper: separate the reference into
  its inks and write the plates as shapes, then convert a screen's tone in reflectance (area),
  not in density (a 50 % screen fitted in density came out at 28 %).
- 2026-11-17 · magazine-ad-test · Graphics printed on paper are cut by their own ink and their
  hole filled with paper; pieces over other ink are cut by polygon and their hole inpainted.
  Steam is a hole in the glow: keep the glow, draw the wisps live.
- 2026-11-17 · magazine-ad-test round 3 · «The animation doesn't convince me»: pieces of a held
  drawing moved on pivots (a nod, a head turn, loaves hopping) read as a cut-out puppet. A
  character moves by drawings; before animating one, know where its key drawings come from.
