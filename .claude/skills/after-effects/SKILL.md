---
name: after-effects
description: Building After Effects tools from drawn-by-code — ExtendScript (.jsx) that bakes code-made motion into native AE layers, keyframes and slider-driven expressions, or builds live expression rigs, tested inside the user's After Effects. Use it when the user works in After Effects, asks for an AE script, rig or expression, wants to move motion between code and AE, or when working on sandbox/2026-11-21-ae-flock-rig, sandbox/2026-11-21-ae-field-effector or sandbox/2026-11-21-ae-morph-fixer.
---

# After Effects

**Code does the count, After Effects keeps the look.** For a motion designer who lives in
AE, the useful output is not a rendered video but native layers in their comp: keyframes
they can graph-edit, their own effects stack, and a controls null with sliders so they
art-direct by hand instead of re-prompting. Code earns its place where motion follows a
rule across many elements (flocks, draw-on order, staggers, physics); hero timing and feel
stay in the graph editor.

Worked examples: `sandbox/2026-11-21-ae-flock-rig/` (baked: a flock that follows a keyed
null), `sandbox/2026-11-21-ae-field-effector/` (live: a MoGraph-style field effector, all
expressions) and `sandbox/2026-11-21-ae-morph-fixer/` (a one-shot fix to the designer's own
keys: matching path points so shapes morph cleanly).

**Bake or live?** If the motion has memory (velocity, collisions, contact), simulate in the
script and bake keys. If each frame depends only on where things are at that frame (a
field's falloff, a stagger by distance, gears), leave live expressions: the designer can
re-key the driver and nothing needs re-running.

## Shape of a tool

| Piece | Why |
|---|---|
| `*-sim.js`, plain **ES3** | The logic. Runs unchanged in ExtendScript, Node and the engine, so the preview, the tests and the AE bake are the same numbers |
| `*-ae.jsx` | The AE half: dialog, reading the comp, building layers, expressions |
| `build.mjs` | Joins them into **one** `.jsx` for the designer and lints for ES3 (a syntax error in AE is only an alert) |
| `scene.js` | Engine preview drawn the way the rig will look: judge the motion here, it renders in seconds |
| `make-demo.jsx` | Builds a demo project from nothing; with a test flag it renders, logs and saves. It is the test |

Expose `build(comp, …, options)` without UI (`$.global.X_NO_UI`) so the test can call it.

A **live** rig adds two pieces: `*-math.js` (ES3, ASCII) that `build.mjs` pastes, comments
stripped, into every expression it writes, and the engine preview loads with `uses`; and a
`test.mjs` that runs **the very expression strings** the script writes against a mock of
AE's expression objects. The mock must behave like AE (next section), or it passes code
that AE runs wrong.

## Expressions a rig leaves behind

- **`effect("X")(1)` and `transform.x` are Property objects**, not numbers. Arithmetic
  converts them; `===`, `!==` and `if ()` don't: a checkbox Property at 0 is still truthy,
  a dropdown Property never `=== 2`. Read every control with `.value`. A mock that hands
  out bare numbers hides this; return objects with `valueOf` and `.value`.
- **An expression only sees other properties after their expressions.** To move layers by
  a rule measured at their own position, keep Position free and put the move in the Anchor
  Point, corrected by the inverse of the layer's rotation and scale (and its parent, via
  `parent.fromComp`): `anchor -= S⁻¹ R⁻¹ d` moves the layer by exactly `d`, pivot included.
- Compute a shared quantity once in a **slider on the layer** (a weight 0–100) and have the
  other channels read it: one evaluation, and the channels can't disagree.
- Find helper layers through **Layer Controls**, not names, so renaming them is safe. But
  deleting the layer a Layer Control points to **re-aims it at another layer**: read its
  controls inside `try`, skip it if they're missing, and skip a layer already counted.
- AE **switches an expression off** when it errors («Expression disabled»). A script that
  rewrites it must also set `expressionEnabled = true`.
- Mark the rig's expressions with a first-line comment (`// <name> effector: …`): a re-run
  rewrites its own and leaves the designer's alone, and reports what it kept.

## ExtendScript is ES3

- No `let`/`const`, arrows, template strings, `JSON`, `Object.keys`, `Array` methods
  (`forEach`, `map`, `indexOf`…), trailing commas. `toSource()` + `eval` replace JSON.
- No JIT. Alias `Math.sqrt` & co. to locals; keep inner loops on dense arrays. A hashed
  object keyed by big numbers converts every key to a string: a neighbour grid built that
  way was 30× slower. Measured: 80 boids over 264 steps of 2 substeps = 5.5 s in AE 2026.
- Seeded randomness that agrees bit for bit across engines: Park-Miller (`s * 16807 %
  2147483647`, exact in doubles). Avoid hashes that overflow 2^53.
- **ExtendScript's `sort` is not stable** (V8's is). A comparator whose ties matter must
  break them by index (`(a.f - b.f) || (a.idx - b.idx)`), or ExtendScript and Node give
  different results: a rebuild handed its spare points to other gaps, 20 px apart.
- **ES3 reserves words that modern JS doesn't** (`short`, `long`, `int`, `char`, `float`,
  `double`, `final`, `static`, `public`, `private`, `package`, `goto`…), **even as property
  names**: `{ short: 'x' }` or `res.long` stops the whole script ("Illegal use of reserved
  word"). Lint for them in `build.mjs` (see the morph fixer's), in every file AE runs.
- A **dockable panel**: AE runs a script from `Scripts/ScriptUI Panels` with `this` = the
  Panel. Wrap the built file as `(function (HOST) { … })(this)` and build into `HOST` when
  `HOST instanceof Panel`, else a `palette` Window. Long reports go in a status line's
  `helpTip`, a guide behind a `?` button (a `palette`, not `alert`: it stays open while the
  user works), settings in `app.settings`. A test can drive it: set the controls, then
  `button.notify('onClick')`; build into `win.add('panel')` to take the docked path.
- **Installing it needs no admin rights:** copy the script into the user's own
  `%APPDATA%\Adobe\After Effects\<major.minor>\Scripts\ScriptUI Panels\` (macOS
  `~/Library/Preferences/Adobe/After Effects/<major.minor>/…`; `<major.minor>` from
  `app.version`), the folder File › Scripts › Install ScriptUI Panel… uses. Give a floating
  run an Install button (`File($.fileName).copy(dest)`). AE reads the folder at launch only:
  restart, then the file name (with `.jsx`) is the Window menu entry, so name the file the way
  the tool should be called.
- **ScriptUI doesn't wrap text reliably:** a `multiline` statictext re-wraps at a width of its
  own and the guide came out 351 × 986 px instead of ~420 × 650. Wrap in code and add one
  single-line statictext per line; a text that changes later needs its widest line measured
  up front (`graphics.measureString`), since it keeps its first size.
- **AE 2026 doesn't draw ScriptUI fonts:** `graphics.font = ScriptUI.newFont(…, 'BOLD',
  size + 3)` is accepted and reads back Bold / 15, but every statictext still draws as plain
  12 px Adobe Clean (Arial too). Mark headings with the pen instead
  (`graphics.foregroundColor = graphics.newPen(PenType.SOLID_COLOR, [1, 1, 1], 1)`: white on
  the grey body text). Only a screenshot shows this.
- **AE 27's theme:** `app.themeColor` is retired ("Use getAppTheme, getUseReducedContrast,
  and getAllowedAppThemes"); those three are **properties**, not functions:
  `app.getAppTheme` is `"light"`, `"dark"` or `"darkest"`. ScriptUI's own
  `graphics.foregroundColor`/`backgroundColor` read `undefined`, so a pen you set must follow
  `app.getAppTheme` (black on light, white otherwise); leave body text unset and AE colours it.
- Internal names for what depends on a path's points (AE 27): operators `ADBE Vector Filter -
  Trim`, `- Zigzag`, `- PB` (Pucker & Bloat), `- Roughen` (Wiggle Paths); a stroke's `ADBE
  Vector Stroke Dashes` (dashes exist when it holds `ADBE Vector Stroke Dash 1`), `ADBE Vector
  Stroke Taper` (`… Taper Start Length`, `… End Length`, `… StartWidthPx`, `… EndWidthPx`),
  `ADBE Vector Stroke Wave` (`… Taper Wave Amount`). A mask picker in an effect or in text
  Path Options (`ADBE Text Path`) has `propertyValueType` `PropertyValueType.MASK_INDEX`
  (6422) and the mask's index as value. Dump a layer's tree in AE before relying on a name.
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
- **`$.evalFile` doesn't put a file's top-level `var` on `$.global`.** Read the file and
  `eval` it where you need it, or assign `$.global.X` inside the file.
- Dropdown Menu Control: `addProperty('ADBE Dropdown Control')`, then
  `property(1).setPropertyParameters([...])`, which invalidates the effect: re-fetch it by
  index before naming it. Expressions read it 1-based (`.value`).
- **A Fill effect replaces the layer**: its Opacity is the opacity of the fill, so a Fill at
  0 % makes the layer vanish (no error, just an empty render). To blend a layer towards a
  colour by an amount, use **Tint** (`ADBE Tint`) with Map Black To = Map White To = the
  colour and Amount to Tint (0–100) as the amount: alpha stays. Read `maxValue` for a
  parameter's 100 %; Fill's Opacity runs 0–1.
- `comp.layers.addNull()` in AE 2026 puts the null's anchor at [0, 0]: read it, don't
  assume the centre.

## Running it in the user's After Effects

- `AfterFX.exe -r <script.jsx>` (`C:\Program Files\Adobe\Adobe After Effects
  2026\Support Files\`) sends the script to the running AE, or launches one. **Prefer an AE
  that is already open:** a cold start on the user's machine took over 10 minutes (font
  scan) and once showed no window at all. `Get-Process AfterFX` → `MainWindowTitle`
  non-empty = ready.
- Writing files from a script needs *Allow Scripts to Write Files and Access Network*
  (`Pref_SCRIPTING_FILE_NETWORK_SECURITY` in the prefs file). Read it, never change it:
  ask the user.
- **Look at what AE has open first** (`MainWindowTitle` shows the project path). A test
  that opens a new project replaces the user's: ask before sending it. Call
  `app.newProject()` *before* `app.beginSuppressDialogs()`, so unsaved work gets AE's own
  save prompt, and let the runner close only a project the test itself saved.
- Test mode: `app.beginSuppressDialogs()`, results to a text log, save the `.aep` into the
  experiment's `out/`, render it afterwards with `aerender` (next point). Output module
  template names vary per install (`outputModule.templates`; pick by regex, e.g.
  `/h\.?264/i`). Don't `app.quit()` an AE the user may be using; leave the demo open.
- **Render with `aerender`, not `renderQueue.render()` in the user's AE.** It runs in its own
  process (`…\Support Files\aerender.exe -project x.aep -comp "Name" -s 0 -e <last frame>
  -RStemplate "Best Settings" -OMtemplate "<an H.264 template's exact name>" -output
  x.mp4`; on this install `"H.264 - Match Render Settings -  5 Mbps"`, two spaces), leaves AE
  usable, and kept working when the GUI's render queue broke («Error Code: 3, restart After
  Effects»). Give `-s`/`-e` (frames): without them it took the time span of an item left in
  the saved queue. An output name already used in that queue makes it skip the render.
- **AE's H.264 has no colour tags.** ffmpeg reads it as BT.601 and saturated colours shift
  (a tint looked redder than it was). Decode it with `scale=in_color_matrix=bt709`, and when
  re-encoding declare the *input* `-colorspace bt709 -color_primaries bt709 -color_trc
  bt709 -color_range tv` as well as the output, or ffmpeg converts and bakes the shift in.
- **Diagnostics must not raise dialogs.** An uncaught script error is a modal dialog even
  inside `beginSuppressDialogs()`, and stringifying an AE error inside `catch` can throw
  again. Wrap each step in its own `try`, read `e.message` inside another `try`, and write
  the log file after every step so a stall still says where. `'ERROR ' + e` in a catch is
  the usual culprit ("Object of type Error found where a Number, Array, or Property is
  needed", reported at the catch's line): it hit two throwaway runners in two days, so the
  morph fixer's `build.mjs` now lints for a caught error joined with `+`. Runners too.
- **Other sessions use the same AE.** `AfterFX.exe -r` hands the script to whatever AE is
  running or starting, another Claude session's included, and two sessions launching at
  once got two AE processes, one of them windowless. Check `Get-Process AfterFX` and the
  other sessions first, agree who goes first, and never start or stop an AE instance you
  didn't launch.
- **One script at a time.** While a script runs (or AE thinks one does), a second `-r`
  shows a modal "Attempt was made to run a second script…" and is dropped; an AE stuck in
  that state took every later `-r` the same way. If the runner's log never starts, look at
  AE before sending another: close an AE with nothing unsaved (`CloseMainWindow()`, which
  works when `-r` doesn't) and send the runner to a fresh one.
- **Send one runner, then drop jobs** (`sandbox/2026-11-21-ae-morph-fixer/ae-bridge.jsx`):
  open AE normally, send the bridge once with `-r`; it polls a folder with
  `app.scheduleTask(…, 1000, true)`, runs each `*.jsx` job there with `$.evalFile` in a
  `try`, and writes `<job>.status.txt`. No later test goes through `-r`, so none can hit
  the "second script" dialog. A cold `AfterFX.exe -r` (no AE running) runs the script and
  then **quits AE**: start AE first. Changing AE's theme (Preferences ›
  Appearance) drops tasks from `app.scheduleTask`: send the runner again after it.
  **Stop the runner before any by-hand check in AE's UI** (drop a stop job; the runner also
  stops itself after five idle minutes). Its timer fires even while a modal dialog is open
  (Preferences, the tool's own warning), and AE answers with a modal "Cannot run a script
  while a modal dialog is waiting for response". It then stayed convinced a script was
  running and refused everything else, including the job meant to stop it, until AE
  restarted. A leftover runner surprised the user with that dialog after the work was done. Jobs close only an empty untitled project or one saved
  under `out/`, and tests save their projects there.
- To click AE's own UI with computer use, bring it forward with a job that calls
  `app.activate()`: `open_application` sometimes leaves the desktop shell in front.
- A panel installed in ScriptUI Panels opens from a script with
  `app.executeCommand(app.findMenuCommandId('<file name>.jsx'))` (a negative id is fine; 0
  = not found). It runs at once: the panel's `$.global` exports are there on the next line,
  so a runner can drive the real docked panel. Don't send it again for an open panel.
- The `time` an expression sees at `valueAtTime(t)` sits on a grid of 1/61,440 s (±16 µs
  off `t`); frame times are on the grid. A test comparing time-dependent math must use
  AE's `time` (read it through a probe expression), not `t`.
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
- 2026-11-21 · ae-field-effector · A live rig that moves layers by a rule measured at their
  position: keep Position free, move them through the Anchor Point corrected by their
  rotation, scale and parent, and compute the weight once in a slider every channel reads.
- 2026-11-21 · ae-field-effector · A mock of AE's expression objects is only a test if it
  behaves like AE: Property objects that convert in arithmetic but fail `===`. The bare-number
  mock passed code in which every checkbox read as on.
- 2026-11-21 · ae-field-effector · Values right but the render empty: bisect with `aerender`
  on saved project variants (one feature switched off each); here a Fill at 0 % hid every layer.
- 2026-11-21 · ae-morph-fixer · AE morphs a path by blending every vertex and handle in a
  straight line (checked to 0.002 px), so a smooth point stays smooth halfway only if its
  handle-length ratio matches in both keys: rebuild every key at shared outline fractions
  with handles = arc / 3, corners pinned; keeping or splitting the drawn points can't.
- 2026-11-21 · ae-morph-fixer · AE stores path points as 32-bit floats; on a symmetric shape
  that rounding is enough to pick another, equally good, alignment. Compare AE with Node on
  the keys AE actually holds, not on the values you wrote.
- 2026-11-21 · ae-morph-fixer · A cheap check inside a loop (the rebuild's tolerance) must be
  validated against a slow, exact one in Node on hostile inputs; it under-read by 15 % on
  tight bends until it looked both ways, sampled the original densely and caught folds.
- 2026-11-22 · ae-morph-fixer · A shape that turns between keys shrinks through the middle
  (straight lines: an F at 45° has half its area). Take the turn out of the path keys into
  the group's Rotation, each step turning about its own fixed point (anchor and position on
  hold keys through the step), and the shape swings on the arc a hand-made turn would take.
  Decide "it turns" only against a plain match that is really off, or holds spin on noise.
- 2026-11-22 · ae-morph-fixer · A tool for end users installs itself: name the file the way
  the tool should be called (the Window menu shows it), give a floating run an Install button
  that copies it into the user's own ScriptUI Panels folder, and test the panel the way a user
  gets it (restart, Window menu, its own Fix button), then look at it: two of three guide
  problems (height, invisible bold) only showed in a screenshot.
- 2026-11-22 · ae-morph-fixer · Promise a time only from timings inside AE: ExtendScript ran
  the fix about 300x slower than Node, and the same job size varies 10x with how much the
  rebuild must add. Fit the estimate to an AE bench (`bench/ae-bench.jsx`), scale it per
  machine with a short calibration run, and check it against a real fix (6.4 s estimated,
  4.7 s taken).
- 2026-11-22 · ae-morph-fixer · A tool that changes points must say what it breaks before it
  does: Trim Paths, dashes, text on a mask and nulls that follow points all start from the
  first point, which a morph fix moves. Ask once, in plain words, with Cancel the default.
- 2026-11-23 · ae-morph-fixer · AE's display names change with its language ("Path 1" is
  "Pfad 1" in German): a tool finds properties only by internal name (the morph fixer's
  `build.mjs` fails on a lookup or comparison by display name), and a test names everything
  it builds itself and checks codes, not English words in messages that quote AE's names.
- 2026-11-22 · ae-flock-rig · A 2D layer that turns around by squashing its width through
  zero gives the flatness away when many turn together (a flock diving through vertical:
  38 % edge-on in one frame). Pointing up or down, mirror at once (only the wings swap
  side); squash only level turns, floored by a Turn Width slider, with an optional head-on
  drawing (a `turn` marker in the precomp) for the middle of the turn.
- 2026-11-22 · ae-flock-rig · Mirrored by −1 at rotation −p and flipped upside down at
  180° − p draw the same layer: bake whichever keeps rotation continuous, and cap the step
  per frame (25°), or AE interpolates a 160° spin between keys and motion blur smears it.
- 2026-11-22 · ae-flock-rig · Controls that read a group's direction (stretch along travel)
  need an axis (period 180°), held and rate-limited when the group slows; as a direction it
  jumped 99° in a frame when the flock reversed.
- 2026-11-22 · ae-flock-rig · Slider names can carry the explanation ("Clumping (+ core, -
  even)", ≤ 28 characters, AE took all 16); a re-run renames the previous round's names in
  place so the designer's values survive the upgrade.
