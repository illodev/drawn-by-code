# ae-field-effector

- **Style:** none (a tool for After Effects; the engine scene is a diagnostic preview)
- **Format:** 16:9 · 9 s · 24 fps (preview and demo project)
- **Purpose / audience:** a senior motion designer who works in After Effects. A
  MoGraph-style effector, the second rig after `2026-11-21-ae-flock-rig`, on the same rule:
  code does the count, After Effects keeps the look. The designer keys a null (the field)
  and designs the layers; the rig makes every layer react to the field by rule.
- **One-line idea:** select any number of 2D layers, run `FieldEffector.jsx`, and get a
  field null that scales, lifts, pushes, turns, fades, tints and scrubs (precomps) every
  layer it passes over, with a shape, a falloff, noise, several fields with blend modes,
  and a falloff curve drawn in the graph editor. All of it stays live: expressions and
  sliders, nothing baked.
- **References:** Cinema 4D MoGraph effectors and fields (falloff by distance, field
  shapes, blend modes between fields); signed distance fields for the shapes.
- **On-screen text:** none
- **Music / rhythm:** none

## Decisions

- **Live, not baked.** A field has no memory: the weight at a frame depends only on where
  the field and the layer are at that frame, so expressions compute it every frame. (The
  flock needed baking because a flock remembers its velocity.)
- **The layer's Position is never touched.** The weight is measured at the layer's own
  Position (where the designer put it, keys and all), so every channel reads the same
  weight. Movement made by the field (offset, push) goes into the Anchor Point, compensated
  for the layer's rotation, scale and parent, which is exactly the same as moving it. An
  expression on Position could not do this: other expressions only see a property's value
  after its expression, so they would measure the weight where the field had already
  pushed the layer.
- **One weight per layer.** Each target gets a `<name> Weight` slider (0–100) that every
  channel reads. The designer can pick-whip it for their own expressions.
- **One shared math file.** `field-math.js` (plain ES3) is pasted into the expressions by
  `build.mjs` and loaded by the engine preview, so both compute the same numbers. Noise is
  integer-hashed value noise (no `noise()`, no `Math.sin`), identical in any engine.
- **The falloff's feel stays in the graph editor.** Besides Linear / Smooth / Ease In /
  Ease Out, the "Custom" curve is a keyed slider on the field: the designer draws the
  falloff with keyframes and bezier handles, overshoot included.
- **Fields referenced by Layer Controls**, not by name, so renaming a field null never
  breaks the expressions.

## Must NOT happen

- A layer jumps when the rig is applied with the channels at rest (weight 0 or neutral
  channel values).
- A pushed or lifted layer rotating or scaling around the wrong point.
- Channels reading different weights on the same layer.
- An expression that errors when the comp opens, or a re-run that stacks a second set of
  expressions or effects.
- The designer's own expressions on a layer overwritten without saying so.
- Different numbers in the preview and in After Effects.
