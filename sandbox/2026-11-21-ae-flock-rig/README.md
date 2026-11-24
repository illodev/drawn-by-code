# Flock rig for After Effects

`Flock.jsx` turns one bird precomp and one keyed null into a flock of native After Effects
layers. You key the leader and design the bird; the script runs a flocking simulation and
bakes every bird's position, rotation, scale and flap timing as keyframes. A `Flock
Controls` null carries sliders that drive light expressions, so the look stays live.

## Set up

1. **Bird precomp.** One flap cycle, looping, in the precomp's **work area** (the script
   reads the cycle length from it). Centre the bird in the precomp and draw it facing right
   (or left: the dialog asks). Anchor point where it should pivot.
   - **Turn drawing (optional, recommended).** After the work area, add a head-on view of
     the same bird flapping (body end-on, both wings spread), and a **composition marker**
     whose comment contains `turn` at its start; give the marker a duration equal to that
     cycle (or leave it at 0 to use the side cycle's length). Birds that turn around level
     (towards or away from the camera) then show it mid-turn instead of squashing
     sideways. The dialog says whether it found one. The demo bird has one.
2. **Style the bird layer, not the precomp copies.** Effects, blending mode, tint, a
   layer style on the bird layer in your main comp: every generated bird is a duplicate of
   it and inherits all of it.
3. **Leader.** A null (any layer works) keyed along the path the flock should travel.
   Parenting, expressions and Auto-Orient on it are fine: the script reads its comp-space
   position.
4. **Work area** of the main comp = the frames to bake.

## Run

Select the bird layer and the leader (optional, it pre-fills the dialog), then
**File › Scripts › Run Script File… › Flock.jsx**. To keep it in the menu, copy it to
`…/Adobe After Effects 2026/Support Files/Scripts/`.

| Setting | What it does |
|---|---|
| Flock name | Prefix of the generated layers. Two names = two independent flocks in one comp |
| Birds | How many layers to create |
| Spacing (px) | The usual gap between neighbours; the flock's size grows with it |
| Follow (0–100) | How closely the flock tracks the leader (loose swirl → tight) |
| Lead (s) | The flock aims this far ahead on the leader's path, so the null sits inside it rather than in front (0 = it trails the null) |
| Turbulence (0–100) | Wandering inside the flock |
| Glide (0–100) | Birds flap faster climbing and slower diving |
| Seed | Same settings, a different flock |
| Pre-roll (s) | Simulated before the work area, so frame 1 is already a formed flock |
| Key every | 1 = a key per frame. 2 halves the keyframes (lighter project, still smooth) |

Running it again replaces that flock's birds and keeps its `Controls` layer and the
values you set on it; the dialog remembers the last settings.

**Changed the leader? Re-run.** The birds are a baked simulation, so moving, re-timing or
re-shaping the leader's path changes nothing until you run Flock.jsx again *in that comp*.
That includes a copy of the comp: its birds are the original's keys. While the two differ,
a yellow line at the top of the viewer says so and by how much (`Flock Leader Check`, a
guide layer: never rendered).

**See roughly where the new flock goes before re-running.** `Flock Preview` (a guide layer:
in the viewer and RAM previews, never in renders) always draws the leader's path over the
work area, and the leader as a yellow dot. While the leader differs from the bake, it also
shows a rough guess at the new flock:
- **Centre:** one "average bird" flying the new path with the flock's own follow,
  turbulence and limits.
- **Dots:** the baked flock's formation around that centre, resized for the new path's
  speed.
- **Ring:** twice the flock's radius.

On the demo's moved leader, 93 % of the re-run's birds fell inside the ring, and the guess's
centre was 50–135 px from the real one. It is a guide for blocking the path. The exact flock
needs the re-run: running the whole simulation in an expression would be exact, but it took
5–47 s a frame (After Effects runs expression code about 300× slower than a browser does).
The guess costs 20–30 ms a frame, and only while the leader has moved. It uses the
settings of the last run. Turn the layer's eye off to hide it.

## What you get

- `Flock Bird 001 … N`: duplicates of your bird layer, **shy** (the comp's "Hide shy
  layers" switch is turned on), motion blur on, nearest-on-average bird on top. Each has
  keyed Position, Rotation, Scale and `Facing` / `Flap Phase` sliders, and Time Remap
  driven by an expression.
- `Flock Center`: a disabled guide null holding the flock's centre, with keyed `Radius`
  (its size) and `Heading` (its axis of travel) sliders, plus `Axis Sum` and `Radius Sum`:
  running sums the shape controls read to average over time (see *How it moves*). Its
  `Shape Window`, `Shape Axis` and `Shape Radius` work those averages out once a frame for
  every bird. `Leader Path` is the leader's path as simulated. Each bird also carries an
  `Offset Sum`. Leave these alone.
- `Flock Leader Check`: the guide text line that appears when the leader has moved since
  the bake.
- `Flock Preview`: the guide shape layer with the leader's path, the leader, and (while the
  leader has moved) the rough guess at the new flock; its `Flock Estimate` effect holds the
  guess (x, y, size factor).
- `Flock Controls`: the live sliders. No re-run needed for these; their names say what
  they do in the Effect Controls panel:

| Slider | Default | Effect |
|---|---|---|
| **Shape of the flock** | | |
| Spread % (flock size) | 100 | Scales every bird's distance from the centre: tighter / looser flock |
| Length % (along travel) | 100 | Stretches the flock along its direction of travel (a stream) or squashes it (a wide front) |
| Width % (across travel) | 100 | The same across the direction of travel: 50 = a narrow ribbon |
| Shape Angle (0 = travel) | 0° | Turns the Length / Width axis away from the direction of travel (e.g. 45° = a diagonal sheet) |
| Clumping (+ core, - even) | 0 | Above 0: a denser core with stragglers on the edges; below 0: birds evened out across the flock. Type values outside the slider, -90 … 300 |
| Scatter px (per bird) | 0 | Each bird wanders this far from its place in the flock, its own way |
| Scatter Speed (0 = still) | 0.5 | Wanders per second; 0 = a fixed random offset per bird. Capped for big Scatter amounts, so a bird never wanders faster than a tenth of the flock's speed |
| Scatter Seed | 1 | Another random arrangement of the scatter |
| **The birds** | | |
| Bird Size % | 100 | Overall size of the birds |
| Size Variation % (+/-) | 20 | ± random size per bird |
| Perspective % (depth size) | 100 | How much depth changes size (0 = all the same size) |
| Orient % (0 = always level) | 100 | How much birds tilt along their path |
| Turn Width % (0 = edge-on) | 30 | The narrowest a bird gets while turning around level: 0 = squashed to a sliver, 100 = an instant flip |
| Head-On % (turn drawing) | 60 | How much of a level turn shows the head-on drawing, if the precomp has one (0 = never) |
| Flap Speed % | 100 | Flapping speed; 100 = the precomp's own speed |
| Flap Desync % (0 = unison) | 100 | 0 = every bird flaps in unison, 100 = each on its own phase |

Controls left by a round-1 build (`Spread`, `Orient`…) are renamed in place on a re-run, with
their values kept. For a different flock rather than a different shape, change **Seed** in
the dialog and re-run.

The shape controls never make birds fly faster than birds fly (*How it moves* says how).
The price: a big or long flock reshapes and turns its shape slowly. A long stream on a
winding path keeps roughly the direction of its overall travel rather than swinging round
each bend, which is what real flocks do too. A large Spread also comes out a little smaller
than the number (Spread 300 ≈ 2.9×), because birds keep their own quick moves at their
real size.

The original bird layer is switched off and kept as the template for the next run.

## How it moves

Each bird is steered by its neighbours (keep a gap, match their heading, stay with them),
pulled towards the leader by a damped spring that leaves the flock room to breathe, and
nudged by slow turbulence. It runs in 3D: depth becomes scale (Perspective) and the layer
order. Birds have a top speed, a minimum speed (they never hover: a still leader makes the
flock circle it) and a minimum turning radius. Within a flock they fly at nearly the same
speed (±12 % of the flock's mean). So a turning flock turns the way real ones do, each bird
on a parallel path. It doesn't spin like a top with its outer birds racing round.

**Shape without speed.** Scaling a bird's distance from the centre also scales how fast it
moves relative to the centre. Swinging a long flock round with its heading moves its tips
faster the longer it is. Done directly, either sends edge birds racing (in round 2, up to
6× the flock's speed in the "Sky shaped" demo). So the shape controls work on each bird's
**mean** offset over a window of time, and on the flock's mean axis of travel over the same
window. The window is long enough that the shape never adds more than about a third of the
flock's cruising speed. Each bird's quicker moves around its mean are kept as simulated.
The bigger or longer the shape, the longer the window. At the default controls there is
no window, and the flock is exactly the simulated one. Measured on the demo path:

| Controls | Fastest bird / flock speed, round 2 | Round 3 |
|---|---|---|
| Defaults | 1.76 | 1.29 |
| Spread 300 | 3.42 | 1.61 |
| Length 250, Width 55 | 5.18 | 1.36 |
| Spread 200, Length 250, Width 55 | 9.40 | 1.41 |

Turning around, the 2D layer has to fake a 3D move:

- **Through vertical** (a dive or a climb that comes out the other way): the bird points
  up or down, where mirroring it only swaps which side its wings are on, so it flips there
  at once and never goes thin.
- **Level, towards or away from the camera:** the bird squashes sideways through the turn,
  never narrower than *Turn Width*, and shows the head-on drawing for the middle of it if
  the precomp has one. Each bird takes its own time (0.3–0.5 s) and its own moment, so a
  flock that reverses doesn't go edge-on all at once.
- Rotation never steps more than 25° a frame, so motion blur never smears a spin.

## Limits of this proof of concept

- 2D comp: depth is faked with scale and a fixed stacking order. A camera move won't
  parallax the flock.
- Birds don't avoid obstacles or the frame edge; only the leader steers.
- Simulation settings need a re-run; the sliders don't. Measured in After Effects 2026:
  80 birds over 8 s at 24 fps build in about 8 s (5.5 s simulating, 2.6 s baking). Time
  grows with birds × length.
- Rendering is the heavy part: those 80 precomp layers with motion blur took about 4 s a
  frame on the test machine. Once approved, pre-render the flock.

## For the repo

| File | |
|---|---|
| `flock-sim.js` | The simulation (plain ES3: runs in After Effects, Node and the engine) |
| `flock-math.js` | The live controls' math: pasted into every expression, loaded by the preview |
| `flock-ae.jsx` | The After Effects half: dialog, sampling, layers, expressions |
| `build.mjs` | `node sandbox/2026-11-21-ae-flock-rig/build.mjs` → `Flock.jsx`, with an ES3 lint |
| `test.mjs` | Runs the very expression strings against a mock of AE and checks the simulation's poses |
| `make-demo.jsx` | Builds a demo project (bird precomp with a turn drawing, leader, flock). With `$.global.FLOCK_TEST_OUT` set it logs every step, reads bird speeds back from AE, writes `ae-dump.json` and saves the project for `aerender`: the test |
| `check-ae.mjs` | `node …/check-ae.mjs <test folder>`: compares that dump with Node running the same code (the simulation on AE's leader, the expressions on AE's keys) |
| `scene.js` | Engine preview of the same simulation, drawn through `flock-math.js` the way the rig shows it |
