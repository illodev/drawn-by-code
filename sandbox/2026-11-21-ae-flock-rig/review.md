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
