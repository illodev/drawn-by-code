# Morph Fixer for After Effects

`MorphFixer.jsx` makes a keyed path morph cleanly. After Effects morphs one keyframe's path
into the next point by point, in straight lines, so keys drawn independently tear (different
numbers of points), spin (each key starts at a different point) or turn inside out (one
drawn the other way round), and a shape that turns (an F becoming an F on its side) shrinks
through the middle. The fixer gives every keyframe the same points, the same direction and
a start point that keeps the morph still, and can move a turn into the shape group's
Rotation, without changing what any key looks like, its time or its easing.

## Set up

1. A **Path** on a shape layer, or a **Mask Path**, with two keyframes or more. Rectangle,
   Ellipse and Polystar shapes are parametric: right-click › Convert to Bezier Path first.
2. Draw each key however you like: any number of points, either direction, any start.

## Run

A small panel. **Dock it:** copy `MorphFixer.jsx` to
`…/Adobe After Effects 2026/Support Files/Scripts/ScriptUI Panels/`, restart After Effects
and open it from the **Window** menu. Or run it once from **File › Scripts › Run Script
File…** (a floating panel).

```
[Smooth ▾] max [100] [ ] turn [Fix] [?]
Fixed 1: 64 pts, 0.065 px
```

Select the keyed paths (or their groups, or whole layers) and click **Fix**. The status line
sums it up; hover it for the full report per path. **?** shows the instructions.

| Control | Default | What it does |
|---|---|---|
| **Smooth** | on | Every key gets points at the same places along its outline, with handles sized so in-betweens stay smooth. Each shape stays within **0.1 px** of what you drew; corners stay exact points |
| **Exact** | | Your points stay where they are; the fixer only adds points by splitting curves where they lie, so every key is exact. In-betweens may show small kinks where a point's handles are uneven |
| **max** | 100 | Smooth only: the most points per key. If a shape needs more to stay within 0.1 px, it stops there and the status says how close it got ("~0.76 px (max)") |
| **turn** | off | For shapes that turn between keys: points are matched as if the shape turned, and the turn goes into the group's Rotation (with its Anchor and Position), so the shape swings round as a whole. Steps that don't turn stay put |

Always on: every key is drawn in the same direction, and each key's start slides to where
the morph from the previous key travels least. The panel remembers its settings. With two
or more keyframes selected on a path, only those are fixed. Undo puts everything back.
Running it again on a fixed path leaves it alone ("already matched").

## What it changes

The path's keyframe values; with **turn**, also keys on the shape group's Anchor Point,
Position and Rotation (at the path's key times, with its easing). Key times, interpolation,
easing, hold keys, the layer and anything else stay as they were.

## How it works

- **Direction:** the signed area of each closed key; keys against the first clear one are
  reversed (shapes with no clear direction, like a figure eight, are left alone).
- **Start:** both shapes are sampled at 128 points from their starts; the next key's start
  slides to the offset with the least squared distance, around each shape's centre (searched
  on the sample grid, then refined). It moves only when that cuts the error by 5 % or more,
  so symmetric shapes keep their starts and a second run changes nothing.
- **Rebuild:** points go at the same fractions of every key's outline (each key's corners
  pinned exactly, the rest spread evenly), every handle a third of the arc to its
  neighbour. After Effects blends each handle in a straight line, so a smooth point stays
  smooth halfway only if its two handles keep the same length ratio in both keys: shared
  fractions guarantee it. Points are added until every key is within the tolerance; a path
  with loops or cusps it can't follow keeps its own points instead (and says so).
- **Exact:** every key gets a point wherever any key has one (by outline fraction), each
  added by an exact bezier split.
- **Max:** the rebuild starts at 16–64 points and adds more until the tolerance or the max
  (corners always keep a point, so a path with more corners than the max gets one each).
- **Turn:** the start search also tries the best rotation of the next key onto the previous
  one (2D Procrustes). A step counts as a turn only when that cuts the error by 20 % or more
  against a plain match that is really off (over 0.5 px RMS), so a circle never "turns" and
  a hold never spins. The turn is then measured on the matched keys and taken out of them:
  the path keys become local (unturned, around the shape's centre). Each turning step turns
  about its fixed point (a turn plus a shift is a turn about one point), so the group's
  Anchor and Position hold through the step (hold keys) while Rotation turns, and the shape
  swings on an arc, as if you had turned it by hand; a step that only slides moves the
  Position instead. At every key the shape is exactly where you drew it.

Measured on the demo: 10 keys of 4–10 points become 64 points each in 2 s inside After
Effects; points travel 232 px around the shape on average before, 46 after; every key
within 0.065 px of its drawing.

## Limits

- **One path at a time.** A compound shape (a letter with a hole) is several paths; each is
  fixed on its own, and keys with a different number of sub-paths can't be matched.
- Paths with an **expression**, masks with **feather points**, and keys mixing **open and
  closed** paths are skipped and reported.
- With only some keyframes selected, the others keep their points: morphs into them still
  mismatch.
- Rebuilt paths have more points, so they're harder to edit by hand: edit before fixing,
  or choose Exact.
- **Turn** needs the path alone in its group (select it, Ctrl+G), a group transform that isn't
  animated, scaled evenly and not skewed, and all the path's keyframes; masks can't turn (no
  transform of their own). Otherwise the path is fixed without turning and the report says
  why. The group's keys copy the path's interpolation and influence; custom key speeds
  (other than Easy Ease's 0) are approximated, and the report says so.
- On a shape layer with turn, the path keys hold the shape unturned: to edit a key's shape,
  look at it with the group's transform in mind, or Undo, edit, and fix again.
- After Effects stores path points as 32-bit floats (about 0.00004 px at these sizes).

## For the repo

| File | |
|---|---|
| `morph-math.js` | The math, plain ES3: splits, alignment, rebuild, the shape checks |
| `morph-ae.jsx` | The After Effects half: the compact panel, selection, reading and writing keys (and the turn into the group), report |
| `build.mjs` | `node sandbox/2026-11-21-ae-morph-fixer/build.mjs` → `MorphFixer.jsx`, with an ES3 lint |
| `test.mjs` | 4,269 checks in Node: the demo (with and without a max that bites), the turning F (angles, local keys, each key back where drawn, halfway = the F turned 45°), 60 random turns, 360 random morphs (shapes kept, counts, direction, smoothness halfway, a second run), the AE half on a mock path, and the keys AE stored |
| `demo-spec.js` | The demo's shapes and keys, shared by `make-demo.jsx` and `scene.js` |
| `make-demo.jsx` | Builds the demo project (Before / After). With `$.global.MORPH_TEST_OUT` set it also checks it inside AE, logs (`review/ae-log.txt`) and saves the project: the AE test |
| `scene.js` | Engine preview of the After half, drawn the way AE interpolates the fixed keys |

Testing inside After Effects (with the user's go-ahead: the demo opens a new project). Run a
small runner script in AE (`AfterFX.exe -r runner.jsx`) that sets `$.global.MORPH_TEST_OUT`
(a folder in `out/`) and `$.global.MORPH_DIR` (this folder), then `$.evalFile` on
`make-demo.jsx`. Render the saved project with `aerender`, which leaves AE free:

```powershell
& "C:\Program Files\Adobe\Adobe After Effects 2026\Support Files\aerender.exe" -project out\ae\morph-fixer-demo.aep -comp "Morph Fixer demo" -s 0 -e 347 -RStemplate "Best Settings" -OMtemplate "H.264 - Match Render Settings -  5 Mbps" -output out\ae\morph-fixer-ae.mp4
```

`render/ae-morph-fixer.mp4` is that render (After Effects), re-encoded with its BT.709 tags.
