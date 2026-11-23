---
name: after-effects
description: Building After Effects tools from drawn-by-code — ExtendScript (.jsx) that bakes code-made motion into native AE layers, keyframes and slider-driven expressions, builds live expression rigs, or ships as a dockable ScriptUI panel people install, tested inside the user's After Effects (2026 and 27). Use it when the user works in After Effects, asks for an AE script, panel, rig or expression, wants to move motion between code and AE, or when working on sandbox/2026-11-21-ae-flock-rig, sandbox/2026-11-21-ae-field-effector or sandbox/2026-11-21-ae-morph-fixer.
---

# After Effects

**Code does the count, After Effects keeps the look.** For a motion designer who lives in
AE, the useful output is not a rendered video but native layers in their comp: keyframes
they can graph-edit, their own effects stack, and a controls null with sliders so they
art-direct by hand instead of re-prompting. Code earns its place where motion follows a
rule across many elements (flocks, draw-on order, staggers, physics); hero timing and feel
stay in the graph editor.

Worked examples:

- `sandbox/2026-11-21-ae-flock-rig/` (baked): a flock that follows a keyed null.
- `sandbox/2026-11-21-ae-field-effector/` (live): a MoGraph-style field effector, all
  expressions.
- `sandbox/2026-11-21-ae-morph-fixer/` (a panel people install): fixes the designer's own
  path and mask keys so shapes morph cleanly, letters with holes included. It installs
  itself as a dockable panel, warns before breaking anything, estimates long jobs and
  cancels with Esc. It is the reference for the "A panel people install" section below.

**Bake or live?** If the motion has memory (velocity, collisions, contact), simulate in the
script and bake keys. If each frame depends only on where things are at that frame (a
field's falloff, a stagger by distance, gears), leave live expressions: the designer can
re-key the driver and nothing needs re-running.

## Shape of a tool

| Piece | Why |
|---|---|
| `*-sim.js` / `*-math.js`, plain **ES3** | The logic. Runs unchanged in ExtendScript, Node and the engine, so the preview, the tests and the AE result are the same numbers |
| `*-ae.jsx` | The AE half: dialog or panel, reading the comp, building layers or writing keys, expressions |
| `build.mjs` | Joins them into **one** `.jsx` for the designer and lints it, since a syntax error in AE is only an alert. It checks ES3, reserved words, non-ASCII strings, a caught error joined with `+`, and lookups by display name |
| `scene.js` | Engine preview drawn the way the result will look: judge the motion here, it renders in seconds |
| `make-demo.jsx` | Builds a demo project from nothing; with a test flag it checks, logs and saves. It is the AE test |
| `test.mjs` | Node: the logic on hostile inputs, and the AE half against mock properties |
| Real artwork (`art/` in the morph fixer) | Cases made from real material, such as letter outlines read from the repo's OFL fonts. They run in Node and, through the tool's own code, in AE. They found what made-up shapes hid |

Expose `build(comp, …)` or the tool's API without UI (`$.global.X_NO_UI`) so the test can
call it, and reset the flag afterwards: `$.global` lives all session, and a panel opened
later in that session would not build. A tool people install keeps those exports out of
the release (see the panel section).

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
- Slider names can carry the explanation (≤ 28 characters); a re-run renames the previous
  round's names in place so the designer's values survive the upgrade.

## ExtendScript is ES3

- No `let`/`const`, arrows, template strings, `JSON`, `Object.keys`, `Array` methods
  (`forEach`, `map`, `indexOf`…), trailing commas. `toSource()` + `eval` replace JSON.
- **ES3 reserves words that modern JS doesn't** (`short`, `long`, `int`, `char`, `float`,
  `double`, `final`, `static`, `public`, `private`, `package`, `goto`…), **even as property
  names**: `{ short: 'x' }` or `res.long` stops the whole script ("Illegal use of reserved
  word"). Lint for them in `build.mjs` (see the morph fixer's), in every file AE runs.
- **Never join a caught error into a string**: `'ERROR ' + e` throws again inside the catch
  ("Object of type Error found where a Number, Array, or Property is needed", reported at
  the catch's line) and AE shows it as a modal. Read `String(e.message)` inside its own
  `try`. It hit two throwaway runners in two days; the morph fixer's `build.mjs` lints for it.
- No JIT. Alias `Math.sqrt` & co. to locals; keep inner loops on dense arrays. A hashed
  object keyed by big numbers converts every key to a string: a neighbour grid built that
  way was 30× slower. Measured: 80 boids over 264 steps of 2 substeps = 5.5 s in AE 2026;
  the morph fixer ran about 300× slower than in Node.
- Seeded randomness that agrees bit for bit across engines: Park-Miller (`s * 16807 %
  2147483647`, exact in doubles). Avoid hashes that overflow 2^53.
- **ExtendScript's `sort` is not stable** (V8's is). A comparator whose ties matter must
  break them by index (`(a.f - b.f) || (a.idx - b.idx)`), or ExtendScript and Node give
  different results: a rebuild handed its spare points to other gaps, 20 px apart.
- **`$.evalFile` doesn't put a file's top-level `var` on `$.global`.** Read the file and
  `eval` it where you need it, or assign `$.global.X` inside the file.
- Testing an ES3 file in Node: load it with `new Function(src + 'return X')()`, not
  `vm.runInContext` (global lookups there are ~10× slower and skew timings).

## A panel people install

The morph fixer (`morph-ae.jsx`, `build.mjs`) does all of this; copy from it.

**Docking and installing**

- AE runs a script from a `ScriptUI Panels` folder with `this` = the Panel. Wrap the built
  file as `(function (HOST) { … })(this)` and build into `HOST` when `HOST instanceof
  Panel`, else a `palette` Window. A test drives it by setting the controls and calling
  `button.notify('onClick')`. Building into `win.add('panel')` takes the docked path.
- **Installing needs no admin rights:** copy the script into the user's own
  `%APPDATA%\Adobe\After Effects\<major.minor>\Scripts\ScriptUI Panels\` (macOS
  `~/Library/Preferences/Adobe/After Effects/<major.minor>/…`; `<major.minor>` from
  `app.version`). That is the folder File › Scripts › Install ScriptUI Panel… uses.
  - Give a floating run an Install button that does `File($.fileName).copy(dest)`, creating
    the folders if missing: AE 27's `27.0` folder had no `Scripts` folder yet.
  - AE reads the folder at launch only. After a restart the file name (with `.jsx`) is the
    Window menu entry, so name the file the way the tool should be called.
  - AE 27 brought over the panel installed for 26.5.
- Warn when AE has two copies, which it would list twice in the Window menu. Look in the
  user's folder, in AE's own folder (`Folder.appPackage` + `/Scripts/ScriptUI Panels`) and
  under old file names.
- A script installed in AE's own folder needs admin rights to update; the user folder doesn't.

**The release build**

- Leave nothing on `$.global`: names collide with other scripts.
  - `build.mjs` writes the release (it fails if the release touches `$.global`) and a test
    build under `out/` that adds the exports the tests use.
  - `$.global` also survives between scripts all session.
- Put a version in the file header and the guide.
- Keep settings in `app.settings` under the tool's own name.
- Keep strings ASCII (ScriptUI and older AE mangle the rest), and say Ctrl or Cmd per
  `$.os`.

**Layout and text**

- One compact row of controls and a status line. The status line truncates
  (`truncate: 'end'`) and its `helpTip` holds the full report.
- **When docked narrow, break the row in two.** Lay the controls out in two groups inside a
  bar and measure the bar's width once laid out as one row. In `onResize`, switch the
  bar's `orientation` to `'column'` below that width and call `layout.layout(true)`.
- **The guide behind `?` is a `palette`, not `alert`**: it stays open while the user works.
  Write it for the person animating: what the tool does, three steps, each setting in plain
  words, a few tips. A test bans jargon from it.
- **ScriptUI doesn't wrap text reliably:** a `multiline` statictext re-wraps at a width of
  its own, and the guide came out 351 × 986 px instead of ~420 × 650.
  - Wrap in code, evenly so no word sits alone, and add one single-line statictext per line.
  - A text that changes later keeps its first size: measure its widest possible line up
    front (`graphics.measureString`).
  - The AE test checks the guide's laid-out size (360–640 px wide, under 800 tall, for a
    laptop screen). Two new tips pushed it to 807 px; wrapping at 80 characters, not 70,
    brought it back to 465 × 759.
- **AE doesn't draw ScriptUI fonts** (2026 and 27): `ScriptUI.newFont(…, 'BOLD', size + 3)`
  is accepted and reads back Bold / 15, but every statictext still draws as plain 12 px
  Adobe Clean (Arial too). Mark headings with the pen
  (`graphics.foregroundColor = graphics.newPen(PenType.SOLID_COLOR, c, 1)`) and leave body
  text unset so AE colours it. Only a screenshot shows this.
- **The pen must follow AE's theme.** ScriptUI's own `foregroundColor`/`backgroundColor`
  read `undefined`, so read AE 27's `app.getAppTheme` (a property: `"light"`, `"dark"` or
  `"darkest"`; missing before 27 means dark). Use black on light and white otherwise.
  Checked by eye in Light and Darkest.

**Before changing someone's work**

- Say what the change would break before making it.
  - A path's first point and point count drive Trim Paths, stroke dashes, taper and wave,
    Zig Zag, Pucker & Bloat, Wiggle Paths, text on a mask, effects using a mask, and
    expressions that read points (`points()`, `pointOnPath()`…, as nulls from Create Nulls
    From Paths do). Internal names are under the pitfalls below.
  - Look after the path in its own group and in every group above it: AE passes a group's
    paths up to its parents.
  - Search the comp's expressions with a time budget (0.8 s), since big comps are slow to
    walk.
- Estimate long jobs from timings measured inside AE, never from Node.
  - Fit the estimate to a bench (`bench/ae-bench.jsx` in the morph fixer).
  - Scale it to the machine with a short calibration run, done only when the job looks long.
  - Check it against a real fix: 6.9 s estimated, 6.2 s taken. On the real-type set it ran
    high on small jobs (4.4 s for 1.1 s) and close on long ones (24.2 s for 22.9 s). That is
    the safe way round for a 10 s warning.
- Ask once, in a modal dialog with Cancel as the default (`defaultElement` = Cancel), and
  only for warnings or jobs over 10 s. **Give every button an `onClick` that calls
  `w.close(n)`**: ScriptUI closes a dialog by itself only for the default and cancel
  elements, so a third button (Fix anyway, once Cancel became the default) did nothing.
  Group the warnings under a short path name, one plain sentence each. After the user goes
  ahead, count the warnings in the status line.
- Give each warning a code next to its sentence. The sentence quotes AE's names, which
  change with its language; tests check the code.

**Long jobs**

- Plan, then write: work every path out first (no writes), then write it all in one undo
  step. Then cancelling changes nothing.
- Cancel with Esc: the math calls back every key and round, and
  `ScriptUI.environment.keyboardState.keyName === 'Escape'` is read there. That is only when
  the work checks in, so tell users to hold Esc. A test passes a stand-in for the key.
- **Open no window while a script keeps AE busy.** If anyone clicks AE meanwhile, Windows
  shows its "not responding" stand-in. When AE answers, Windows puts AE's windows back as
  they were, and a palette the script had closed stays on screen for good.
  - In AE 27, `close()`, `close()` again, `hide()`, and `show()` + `close()` all failed to
    remove it (logged from outside for 45 s), and it had no close button. Only an AE restart
    clears it.
  - Without clicks, `close()` works, even after 7 s busy, so scripted tests don't show it.
    Only `visible = false` left a window up without clicks.
  - Any job long enough for a click is at risk: people click while they wait.
  - Seen on Windows 11; a Mac hasn't been tried.
  - Give the time and the way to cancel in the question before the work instead.
  - Reproduce it with `bench/ghost-window.jsx` beside `bench/window-watch.ps1` in the morph
    fixer, before trying any new window during a long job.
- `Window.find(type, title)` returns the first window with that title, closed ones included:
  it can't reach a particular window among several with one title.

**Language**

- AE's display names change with its language: "Path 1" is "Pfad 1" in German.
  - Find properties only by matchName and never compare a display name; the morph fixer's
    `build.mjs` fails on either.
  - A test names everything it builds itself ("Outline", not AE's "Path 1"), including
    names used inside the expressions it writes.

## Scripting pitfalls (each one cost a run)

- **Removing the last Time Remap key turns time remapping off** and hides the property;
  setting its expression then fails («the property or a parent property is hidden»). Keep
  the two keys AE adds; the expression overrides them.
- Adding a property (an effect, a shape) **invalidates references** to its siblings:
  re-fetch by name or matchName after every `addProperty` (a test runner fetched a Path,
  added a Fill, then got "Object is invalid" writing the Path). Add everything, then fetch.
- Use **matchNames** (`ADBE Transform Group`, `ADBE Position`, `ADBE Rotate Z`, `ADBE
  Scale`, `ADBE Time Remapping`, `ADBE Effect Parade`, `ADBE Slider Control`,
  `ADBE Root Vectors Group`…): display names change with the AE language.
- Internal names for what depends on a path's points (AE 27):
  - Operators: `ADBE Vector Filter - Trim`, `- Zigzag`, `- PB` (Pucker & Bloat), `-
    Roughen` (Wiggle Paths).
  - A stroke (`ADBE Vector Graphic - Stroke`, or `- G-Stroke` for a gradient one) holds
    `ADBE Vector Stroke Dashes`; dashes exist when that holds `ADBE Vector Stroke Dash 1`.
  - Its taper is `ADBE Vector Stroke Taper` (`… Taper Start Length`, `… End Length`,
    `… StartWidthPx`, `… EndWidthPx`); its wave is `ADBE Vector Stroke Wave`
    (`… Taper Wave Amount`).
  - A mask picker in an effect, or in text Path Options (`ADBE Text Path`), has
    `propertyValueType` `PropertyValueType.MASK_INDEX` (6422) and the mask's index as value.
  - Dump a layer's property tree in AE before relying on any name.
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
- AE stores path points as 32-bit floats: compare AE with Node on the keys AE holds.
- Keyframe labels: `prop.keyLabel(k)` and `prop.setLabelAtKey(k, 0–16)` (0 = none, 1–16 the
  colours in Preferences › Labels), from AE 22.6. Wrap them in `try` for older versions.
- `removeKey(k)` renumbers the keys after it: remove from the highest index down, then find
  the keys you kept again by time (`nearestKeyIndex(t)`).
- `setValuesAtTimes` adds keys with AE's default interpolation: set each new key's
  interpolation (and label) afterwards, found by `nearestKeyIndex`.

## Running it in the user's After Effects

**Before sending anything**

- **Look at what AE has open** (`Get-Process AfterFX` → `MainWindowTitle` shows the
  project path; empty means not ready yet).
  - A test that opens a new project replaces the user's: ask before sending it.
  - Call `app.newProject()` *before* `app.beginSuppressDialogs()`, so unsaved work gets AE's
    own save prompt.
  - Close only a project the test itself saved under `out/`, or an empty untitled one.
- **Other sessions use the same AE.** `AfterFX.exe -r` hands the script to whatever AE is
  running or starting, another Claude session's included. Two sessions launching at once got
  two AE processes, one of them windowless. Check the processes and the other sessions
  first, agree who goes first, and never start or stop an AE instance you didn't launch.
- Writing files from a script needs *Allow Scripts to Write Files and Access Network*
  (`Pref_SCRIPTING_FILE_NETWORK_SECURITY`; both `Main Pref Section` and `… v2` read 1 here).
  Read it, never change it: ask the user.

**Sending scripts**

- `AfterFX.exe -r <script.jsx>` lives in `C:\Program Files\Adobe\Adobe After Effects
  <2026|2027>\Support Files\`.
  - **Start AE first**, normally, and send to it. A cold `-r` (no AE running) runs the
    script and then **quits AE**.
  - A cold start on the user's machine once took over 10 minutes (font scan) and once showed
    no window at all; usually it takes 6 to 70 s.
- **One script at a time.** While a script runs, or while AE thinks one does, a second `-r`
  shows a modal "Attempt was made to run a second script…" and is dropped.
  - AE can stay in that state and refuse every later `-r`, even with nothing running.
  - **Send with `-ro` instead** (`AfterFX.exe -ro <script.jsx>`). AE 27's own warning says
    `-ro` or `-so` overrides the refusal. On 2026-11-23 AE refused `-r` with nothing
    running, and `-ro` then ran the runner at once, with no restart. Dismiss the warning
    (OK) first.
  - If a runner's log never starts, look at AE before sending another.
  - Close an AE with nothing unsaved via `CloseMainWindow()`, which works when `-r` doesn't,
    and start a fresh one.
- **Send one runner, then drop jobs** (`sandbox/2026-11-21-ae-morph-fixer/ae-bridge.jsx`).
  - Send it once with `-ro`. It polls a folder with `app.scheduleTask(…, 1000, true)`, runs
    each `*.jsx` job there with `$.evalFile` inside a `try`, and writes
    `<job>.status.txt`. Later tests never go through `-r`, so none can hit the "second
    script" dialog.
  - Jobs call its `freshProject()`, which only closes an empty untitled project or one
    saved under `out/`.
  - A job already waiting when a runner starts was meant for a runner AE refused: it is set
    aside unrun. Otherwise an old stop job ended the new runner before its own jobs.
  - **Stop it when the tests are done, and before any by-hand check in AE's UI** (drop a
    job calling `$.global.MMF_BRIDGE.stop()`; it also stops itself after five idle
    minutes). Its timer fires even while a modal dialog is open, such as Preferences or
    the tool's own warning. AE then answers with a modal "Cannot run a script while a modal
    dialog is waiting for response".
  - After that, AE stayed convinced a script was running and refused everything, the stop
    job included, until it restarted. A leftover runner surprised the user with that dialog
    after the work was done.
  - Changing AE's theme (Preferences › Appearance) drops `app.scheduleTask` tasks: send the
    runner again after one.
  - Start the runner **once** per AE session and stop it only at the end. The "second
    script" refusal (cause still unknown) came mostly on a new launch right after a runner
    had stopped itself. Each new launch is a chance for it; `-ro` gets past it (above),
    where before only a restart did.
- A panel installed in ScriptUI Panels opens from a script with
  `app.executeCommand(app.findMenuCommandId('<file name>.jsx'))` (a negative id is fine; 0
  = not found). It runs at once, and a test build's exports are there on the next line.
  Don't send the command again for a panel that is already open.
- A by-hand test can't press keys into AE while a script runs: AE becomes a stand-in
  window, and the screen tool refuses to type into it (and says not to work around that).
  Test cancelling with a stand-in for the key, and leave a held Esc to a person.
- Clicking AE's own UI with computer use is the real test of a panel: Fix, its dialogs, the
  guide, a narrow dock.
  - Bring AE forward with a job calling `app.activate()`: `open_application` sometimes
    leaves the desktop shell in front, and fails while a modal is open.
  - Restore anything you change (a column width, the theme) and stop the runner first.
- **Ask the person to do what a user would**, for what the screen tool can't: hold Esc, and
  click around AE during a long fix. Their clicks are what showed the stuck window.
- A by-hand check leaves the test project with unsaved changes. Say so when handing back,
  and that it can be closed without saving.

**Diagnostics**

- **Scripts must not raise dialogs.** An uncaught error is a modal even inside
  `beginSuppressDialogs()`, and a test's own error message can throw again (see the ES3
  section). Wrap each step in its own `try` and write the log file after every step, so a
  stall still says where.
- While a script runs, AE's window doesn't repaint, and its H.264 output only grows at the
  end: measure CPU (`Get-Process AfterFX`.CPU twice) before calling it stuck.
- **ScriptUI's word on a window can be wrong.** A palette read `visible == false` while it
  was on screen. Ask Windows from outside: the morph fixer's `bench/window-watch.ps1 -title
  "<title>"` logs what its window list shows, with times to set beside the script's log.
- Write "tested in AE" only for a step the AE log shows. A review note once claimed a
  cancel test in AE that didn't exist yet.
- The `time` an expression sees at `valueAtTime(t)` sits on a grid of 1/61,440 s (±16 µs
  off `t`); frame times are on the grid. A test comparing time-dependent math must use
  AE's `time` (read it through a probe expression), not `t`.

**Rendering and looking**

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
- Render cost is real: 80 precomp layers with motion blur ≈ 4 s a frame on the user's
  machine. Tell the designer to pre-render once approved.
- Look at the AE render like any other: full-resolution crops, a contact sheet, a run of
  consecutive frames through the hardest moment; commit it as `render/<name>.mp4`. Look at
  a panel the same way: screenshots of the panel, its dialogs and its guide, cropped so no
  window title or user path ends up in the repo. Test logs too: the install check prints the
  user's folder, so mask it (`%USERPROFILE%`, `~`) in the copy you commit.

## After Effects versions

- **27** (27.0 build 78; ExtendScript 4.5.6, ScriptUI 6.1.8):
  - Installed at `C:\Program Files\Adobe\Adobe After Effects 2027\`, with user settings in
    `%APPDATA%\Adobe\After Effects\27.0`.
  - `app.themeColor` is retired ("Use getAppTheme, getUseReducedContrast, and
    getAllowedAppThemes"). Those three are **properties**, not functions:
    `app.getAppTheme`, `app.getUseReducedContrast` (a boolean) and `app.getAllowedAppThemes`
    (`[light, dark, darkest]`).
  - Everything in the morph fixer's test passes unchanged from 2026. The real-type set and
    the mask cases pass too.
- **2026** (26.x): the version the flock rig, the field effector and morph fixer rounds 1–3
  were built and tested in.

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
  (straight lines: an F at 45° has half its area). Take the turn out of the keys and swing
  the shape, each step turning about its own fixed point, on the arc a hand-made turn would
  take. Decide "it turns" only against a plain match that is really off, or holds spin on
  noise. (It first went into the group's Rotation; since round 6 it goes into the path.)
- 2026-11-22 · ae-morph-fixer · A tool for end users installs itself: name the file the way
  the tool should be called (the Window menu shows it), give a floating run an Install button
  that copies it into the user's own ScriptUI Panels folder, and test the panel the way a user
  gets it (restart, Window menu, its own Fix button), then look at it: two of three guide
  problems (height, invisible bold) only showed in a screenshot.
- 2026-11-22 · ae-morph-fixer · Promise a time only from timings inside AE: ExtendScript ran
  the fix about 300x slower than Node, and the same job size varies 10x with how much the
  rebuild must add. Fit the estimate to an AE bench (`bench/ae-bench.jsx`), scale it per
  machine with a short calibration run, and check it against a real fix.
- 2026-11-22 · ae-morph-fixer · A tool that changes points must say what it breaks before it
  does: Trim Paths, dashes, text on a mask and nulls that follow points all start from the
  first point, which a morph fix moves. Ask once, in plain words, with Cancel the default.
- 2026-11-22 · ae-morph-fixer · A test harness left running in the user's AE is a bug the user
  sees: the morph fixer's runner fired during a dialog and wedged AE after the work was done.
  Stop every runner when the tests end, and give it an idle timeout in case you forget.
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
- 2026-11-23 · ae-morph-fixer · AE's display names change with its language ("Path 1" is
  "Pfad 1" in German): a tool finds properties only by internal name (the morph fixer's
  `build.mjs` fails on a lookup or comparison by display name), and a test names everything
  it builds itself and checks codes, not English words in messages that quote AE's names.
- 2026-11-23 · ae-morph-fixer · Test on real artwork, not only on shapes you made up: letter
  outlines read from the repo's OFL fonts (`art/ttf.mjs`, a 150-line TrueType reader) gave
  a 20-case regression set. It showed fonts list a letter's pieces in no order, and that big
  type needs a max of 200–300.
- 2026-11-23 · ae-morph-fixer · A letter in AE is several paths (outline, holes, an i's dot),
  and each path morphs to its own next key. With keys pasted from different letters, which
  piece meets which follows the font's order, not the shape. Match the pieces between keys
  first (by centre, size, and outline or hole), and let a piece drawn as a dot grow from a
  tiny copy of itself.
- 2026-11-23 · ae-morph-fixer · A turn goes into the path itself, one key a frame: masks have
  no transform, and on shapes the user wanted no transform keyed. Time it by AE's own eased
  progress read back from the path (custom key speeds come out exactly), and test it against
  what a group transform would show (equal to 1e-9 in Node). An F then kept 100 % of its area
  halfway, against 50 % before.
- 2026-11-23 · ae-morph-fixer · Keys a tool writes for itself must be findable later, or the
  next run takes them for the designer's: fixing a turned F again read its in-betweens as
  drawn keys (40 to 530 points). Label them (`setLabelAtKey`) and keep them linear, and have
  every run remove them first and work on the drawn keys. Leave the drawn keys' easing alone,
  so removing the in-betweens gives the timing back. Then a second run writes the same keys,
  and retiming is "move your keys, fix again".
- 2026-11-23 · ae-morph-fixer · Read AE's dialogs to the end: the "second script" warning that
  had cost several restarts says how around it, `-ro` (or `-so`), and `-ro` worked at once.
- 2026-11-23 · ae-morph-fixer · Click through the real panel by hand before calling a dialog
  or a progress window done: a Fix anyway button with no handler and a window that outlived
  its close() both passed every scripted test.
- 2026-11-23 · ae-morph-fixer · When a by-hand bug won't reproduce in scripts, list what the
  hand did that the scripts didn't. The stuck progress window needed a click on the busy AE.
  Two "fixes" built on a guessed cause (a timer closing it later) left 19 windows stacked
  before an experiment with the click found it.
