# ae-draw-on-rig

- **Style:** none (a tool for After Effects; the engine scene is a diagnostic preview)
- **Format:** 16:9 · 6 s · 24 fps (demo project and preview)
- **Purpose / audience:** a motion designer who reveals line art, logos and handwriting with
  Trim Paths. The fourth rig after `ae-flock-rig`, `ae-field-effector` and `ae-morph-fixer`:
  code does the count (how long every stroke is, in comp pixels, and when each one starts),
  After Effects keeps the look (the designer's strokes, their own Trim Paths and keys).
- **One-line idea:** select shape layers, groups or Trim Paths and click Apply in the
  `Constant Speed Draw-On` panel: every stroke draws on at the same speed in pixels per
  second, however long it is, whatever its layer's or group's scale, one after another,
  together, staggered or from the designer's own key times, all live from one controls null.
- **The problem:** keying Trim Paths End 0 → 100 % over the same time on every stroke makes
  a 40 px tick crawl and a 1,400 px swash race. Fixing it by hand means measuring every path
  and retiming every key, and redoing it whenever a path changes.
- **On-screen text:** "Same duration" / "Constant speed" labels in the demo.
- **Music / rhythm:** none

## Decisions (from measurements in AE 27, `probe/trim-probe.jsx` + `probe/fit.mjs`)

- **Trim Paths is arc length.** End % lands at that fraction of the path's length (worst
  0.05 px off on curves with very uneven handles), closing segment included. So a linear
  End is already constant speed inside one path; the rig only has to give each stroke a
  duration proportional to its length, and a start time.
- **Individually = by length, top to bottom,** across paths in a group and across groups
  under one trim. A group with several paths (a letter with a hole) is one stroke whose
  length is the sum; its trim is set to Individually.
- **Lengths in comp pixels.** A trim measures in its own group's space; the rig carries
  each path through AE's group transform (fitted to 0.000 px: `Position + R(rot) ·
  K(skew) · S(scale) · (p − Anchor)`, `K = R(−axis) · [[1, −tan skew], [0, 1]] · R(axis)`)
  and the layer's (`toComp`, so parents and 3D cameras count). A stretched or skewed group
  draws faster along its long axis: the rig bakes a small table that keeps the pen's
  visual speed constant there.
- **Live, with baked lengths.** Lengths, orders and directions are baked into each
  stroke's Start/End expressions (cheap per frame); speed, timing, order, gaps, easing and
  the draw-off are sliders on the controls null, so nothing needs re-running unless a path
  changes (Update re-measures).
- **Layer Controls, not names:** renaming a layer from a script does not update
  expressions that name it (probe), so each rigged layer gets a Layer Control pointing at
  the controls null.
- **Never destructive.** The designer's own Trim Paths and keys stay; the expressions
  override them and Remove gives them back. A trim above the strokes (one Trim Paths over
  a whole layer) is switched off, not deleted, and comes back on with Remove.

## Must NOT happen

- Two strokes drawing at different speeds (in comp pixels) in any timing mode, at any
  layer scale, parent or group transform.
- A stroke flashing (drawn for a frame before its turn) or popping (jumping ahead).
- The designer's keys, trims or expressions lost; a re-run (Update) changing anything when
  nothing moved.
- A dialog or an expression error left in AE.
