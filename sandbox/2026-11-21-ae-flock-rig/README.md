# Flock rig for After Effects

`Flock.jsx` turns one bird precomp and one keyed null into a flock of native After Effects
layers. You key the leader and design the bird; the script runs a flocking simulation and
bakes every bird's position, rotation, scale and flap timing as keyframes. A `Flock
Controls` null carries sliders that drive light expressions, so the look stays live.

## Set up

1. **Bird precomp.** One flap cycle, looping, in the precomp's **work area** (the script
   reads the cycle length from it). Centre the bird in the precomp and draw it facing right
   (or left: the dialog asks). Anchor point where it should pivot.
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

## What you get

- `Flock Bird 001 … N`: duplicates of your bird layer, **shy** (the comp's "Hide shy
  layers" switch is turned on), motion blur on, nearest-on-average bird on top. Each has
  keyed Position, Rotation, Scale and a `Flap Phase` slider, and Time Remap driven by an
  expression.
- `Flock Center`: a disabled guide null holding the flock's centroid (Spread scales around it).
- `Flock Controls`: the live sliders. No re-run needed for these:

| Slider | Default | Effect |
|---|---|---|
| Spread | 100 | Scales every bird's distance from the centroid (tighter / looser flock) |
| Bird Size | 100 | Overall size of the birds |
| Size Variation | 20 | ± random size per bird |
| Perspective | 100 | How much depth changes size (0 = all the same size) |
| Orient | 100 | How much birds rotate along their path (0 = always level) |
| Flap Speed | 100 | Flapping speed; 100 = the precomp's own speed |
| Flap Desync | 100 | 0 = every bird flaps in unison, 100 = each on its own phase |

The original bird layer is switched off and kept as the template for the next run.

## How it moves

Each bird is steered by its neighbours (keep a gap, match their heading, stay with them),
pulled towards the leader by a damped spring that leaves the flock room to breathe, and
nudged by slow turbulence. It runs in 3D: depth becomes scale (Perspective) and the layer
order. Birds have a top speed, a minimum speed (they never hover: a still leader makes the
flock circle it) and a minimum turning radius. Turning around is a quick squash of the
horizontal scale through zero, the usual 2D cheat, so a bird never flies upside down.

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
| `flock-ae.jsx` | The After Effects half: dialog, sampling, layers, expressions |
| `build.mjs` | `node sandbox/2026-11-21-ae-flock-rig/build.mjs` → `Flock.jsx`, with an ES3 lint |
| `make-demo.jsx` | Builds a demo project (bird precomp, leader, flock). With `$.global.FLOCK_TEST_OUT` set it renders, logs, saves and quits: the test |
| `scene.js` | Engine preview of the same simulation, drawn the way the rig shows it |
