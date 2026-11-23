# ae-morph-fixer

- **Style:** none (a tool for After Effects; the engine scene is a diagnostic preview)
- **Format:** 16:9 · 8 s · 24 fps (demo project and preview)
- **Purpose / audience:** a motion designer who morphs shapes in After Effects (icons,
  logos, blobs). The third rig after `ae-flock-rig` and `ae-field-effector`: code does the
  count (which point goes where), After Effects keeps the look (the designer's shapes,
  keyframe timing and easing are untouched).
- **One-line idea:** select a keyed Path (shape layer path or mask) and run
  `MorphFixer.jsx` (renamed `Mask Morph Fixer.jsx` in round 3): every keyframe gets the same number of points, the same direction and a
  start point that keeps the morph from twisting, so shapes flow into each other instead of
  tearing, spinning or turning inside out. Every key's shape stays exactly as drawn.
- **References:** what goes wrong in AE: keys with different vertex counts, a first vertex
  in a different place (the morph spins), opposite winding (the shape turns inside out).
  AE's own fix is setting the First Vertex by hand, key by key.
- **On-screen text:** "Before" / "After" labels in the demo.
- **Music / rhythm:** none

## Decisions

- **Baked, once.** The fix is a one-time rewrite of the path keys (like the flock), not a
  live rig: AE interpolates a path key by key, so the points must be in the keys.
- **Shapes are exact.** Points are only ever added by splitting a bezier segment where it
  is (de Casteljau), the start point is only moved along the path, and the direction is
  only reversed. Each key looks identical before and after, to the bit in shape.
- **Correspondence by arc length.** After alignment, point j of every key sits at the same
  fraction of that key's outline. Every key's own points are kept, and the union of
  fractions gives every key the same count.
- **Start point by shape, not position.** Each key's start is slid along its outline to the
  spot that minimises the distance to the previous key, measured around each shape's
  centre, so a morph that also travels across the screen isn't fooled.
- **Running it twice changes nothing.** A fixed path already shares fractions and starts.
- **One shared math file** (`morph-math.js`, ES3) runs in ExtendScript, Node and the
  engine preview.

## Must NOT happen

- A keyframe's shape changing (even slightly) after the fix.
- Key times, easing or hold keyframes changing.
- A second run adding points again.
- Paths with an expression, or keys mixing open and closed paths, being touched (they are
  reported instead).
