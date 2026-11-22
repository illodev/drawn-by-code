---
name: after-effects
description: Building After Effects tools from drawn-by-code — ExtendScript (.jsx) that bakes code-made motion into native AE layers, keyframes and slider-driven expressions, tested inside the user's After Effects. Use it when the user works in After Effects, asks for an AE script or rig, wants to move motion between code and AE, or when working on sandbox/2026-11-21-ae-flock-rig.
---

# After Effects

**Code does the count, After Effects keeps the look.** For a motion designer who lives in
AE, the useful output is not a rendered video but native layers in their comp: keyframes
they can graph-edit, their own effects stack, and a controls null with sliders so they
art-direct by hand instead of re-prompting. Code earns its place where motion follows a
rule across many elements (flocks, draw-on order, staggers, physics); hero timing and feel
stay in the graph editor.

Worked example: `sandbox/2026-11-21-ae-flock-rig/` (a flock that follows a keyed null).

## Shape of a tool

| Piece | Why |
|---|---|
| `*-sim.js`, plain **ES3** | The logic. Runs unchanged in ExtendScript, Node and the engine, so the preview, the tests and the AE bake are the same numbers |
| `*-ae.jsx` | The AE half: dialog, reading the comp, building layers, expressions |
| `build.mjs` | Joins them into **one** `.jsx` for the designer and lints for ES3 (a syntax error in AE is only an alert) |
| `scene.js` | Engine preview drawn the way the rig will look: judge the motion here, it renders in seconds |
| `make-demo.jsx` | Builds a demo project from nothing; with a test flag it renders, logs and saves. It is the test |

Expose `build(comp, …, options)` without UI (`$.global.X_NO_UI`) so the test can call it.

## ExtendScript is ES3

- No `let`/`const`, arrows, template strings, `JSON`, `Object.keys`, `Array` methods
  (`forEach`, `map`, `indexOf`…), trailing commas. `toSource()` + `eval` replace JSON.
- No JIT. Alias `Math.sqrt` & co. to locals; keep inner loops on dense arrays. A hashed
  object keyed by big numbers converts every key to a string: a neighbour grid built that
  way was 30× slower. Measured: 80 boids over 264 steps of 2 substeps = 5.5 s in AE 2026.
- Seeded randomness that agrees bit for bit across engines: Park-Miller (`s * 16807 %
  2147483647`, exact in doubles). Avoid hashes that overflow 2^53.
- Testing an ES3 file in Node: load it with `new Function(src + 'return X')()`, not
  `vm.runInContext` (global lookups there are ~10× slower and skew timings).

## Scripting pitfalls (each one cost a run)

- **Removing the last Time Remap key turns time remapping off** and hides the property;
  setting its expression then fails («the property or a parent property is hidden»). Keep
  the two keys AE adds; the expression overrides them.
- Adding a property (an effect, a shape) **invalidates references** to its siblings:
  re-fetch by name or matchName after every `addProperty`.
- Use **matchNames** (`ADBE Transform Group`, `ADBE Position`, `ADBE Rotate Z`, `ADBE
  Scale`, `ADBE Time Remapping`, `ADBE Effect Parade`, `ADBE Slider Control`,
  `ADBE Root Vectors Group`…): display names change with the AE language.
- **Comp-space position of any layer** (parented, expressions, anchor): add a temporary null
  whose Position expression is `var L = thisComp.layer(<index>); var p =
  L.toComp(L.anchorPoint); [p[0], p[1]]`, read it with `valueAtTime(t, false)`, remove it.
  Reference by index there (names can repeat); in expressions you leave behind, by name.
- Time remap: enable it **before** setting `startTime`/`inPoint`/`outPoint` (only then can
  a layer outlast its source), and move the layer before keying it (keys move with it).
- `layer.duplicate()` lands directly above the original: create the top layer first.
- Batch keys with `setValuesAtTimes`; give 2D layers 3-element position/scale values.
- `dimensionsSeparated` exists only on Position.
- Wrap the build in `app.beginUndoGroup`. Store the settings on the controls layer's
  `comment` (`toSource()`): a re-run pre-fills the dialog, replaces the generated layers by
  name prefix and keeps the controls and the values the designer set.
- Make generated layers shy and turn on `comp.hideShyLayers`; switch off (don't delete) the
  user's source layer.

## Running it in the user's After Effects

- `AfterFX.exe -r <script.jsx>` (`C:\Program Files\Adobe\Adobe After Effects
  2026\Support Files\`) sends the script to the running AE, or launches one. **Prefer an AE
  that is already open:** a cold start on the user's machine took over 10 minutes (font
  scan) and once showed no window at all. `Get-Process AfterFX` → `MainWindowTitle`
  non-empty = ready.
- Writing files from a script needs *Allow Scripts to Write Files and Access Network*
  (`Pref_SCRIPTING_FILE_NETWORK_SECURITY` in the prefs file). Read it, never change it:
  ask the user.
- Test mode: `app.beginSuppressDialogs()`, results to a text log, stills through the
  render queue (`outputModule.templates` names vary per install: pick by regex, e.g.
  `/png/i`, `/h\.?264/i`), save the `.aep` into the experiment's `out/`. Don't
  `app.quit()` an AE the user may be using; leave the demo open for them.
- While a script runs, AE's window doesn't repaint, and its H.264 output only grows at the
  end: measure CPU (`Get-Process AfterFX`.CPU twice) before calling it stuck.
- Render cost is real: 80 precomp layers with motion blur ≈ 4 s a frame on the user's
  machine. Tell the designer to pre-render once approved.
- Look at the AE render like any other: full-resolution crops, a contact sheet, a run of
  consecutive frames through the hardest moment; commit it as `render/<name>.mp4`.

## Lessons

<!-- date · experiment · one-line lesson -->
- 2026-11-21 · ae-flock-rig · A spring from every agent to one leader point squeezes a
  flock into a ball when tightened: give it a dead zone the size of the flock, and let the
  flock aim ahead on the leader's path (`Lead`) so the null sits inside it.
- 2026-11-21 · ae-flock-rig · Orientation from velocity jitters (p95 16° a frame): cap the
  turning rate in the simulation itself (sideways acceleration ≤ speed × ω), smooth the
  heading, and trust it less when the motion is mostly towards the camera.
