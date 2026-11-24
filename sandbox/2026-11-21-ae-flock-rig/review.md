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

## Round 4 · 2026-11-23 (user feedback: edge birds too fast when the flock is spread; Node, inside After Effects 27)

The user: "when the flock is spread, birds at the edge of the flock fly unreasonably fast
(like how the edge of a spinning top moves faster than the center)."

**Measured first** (Node, the demo path; a bird's speed / the flock's mean speed that frame):

| Controls | p99, round 2 | max, round 2 | p99, round 4 | max, round 4 |
|---|---|---|---|---|
| Defaults | 1.44 | 1.76 | 1.19 | 1.29 |
| Spread 200 | 1.95 | 2.59 | 1.34 | 1.63 |
| Spread 300 | 2.48 | 3.42 | 1.32 | 1.61 |
| Length 250, Width 55 | 2.82 | 5.18 | 1.23 | 1.36 |
| Sky shaped (+ Clumping 60) | 3.20 | 6.40 | 1.21 | 1.33 |
| Spread 200, Length 250, Width 55 | 4.88 | 9.40 | 1.25 | 1.41 |

Three causes, worst first:

1. **The stretched shape turned with the heading.** `flockShape` rotated the Length / Width
   axis with the flock's heading (up to 240°/s), so a long flock's tips swung round at r × ω:
   the spinning top.
2. **Spread scaled relative speeds.** Scaling every offset around the centre by s scales how
   fast birds move inside the flock by s. The formation's own spin was p95 92°/s.
3. **The simulation let birds fly at 0.4–1.6× cruise.** In a turn the outer birds raced round
   and the formation spun, even at the default controls (p5–p95 of speed within a frame:
   0.70–1.29× the mean).

**Fixes**

- **Speed band (sim).** Every bird keeps within ±12 % of the flock's mean speed at each step,
  inside the global min/max. A turning flock then turns on parallel paths, as real flocks
  do. Within a frame: 0.86–1.14× (p1–p99). Formation spin p95 92 → 45°/s. Leader
  tracking unchanged; the flock is a little tighter (RMS radius 104 → 85 px).
- **Shape on means (expressions).** The shape works on each bird's mean offset over a window
  W, and on the flock's mean axis of travel (a doubled-angle vector, so an axis has no front)
  and mean radius over the same W. The bird's quicker motion around its mean is kept as
  simulated. A mean over W moves at most 2r / W, so W is chosen from the live controls to
  keep what the shape adds under 0.35× cruise (`flockWindow`). Clumping magnifies radial
  motion (1 + k) times more; the first version missed that and Clumping 150 added 0.48×.
  The stretch fades where the mean axis is short (below 0.5), so a flock that keeps turning
  or stops goes round instead of swinging. At the default controls there is no window, and
  the flock is exactly the simulated one (the expression returns the baked value).
- **Running sums.** For any live W, the bake adds running sums (∫ dt): `Offset Sum` on every
  bird (a Point Control), `Axis Sum` and `Radius Sum` on Flock Center. A mean over W is then
  two `valueAtTime` calls, carried on past the bake at the end's own rate. Flock Center
  computes `Shape Window`, `Shape Axis` and `Shape Radius` once a frame for every bird to
  read. Computed per bird, the 8 s Sky comp rendered in 100 s against 54 s in round 3.
- **Scatter Speed** is capped so a bird never wanders faster than 0.1× cruise.
  AE's `wiggle(freq, amt)` was measured inside AE 27 at up to 3.3 × freq × amt px/s
  (median 1.0, p99 2.9). The cap assumes 4.

**Price:** a big or long shape reshapes and turns slowly (Length 250 / Width 55: a window of
about 10 s, so the stream keeps its overall direction through the loop). Spread 300 comes
out at 2.9×, because each bird's quick moves stay at their real size.

**Tests.** `test.mjs` (2,901 checks) runs the expression strings, Flock Center's and the
bird's, on a mock of AE. Through them it runs 20 birds of the demo flock for ten shape
settings: the shape adds at most 0.27× cruise (p99 ≤ 0.21), and at the defaults
nothing. It also checks the speed band, the controls' meaning (the axis has no front, the
stretch fades on a short axis), the window, and the sums carried on past the bake.

**Inside After Effects 27** (`make-demo.jsx` test mode, then `check-ae.mjs`, new):

- `make-demo.jsx` now writes `ae-dump.json`: the leader as AE sampled it, plus every bird's
  baked and final position and running sums, for three comps (Sky at Spread 80; Sky spread
  at Spread 300; Sky stretched at Length 250, Width 55, Angle 30, Clumping 60).
- `check-ae.mjs` runs the simulation in Node on that leader, and the expression math in
  Node on AE's own keys.
  - Simulation: within 0.0014 px; sums within 0.0006.
  - Flock Center's window, axis and radius match Node.
  - Final positions: within 0.003 px in all three comps.
- Read back inside AE:
  - At the default controls, birds move 0 px off the bake.
  - Spread 300 adds at most 0.26× cruise to a bird's speed (p99 0.18).
  - Sky shaped, with Scatter 12, adds at most 0.08×.
  - Fastest bird: 1.46× the flock's mean speed.
- No expression errors. Turn check is unchanged (41.3 % head-on, narrowest side view
  30.0 %). A rebuild removes 81 layers and makes 85.
- Build time: 24 s in a fresh AE session (sim 9.5 s, bake 15 s), 44 s in the next run in the
  same session. AE slows as a session goes on: the same 80 sliders took 1.7 s, then 3.4 s.
  A Point Control bakes like two sliders.
- **Looked at** (aerender, AE 27):
  - Contact sheets of Sky spread and Sky shaped.
  - Six consecutive frames of the Spread 300 flock in its dive: edge birds blur no longer
    than core birds, and every nose points along its path.
  - The shaped stream keeps its overall direction through the loop. Birds in the dive cross
    it sideways, a wide front going down, rather than the shape spinning.

## Round 5 · 2026-11-24 (user feedback: the flock ignores a moved leader)

The user: "even if I move the starting positions for the leader null, the flock starting
position remains the same."

**Looked at first** (a read-only script in the user's open AE project, a recovered copy of the
demo): in "Sky shaped" the Leader's first key had moved from (−160, 640) to (−748, 776), and
that comp's flock still started at the centre baked before, (38, 672): 580 px from the leader.
Nothing was broken. The birds are baked keys, so a leader edit needs a re-run of
Flock.jsx in that comp, and nothing in the comp said so. A duplicated comp makes it easier
to miss: its birds are the original's keys.

**Fix: the rig says so.** The bake stores the leader's path as simulated (`Leader Path` on
Flock Center). A guide text layer, `Flock Leader Check` (never rendered), samples the
leader's comp position at 49 times over the bake. When it is more than 2 px off anywhere, or
the leader can't be found, the layer shows at the top of the viewer: "Flock: the leader has
moved since the bake (up to N px)… re-run Flock.jsx in this comp." A re-run removes it with
the birds. The README says the same under *Run*.

**Tests.** `test.mjs` (2,905 checks) runs the check's expressions on a mock in which a missing
layer is an error, as in AE. It covers an unchanged leader (hidden), the first key moved
300 px (shown, "up to 300 px"), a 1 px difference (hidden) and a missing leader (shown).
`make-demo.jsx` adds the user's case in AE: a copy of Sky with the first key moved, the check
read before and after a re-run there, and how far the flock starts from the leader.

**Inside After Effects 27** (`make-demo.jsx` test mode, `out/ae-test-r5`):

- Leader's first key moved by (−590, +135) in a copy of Sky: the check shows ("moved since
  the bake (up to 605 px)"); in Sky it stays hidden.
- A re-run in that copy (71 s, in an AE session already slowed by earlier builds) starts the
  flock at the new leader, and the check goes. The centre starts 194 px from the leader's
  lead point (Sky: 66 px). That is normal: the moved leader starts twice as fast, and the
  flock is bigger, about 170 px RMS radius, with the leader at its edge. Node on the same
  move: 103 px.
- No expression errors; a rebuild now removes 82 layers (the check is one).
- `check-ae.mjs`: unchanged (sim within 0.0014 px, final positions within 0.003 px).
- The check's text and opacity were read back as values. The line itself wasn't seen in
  the viewer: aerender leaves guide layers out.

## Round 6 · 2026-11-24 (user feedback: "I ran Flock.jsx and nothing changed")

The user moved the leader's keys in `out/ae-test-r5/flock-demo.aep` (comp Sky, the active
item), then ran Flock.jsx: no dialog, nothing rebuilt. The leader check was doing its job
("moved since the bake (up to 530 px)"). A read-only look at the session's `$.global`
found the cause: **my test runner had left `FLOCK_NO_UI = true`** (plus `FLOCK_TEST_OUT`,
`FLOCK_DIR`). Globals outlive a script in an AE session, so the user's own run of Flock.jsx
loaded the code and skipped its dialog, silently. Running `make-demo.jsx` by hand would also
have repeated the test (a new project) instead of building the demo.

- Flock.jsx now uses the flag up: it reads `FLOCK_NO_UI === true` into a local and sets it
  back to false before deciding, so a flag left behind can only ever skip the run it was set
  for. `make-demo.jsx` reads its test settings into locals and clears them at once, and its
  log now lists the flags left at the end.
- `test.mjs` (2,907 checks): loading uses the flag up, and the next load in the same
  session runs the tool (it asks for a comp).
- Inside AE 27, in the user's session: cleared the leftover flags. Then loaded the new
  Flock.jsx with the flag set: no dialog, the flag back to false. No project touched.
- Not yet run inside AE: `make-demo.jsx`'s own clean-up (the next AE test logs it).

## Round 7 · 2026-11-24 (user feedback: the warning shows with no change; a more readable colour)

The user re-ran Flock.jsx (seed 9, spacing 65) with the leader unchanged, and the orange
warning still showed. They asked whether the seed caused it. It doesn't: the check reads only
the leader. Measured read-only in their project, comp Sky:

- At the 192 baked keys, the leader matched the stored path exactly (0 px).
- At the check's 49 sample times, between keys, the gap was up to 3.1 px, at the loop
  (3.3 s). Between keys AE blends the stored path in a straight line, which cuts a fast
  curve's corners. The 2 px threshold turned that into a false "moved". The demo path's
  slower loop stayed under it (0.7 px), so round 5's test never saw it.

**Fixes**

- The check compares the leader with the stored path **at the baked keys only** (up to
  200, read with `key(i).time` / `.value`), where the comparison is exact.
- **Readable text:** bold yellow (Arial Bold 30) with a 6 px near-black outline, instead of
  plain orange. One frame rendered in AE (`saveFrameToPng`, from a temporary comp, removed
  afterwards): readable over the light sky and over the birds.
- `test.mjs` (2,909 checks) adds the case: a 100 px circle at 1,000 px/s, unchanged. It
  differs by 2.2 px between keys and the check stays hidden; moved 5 px, it shows.
- Inside AE 27, on the user's Sky data (a temporary copy, removed): the new expressions
  read 0 px (hidden), and 5 px after nudging a key (shown). 8 ms an evaluation, viewer only.
- Existing check layers keep the old expression until Flock.jsx is re-run in their comp.
- `saveFrameToPng` writes its file only after the script that asked for it has ended:
  a script that waits for the file, or removes the comp first, gets nothing.

## Round 8 · 2026-11-24 (user request: see the leader, and roughly the flock, before re-running)

"It would be nice if at least the leader was visible for live-rendering, so that I could see
its path before running the script again. Significantly better if a shape layer could
provide a rough estimate of how the flock would appear around the leader."

**`Flock Preview`**, a guide shape layer, never rendered:

- **Always:** the leader's path over the work area (yellow on a dark line) and the leader
  now (a yellow dot). After Effects: 5 ms a frame.
- **While the leader check shows:** a guess at the new flock.
  - The centre comes from `FlockSim.guess`.
  - Each baked bird's place in its flock is moved there and scaled.
  - A ring marks twice the flock's radius.
  - The guess is worked out once a frame on a 3D Point effect (`Flock Estimate`: x, y, size
    factor), and the 80 dots and the ring read it.

**How the guess was chosen** (measured, Node, six paths incl. the user's Sky edit):

1. **Baked flock moved by the leader's change:** poor. Even a pure shift of the path missed
   by 93 px rms: the turbulence depends on absolute position, and the cruise speed depends
   on the path.
2. **Spring and smoothing models on the leader:** 0.9–2× the flock radius off (rms).
3. **The exact live re-run.** The simulation is causal, so running `FlockSim.run` in an
   expression up to the current frame gives exactly the re-run's flock (Node: within
   1e-14 px). Inside AE 27 it took 17 s a frame at 0.5 s and 47 s at 7.9 s.
   - A 2M-iteration loop: 5 s in an expression, 0.5 s in ExtendScript, 16 ms in Node.
   - **AE's expressions run plain code ~300× slower than V8.** Heavy code can't live in
     an expression.
4. **One "average bird"** with the flock's own follow force (dead zone included), the same
   seeded turbulence and the speed and turn limits, no neighbours (`FlockSim.guess`, in
   flock-sim.js so it shares the constants).
   - About one radius off (rms), but 74–92 % of the real birds fall within twice the radius.
   - Size: the flock grows with the leader's top speed above ~13 spacings a second
     (exponent 0.8), within ~10 % on the six paths.

**Tests.**
- `test.mjs` (2,918 checks): the guess expression equals `FlockSim.guess` at that frame,
  with the size factor; 74–82 % of three re-runs inside the ring; dots, ring, line and
  leader dot.
- **Inside AE 27** (`make-demo.jsx`, `out/ae-test-r8`):
  - The guess costs 20–32 ms a frame.
  - After the re-run, 93 % of 320 bird samples fell inside the ring, the centre 50–134 px
    off (ring radius 249 px).
  - Shown only in the moved copy.
  - No expression errors; no flags left in the session.
- **Looked at** (aerender of "Preview look", the guides made renderable, next to the re-run
  at the same frames):
  - The path line, the leader dot, the guess dots and the ring read over the sky and the
    birds.
  - At 0.5, 2, 4 and 7 s the guess sits on the re-run's flock and the ring contains it.

**Incident.** One of my launcher scripts was written through the shell, which collapsed its
doubled backslashes. After Effects showed the user a modal "Unterminated string constant"
alert. A syntax error stops the whole script before any line runs, so nothing changed.
Launchers are now written as files directly and parsed in Node before they are sent.
