# Review · ae-draw-on-rig

## Round 1 · 2026-11-23 (auto, before the user sees it)

Request: "an After Effects rig that enables constant-speed draw-on for multiple trim path
animations".

**Measured before building** (`probe/trim-probe.jsx`, `trim-probe2.jsx`, `fit.mjs`): Trim
Paths is arc length (0.05 px at worst); Individually splits by length top to bottom, each
path counted unscaled in its own group (a surprise: a parent trim ignores a subgroup's 200 %
scale when sharing); the group transform fitted to 0.000 px among eight candidate orders and
signs; Shape Direction 3 reverses, 1 and 2 don't; a rounded rectangle starts below its corner;
expressions don't follow a layer renamed from a script (so Layer Controls); `enabled = false`
switches a trim off from a script; an expression on End overrides its keys, removing it gives
them back.

**Built:** timing (`drawon-time.js`, pasted into the expressions), geometry
(`drawon-geom.js`), the AE half with a dockable panel (`drawon-ae.jsx`), `build.mjs`,
`test.mjs` (2,931 checks), `make-demo.jsx` (AE test), `scene.js` (preview).

**What the tests found and what changed:**

- Node, constant speed (worst 20 %): the test's finite difference (1/240 s) straddled the
  ends of 20 px strokes. Step 1e-5 s: exact to 1e-6. The test was wrong, not the rig.
- Node, geometry vs AE boxes (0.1–0.6 px): the test's polyline box missed bezier extremes.
  Exact box (bisection on arc length, dense bezier) → transform, shapes and arc length all
  match AE.
- Node, stretched stroke: 0.64 % of its length off with a 32-point table → 64 points: 0.24 %
  (10.8 % without a table). The speed still jumps at a corner of a stretched path (the
  stretch depends on the direction there): no table is smooth across a corner, so the test
  checks position and the average speed over each 1/64.
- **3D layers**: AE's default camera has perspective, so a three-point affine would leave
  ±6 % of speed along a foreshortened line. Every sample point of a 3D stroke now goes
  through toComp. In AE: 299.7–300.3 px/s on a line turned 50° in Y.
- **AE, the build died at once:** a path group came out as an Ellipse. ExtendScript reads
  `a ? b : c ? d : e` as `(a ? b : c) ? d : e` (AE 27: `true ? 1 : false ? 2 : 3` is 2).
  In the tool itself every Slider would have been made a Checkbox, and `dsClamp` let
  negatives through. All nested `?:` parenthesized; `build.mjs` now fails on one.
- AE, lengths of the parented sparkles 20 % short against the spec: the *test* parented with
  `layer.parent = …`, which compensates the child like the pick-whip; the rig measured what
  was really on screen. `setParentWithJump` in the test → 0.000 %.
- AE, the guide 861 px tall (limit 800): shorter settings and tips → 788 px.

**By hand in AE 27** (computer use, runner stopped first): run from File › Scripts the panel
floats (`review/panel.jpg`); sent with `AfterFX.exe -ro` it never showed. Apply on a layer
with one Trim Paths over two groups → the warning dialog, Cancel the default
(`review/warning.jpg`); Cancel → "Cancelled: nothing changed"; Apply anyway → 2 strokes,
the root trim switched off; the controls in Effect Controls (`review/controls.jpg`); the
guide (`review/guide.jpg`); the status line's hover report.
- **Seen only by hand:** the dialog listed the shared Trim Paths twice, once per stroke it
  cuts. Warnings are now filed under what changes (one line for that trim); the AE test
  checks it (`one Trim Paths cutting two strokes is one warning`).

**The render** (`render/ae-draw-on-rig.mp4`, by aerender in 8 s): matches the engine preview
frame for frame (mean difference 1.0–2.8 levels over the drawing, antialiasing); crops at
full resolution clean (caps, joins, no gap where Individually hands over to a hole).
`review.mjs`: no warnings. Its "still stretches" (0–1.33 s, 1.5–5.83 s) are 4 px strokes
changing too few pixels at 960 px wide; the drawing runs to 4.7 s and the last 1.3 s is the
ending hold.

**Open:** not yet seen by the user. Not installed as a docked panel on this machine (that
needs an AE restart). The demo can't show the pen's speed in a still: it reads in motion.
