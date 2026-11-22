# Field effector for After Effects

`FieldEffector.jsx` gives any number of 2D layers a MoGraph-style effector. You key a null
(the field); every layer it passes over scales, moves, turns, fades, tints or scrubs its
precomp, by how deep inside the field it sits. It all stays live, as expressions and
sliders: change the look or re-key the field and nothing needs re-running.

## Set up

1. **Lay out the layers.** Any 2D layers: shapes, text, precomps, footage, or nulls that
   parent groups. Each one feels the field at its **Position**, so put anchor points where
   a layer should react (usually its centre).
2. **Animate them as usual.** Their own Position, Scale, Rotation and Opacity keys keep
   working: the field adds to them.
3. For **precomp time**, put the precomp's reaction in its **work area** (the weight scrubs
   it: 0 = first frame, 100 = last).

## Run

Select the layers, then **File › Scripts › Run Script File… › FieldEffector.jsx**. To keep
it in the menu, copy it to `…/Adobe After Effects 2026/Support Files/Scripts/`.

| Button | What it does |
|---|---|
| Apply to selected | Builds the effector the first time (`FX Effector`, `FX Field 1` placed on the layers, sized to them) and adds the selected layers. Running it again on the same layers rewrites the rig's expressions, never stacks them |
| Add field | Another field null (`FX Field 2`…), combined by its Blend mode. Every layer picks it up |
| Remove from selected | Takes the rig off: effects and expressions go, the layers' own values come back |

The effector name (`FX`) prefixes everything, so two names make two independent effectors
in one comp. **Tint** adds a Tint effect to each layer; **Precomp time** turns on Time
Remap for precomp layers.

## What you get

**`FX Field 1`**: the null you key. Its position moves the field, its rotation and scale
shape it (scale it 200 × 50 % and a sphere becomes an ellipse). A locked guide layer,
`FX Field 1 Gizmo`, draws its edge and full-weight outline in the viewer; it doesn't render.

| Control | Default | Effect |
|---|---|---|
| Shape | Sphere | Sphere, Box, Linear (a wipe: full on the null's left, its −X side), Noise (everywhere) |
| Size | ⅕ of the layers' spread | Sphere radius, box half-side; for Linear, the ramp is Size × Falloff |
| Falloff | 50 | % of Size over which the weight ramps from 0 to full (0 = a hard edge) |
| Curve | Smooth | Linear, Smooth, Ease In (soft at the edge), Ease Out (soft at the full end), Custom |
| Custom Curve | keyed 0 → 100 | With Curve on Custom, **the shape of these keys is the falloff**: edit them in the graph editor (a key above 100 overshoots). Only their shape counts, not where they sit in time |
| Strength | 100 | This field's share, % |
| Invert | off | Full outside, nothing inside |
| Edge Noise | 0 | px of organic wobble on the edge |
| Noise Size / Speed / Seed | 150 / 0.5 / 1 | The noise used by Edge Noise and the Noise shape: cell size (px), evolution per second, a different pattern |
| Blend | Max (Field 2+: Add) | How this field combines with the ones above it: Max, Add, Subtract, Multiply, Min. Ignored on Field 1 |

**`FX Effector`**: what the field does at full weight. Keyable like any slider.

| Slider | Default | Effect at full weight |
|---|---|---|
| Strength | 100 | Master amount, % |
| Offset X / Y | 0 | Moves the layer, px |
| Push | 0 | Moves it away from a sphere's or box's centre, or along a Linear field's X axis, px |
| Scale | 150 | % of the layer's own scale |
| Rotation | 0 | Added degrees |
| Opacity | 100 | % of the layer's own opacity |
| Tint / Tint Color | 0 / orange | How far the layer turns to the Tint Color, %; its alpha stays (needs the Tint option) |

**On each layer**: a `FX Weight` slider (0–100, the combined weight every channel reads;
pick-whip it for your own expressions), expressions on Anchor Point, Scale, Rotation and
Opacity, and optionally a `FX Tint` Tint effect (both colours on the Tint Color, Amount from
the weight) and a Time Remap expression.

## How it works

- **Position is never touched.** The weight is measured where the layer's Position puts
  it, keys and all. Offset and Push go into the **Anchor Point**, corrected for the layer's
  rotation, scale and parent, which moves the layer exactly as far as a Position change
  would, and it still turns and scales about its own centre. (Putting them on Position
  instead would make Scale and the others measure the weight where the field had already
  pushed the layer.)
- **One weight per layer.** `FX Weight` is computed once; Scale, Rotation, Opacity, tint
  and time read it, so they always agree.
- **Fields are found through Layer Controls** (`Field 1`, `Field 2`… on the Effector):
  rename a field null freely; delete one and it is simply skipped.
- The field math (`field-math.js`) is the same code the repo's preview and tests run. Its
  noise gives the same values in every expression engine.

## Limits

- **2D layers only.** 3D layers are skipped (listed after Apply).
- **One effector per layer.** If a property already has an expression (yours, or another
  effector's), the rig leaves it alone and lists it; that channel doesn't apply there.
- **Don't rename `FX Effector`**: the layers find it by name. To start over under another
  name, Remove, then Apply with the new name.
- Layers with **Auto-Orient**: Offset and Push ignore the path rotation (a warning lists them).
- **Changed a precomp's work area?** Apply again to those layers: its start and length are
  written into the Time Remap expression.
- **Cost:** every layer evaluates every field each frame. Measured on the demo (91 precomp
  layers, one field, tint and time on): Apply takes 2–5 s; one frame's 819 expressions
  evaluate in 0.3 s; `aerender` renders the 9 s demo in 20 s. Hundreds of layers and
  several fields slow previews down: pre-render once the look is approved.

## For the repo

| File | |
|---|---|
| `field-math.js` | The field math, plain ES3: weights, curves, blends, noise, the anchor correction |
| `field-glue.js` | The part of the expressions that reads After Effects (field nulls, the Custom Curve keys) |
| `effector-ae.jsx` | The After Effects half: dialog, layers, controls, gizmo, expressions |
| `build.mjs` | `node sandbox/2026-11-21-ae-field-effector/build.mjs` → `FieldEffector.jsx`, with an ES3 and ASCII lint |
| `test.mjs` | Runs the very expressions the script writes against a mock of AE's expression objects (15,000 checks) |
| `demo-spec.js` | The demo, shared by `make-demo.jsx` and `scene.js` so they can't drift |
| `make-demo.jsx` | Builds the demo project. With `$.global.FX_TEST_OUT` set it also checks every expression against `field-math.js` inside AE, a re-run, a removal, an added and a deleted field, logs (`review/ae-log.txt`) and saves the project: the AE test. `aerender` then renders it (below) |
| `scene.js` | Engine preview of the demo, weighed by the same `field-math.js` |

Testing inside After Effects (with the user's go-ahead: the demo opens a new project). Run a
small runner script in AE (File › Scripts › Run Script File…, or `AfterFX.exe -r runner.jsx`)
that sets `$.global.FX_TEST_OUT` (a folder in `out/`) and `$.global.FX_DIR` (this folder),
then `$.evalFile` on `make-demo.jsx`. It writes `ae-log.txt` and saves
`field-effector-demo.aep` there. Render that project with `aerender`, which runs in its own
process and leaves the user's After Effects free:

```powershell
& "C:\Program Files\Adobe\Adobe After Effects 2026\Support Files\aerender.exe" -project out\ae\field-effector-demo.aep -comp "Field Effector demo" -s 0 -e 215 -RStemplate "Best Settings" -OMtemplate "H.264 - Match Render Settings -  5 Mbps" -output out\ae\field-effector-ae.mp4
```

`render/ae-field-effector.mp4` is that render (After Effects), re-encoded with its BT.709 tags.
