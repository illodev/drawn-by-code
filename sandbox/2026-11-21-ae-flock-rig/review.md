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
