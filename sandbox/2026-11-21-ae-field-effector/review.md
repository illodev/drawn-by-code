# Review · ae-field-effector

## Round 1 · 2026-11-21 (automatic + inside After Effects 2026)

**Design decision that made the rest simple.** The weight has to be measured at the layer's
rest position, but an AE expression only ever sees another property's value *after* its
expression. Putting Offset/Push on Position would make Scale, Rotation and the rest measure
the weight where the field had already pushed the layer. → Position is never touched; the
displacement goes into the Anchor Point, corrected by the inverse of the layer's own
rotation and scale (and its parent, through `fromComp`). That is exactly a move of the
layer, pivot included, and every channel reads one `Weight` slider computed from the
untouched Position.

**Mock test** (`test.mjs`, the very expression strings the script writes, run against a
mock of AE's expression objects): 15,031 checks pass over 3,000 random scenes (1–3 fields of
every shape, curve and blend; rotated and scaled fields; parented, rotated, scaled targets):
weight error ≤ 1.4e-14, drawn position ≤ 1.4e-12 px. Neutral at weight 0 to the bit; a
deleted or re-aimed field is skipped.

**Engine preview** (`scene.js`, the same `field-math.js` and `demo-spec.js` as the AE demo):
no warnings from `review.mjs`. Fixed while looking at the contact sheet: a 2 s stretch with
nothing moving around the cut, because both fields started and ended off screen and Easy
Ease spent its slow ends there. → Keys moved so the sphere touches the first tile at 0 s
and the linear edge starts on the first column.

**Inside After Effects** (`make-demo.jsx` in test mode, After Effects 2026 / 26.5; four runs):

- Run 1: `undefined is not an object` building the demo. `$.evalFile` doesn't put a file's
  top-level `var` on `$.global`. → Read the file and `eval` it in place.
- Run 2: every weight wrong (far tiles at 100), the gizmo never shown. In an expression,
  `effect("X")(1)` is a Property object: arithmetic converts it, `===` and `if ()` don't, so
  `Invert` (a checkbox Property) was always on and the Shape/Curve menus never matched. The
  first mock handed out bare numbers and could not see it. → Every control is read with
  `.value`; the mock now hands out Property-like objects (it fails 4,779 checks on the old
  code). Deleting a field null re-aimed its Layer Control at another layer and AE disabled
  the expressions that errored. → Fields are read inside `try`, skipped if they aren't
  fields or were already counted; rewriting an expression turns it back on.
- Run 3: all values right, but the render showed only the background. Bisected with
  `aerender` on project variants: the Sphere comp rendered once its `FX Tint` effects were
  off. A Fill effect's Opacity is the opacity of the fill that *replaces* the layer, so a
  Fill at 0 % makes the layer vanish. → The tint is a Tint effect with both colours on the
  Tint Color, its Amount driven by the weight: it blends towards the colour and keeps alpha.
- The same run's in-AE render queue stopped after one item («Error Code: 3», restart AE).
  → The test no longer renders inside the user's AE; `aerender` renders the saved project
  in its own process (9 s in 20 s), and AE stays usable.
- Run 4 (`review/ae-log.txt`): **all checks pass.** 91 tiles × 6 times: weights match
  `field-math.js` exactly on the Linear comp and within 1.3e-6 (of 100) on the Sphere comp,
  once the test uses the `time` AE hands the expression (AE puts it on a grid of 1/61,440 s:
  ±16 µs off the requested time; frame times sit on the grid). Tiles are drawn exactly at
  rest + offset/push (0 px error, 22 px shifts). Weight 0 leaves a tile bit-identical.
  A re-run doesn't stack, a designer's expression is kept and reported, Remove and
  re-apply work, Add field reaches all 91 tiles, a deleted field is skipped without errors.
- **Render vs preview:** `reference.mjs compare` on 7 times across both shots: mean
  difference 2.1 (0 = identical). Full-resolution crops at 2.2 s (tint, push, scale, scrub
  all at once) and 6.6 s (the wipe's overshoot) match tile for tile. A redder tint in the
  first crops was the decoder, not the rig: AE's H.264 carries no colour tags and ffmpeg
  read it as BT.601. Decoded as BT.709, colours match within 2 levels. → The committed
  MP4 is re-encoded with the input declared BT.709 (declaring only the output made ffmpeg 9
  convert and bake a darker image).

**Not yet seen by the user.** Open questions for round 2: the field on their own layouts
(type, icons), whether they want 3D layers (a Z offset, camera parallax), a delay/trail
channel (it needs baking: a trail has memory), and stacking two effectors on one layer.
