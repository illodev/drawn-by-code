# Review · ae-flock-rig

## Round 1 · 2026-11-21 (automatic + inside After Effects 2026)

**Engine preview** (`scene.js`, the same `flock-sim.js`): no warnings from `review.mjs`; 7 ms
a frame warm.

Fixed while looking at preview stills and measuring the simulation in Node:

- The follow spring pulled every bird to the same point: at a tight Follow the flock
  collapsed into a ball. → A dead zone the size of the flock (`R = spacing · N^⅓ · 0.9`):
  inside it only a weak pull and velocity matching, outside the full spring.
- The flock trailed the null by about half a second, so the null sat in front of the birds,
  not among them. → `Lead (s)`: the flock aims that far ahead on the leader's path (default
  0.4; the leader is sampled past the work area so it holds to the last frame).
- Rotation jitter: p95 16°, max 54° a frame in steady flight. → A minimum turning radius
  (the sideways acceleration is capped at speed × 180°/s), smoother velocity for the
  heading (0.12 s), the pitch trusted less when a bird flies towards or away from the
  camera, and capped at 240°/s. Now median 1.8°, p95 8°, max 10° a frame; turn-arounds (a
  squash through zero over 0.3 s) p95 25° on a sliver.
- 30× slower than it should be: a hashed neighbour grid converts every key to a string. →
  A dense grid over the flock's bounding box with linked lists; `Math.*` aliased to locals.

**Inside After Effects** (`make-demo.jsx` in test mode, After Effects 2026 / 26.5):

- First run: `Can not "set expression" … the property or a parent property is hidden` on
  Time Remap. Removing the last Time Remap key turns time remapping off and hides the
  property. → Keep the two keys AE adds; the expression overrides them.
- Second run, all checks pass: simulation 5.5 s + bake 2.6 s for 80 birds × 192 frames
  (+3 s pre-roll); every expression evaluates without error; the Size Variation and Time
  Remap expressions change the baked values as expected; layer order Leader › Controls ›
  Center › Bird 001…; the source bird switched off, shy layers hidden; a re-run removed 81
  layers (80 birds + Center) and rebuilt the same count, keeping the Controls.
- Render: 4 stills + 8 s of H.264 with motion blur took 12 min on this machine. 80
  precomp layers with motion blur are heavy: the README says to pre-render once approved.
- Looked at: full-resolution crops of the stills (birds point along their path, wings in
  different phases, size varies with depth, blur along the motion), a 16-frame contact
  sheet (the flock follows the swoop, loops and exits, changing shape on the way) and 12
  consecutive frames through the loop (no rotation snaps).

**Not yet seen by the user.** Open questions for round 2: the flock's look on their own
bird art, Follow/Lead defaults on their paths, whether they want a 3D-layer mode (camera
parallax) and per-bird depth fade.

## Round 2 · 2026-11-22 (user feedback, Node tests, inside After Effects 2026)

The user asked for: (1) more control over the shape and distribution of the flock, even a
seed; (2) a few words on the controls explaining them; (3) a fix for moments when "all the
birds become so thin as to be almost invisible", which gives the 2D layers away.

**(1) Shape controls, live.** `flock-math.js` (pasted into every expression, loaded by the
preview) adds Length / Width along and across the flock's axis of travel, Shape Angle,
Clumping (radial remap around the centre: dense core and stragglers, or evened out) and
Scatter (px, speed, seed: per-bird `wiggle`, or a fixed random offset at speed 0). The sim
bakes the flock's RMS `Radius` and its `Heading` on `Flock Center`. The heading is an
**axis** (period 180°): stretching has no front, so a flock that reverses keeps its axis;
measured first as a direction it jumped 99° in a frame on a U-turn.

**(2) Self-explaining names.** Every slider's name says what it does ("Clumping (+ core, -
even)", "Turn Width % (0 = edge-on)"), ≤ 28 characters; AE took all 16. Round-1 names are
renamed in place on a re-run, values kept (checked in AE: `Spread` 80 → `Spread % (flock
size)` 80, 16 controls, no duplicates).

**(3) Birds going thin.** Measured, not guessed: round 1 had 38 % of the flock edge-on in
one frame at 3.58 s (the dive), not a U-turn (21 %). Cause: every turn-around was a squash
through zero width, and a flock diving through vertical turns all at once. Now:

- Pointing up or down, mirroring only swaps the wings' side: the flip is instant there
  (heading crosses vertical, 5 % margin). Two poses draw the same bird — (r, mirrored by
  face) and (r + 180°, mirrored by −face, upside down) — and the bake keeps the one whose
  rotation is continuous, so the flip never spins the layer (first try: 161° jumps).
- Level turns (towards/away from the camera) still squash, never narrower than Turn Width
  (default 30 %), and show the precomp's head-on drawing (a `turn` marker) for the middle of
  the turn. Per-bird durations 0.3–0.5 s and thresholds 15–35 %.
- Rotation capped at 25° a frame (a flip catching up with a lagging pitch filter had made
  76–86° steps). Steady flight: median 1.9°, p95 9°.
- Demo path: 0 % of bird-frames edge-on (round 1: 2.1 %, worst frame 38 %). U-turn: at most
  6 % mid-turn at once (round 1: 21 %), and none below Turn Width.

**Tests.** `test.mjs` runs the very expression strings against a mock of AE (Property
objects, not numbers) and compares with `flock-math.js`: 2,830 checks, including that every
control does what its name says, rotation never jumps, noses point where birds fly (99.8 %
within 35°) and nobody flies upside down in level flight.

**Inside After Effects** (`make-demo.jsx` test mode; another session was testing in AE at
the same time: agreed by message, it went second): build 9.7 s (sim 6.1 s, bake 3.5 s);
turn drawing found from the marker; no expression errors; demo comp: max 10.3° a frame,
every turn through vertical (no squash, full width); "Turn check" comp (every bird's
Facing driven to turn level): head-on drawing in 41 % of samples, narrowest side view
30.0 % = Turn Width; "Sky shaped" (Length 250, Width 55, Clumping 60, Scatter 12)
evaluates; a re-run removed 81 layers and rebuilt 85.

## Round 3 · 2026-11-23 (ExtendScript misread two nested `?:`; tested inside After Effects 27)

The draw-on rig found that ExtendScript reads `a ? b : c ? d : e` as `(a ? b : c) ? d : e`
(AE 27: `true ? 1 : false ? 2 : 3` is 2; V8 says 1). `flock-sim.js` had two. V8 reads them
right, so every Node test and the engine preview ran the intended simulation while After
Effects baked another one.

- **`clamp(v, a, b)`**: below a non-zero low end it returned the high end. Measured in AE:
  `clamp(-5, -2, 2)` gave 2 and `clamp(0.1, 0.25, 4)` gave 4. With a low end of 0 it let
  negatives through. It caps pitch and rotation steps (±) and depth scale (0.25–4).
- **The speed clamp**: over top speed it braked a bird to the minimum speed (a quarter of
  the top) instead of capping it.
- → Both parenthesized. `build.mjs` now fails on an unparenthesized nested `?:`
  (`nestedTernary`: per line, strings blanked) and lints `make-demo.jsx` too. On the old
  sources it flags exactly these two lines. Sim version 2, shown in `Flock.jsx`'s first line.

**Inside After Effects 27** (27.0 build 78), through the morph fixer's runner: `make-demo.jsx`
test mode with the old and the fixed build, then every bird's 192 baked keys (position,
rotation, scale, Facing) and the leader as the build samples it, compared with the Node sim:

- **Fixed build**: within 0.106 px, 0.05° and 0.03 % scale of Node, for all 80 birds × 192
  frames.
- **Old build**: up to 405 px from Node, with 15,347 of 15,360 bird-frames off by more than
  1 px. It matches Node running the old code grouped the way ExtendScript reads it (within
  0.18 px). So every flock baked in AE until now was a different flock from the preview.
- On the demo path the speed cap fired 4 times in the old run (Node counts it), and the flock
  diverged from there. `clamp`'s low end never fired on this path; sharper turns would hit it.
- The ~0.1 px left is the same before and after: ExtendScript's and V8's floating point,
  grown over 11 s of simulation. In Node alone, nudging the leader by 1e-15 moves birds 0.005 px.
- The test log (`out/ae-test-r3-after/ae-log.txt`): every step passes. Max rotation 10.1° a
  frame (the old bake: 10.3°), no expression errors, Turn check unchanged (41.3 % head-on,
  narrowest side view 30.0 %), a rebuild removes 81 layers and makes 85.
- Round 2's AE numbers were measured on the misread code, and so was its render.
- **Re-rendered** from the fixed bake with AE 27's `aerender` (Sky comp, Best Settings, H.264,
  54 s). `render/` (mp4, strip, gif) is redone from it, with the same formats as round 2.
  - Side by side with round 2's render the flock still follows the same swoop and loop. At
    1 s the two are nearly identical; later, single birds are in other places.
  - Full-resolution crops: birds point along their path, wings in different phases, size
    by depth, blur along the motion.
  - 12 consecutive frames through the dive (3.3 s): no rotation snaps, nobody edge-on.
  - The colours match AE's own file within 2 levels (BT.709 declared on the re-encode).

**Dumping numbers from ExtendScript**: `toPrecision` rounds negatives to integers
(`(-29.987654321).toPrecision(15)` is `-30`, and `-0.5` gives `-0`). The first dump looked like a
mismatch until positives and negatives were compared. Format `-v` and add the sign, or use
`String(v)`.
