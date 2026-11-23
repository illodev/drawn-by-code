# Review · ae-morph-fixer

## Round 1 · 2026-11-21 (automatic + inside After Effects 2026)

**Node** (`test.mjs`, 4,235 checks pass): the demo's 10 keys (4–10 points) become 64 points
each, every key within 0.065 px of its drawing (exact mode: 22 points, 3.5e-12 px), the
twist cut by 76–85 % per morph (points travel 224–241 px around the shape before, 36–55
after). 360 random morphs (1 in 6 rebuilt): rebuilt keys within 0.091 px, smooth points
0.000° off smooth halfway through every morph, a second run never changes anything; 26
random shapes with loops or cusps fell back to keeping their points, and say so.

Fixed while testing, in order:

- The shape check said splits moved shapes by up to 1.8 px. They didn't (brute force:
  ≤ 0.007): the projection refined each point on the segment of its nearest sample, which at
  a sharp tip can be the wrong one. → Every candidate segment refined, golden-section search
  (Newton stalls at cusps), and a brute-force recheck before any failure is believed.
- Directions compared each key with the previous one, so a near-zero-area key (a figure
  eight) could flip the rest of the chain. → All compared with the first key that has a
  clear direction; keys without one are left alone.
- **In-betweens were lumpy**, and more points only made them serrated. After Effects blends
  each handle in a straight line: a smooth point stays smooth halfway only if its two
  handles keep the same length ratio in both keys. Kept or split points rarely agree. → A
  rebuild mode (now the default): points at the same outline fractions in every key, every
  handle a third of the arc to its neighbour, corners pinned exactly at each key's own
  fraction (merging near ones gave their neighbours different spacing again). Each key
  within 0.1 px or it falls back to the exact mode.
- The quick tolerance check (cheap enough for ExtendScript) came in under the truth on
  tight bends: it now looks both ways, samples the original densely, flags a rebuilt
  segment whose handle points back against its chord (a fold), and aims at 80 % of the
  promise.
- A second run rebuilt a matched path (264 → 1,056 points): "already matched" and the
  alignment took the start decision separately and disagreed. → One shared decision; the
  rebuild starts at 16–64 points and grows only as needed.

**Inside After Effects** (`make-demo.jsx` in test mode, AE 2026 / 26.5; `review/ae-log.txt`):
all checks pass. Fix: 2 s for 10 keys. Key times, interpolation and easing unchanged; Before
untouched; a second run changes nothing; a Mask Path is fixed too; a path with an
expression is skipped; selecting the layer finds its path; the start dot (a
`path.points()[0]` expression) rides the first point. AE interpolates the fixed keys point
by point with Easy Ease as smoothstep, within 0.002 px of the preview's model.

- **AE stores path points as 32-bit floats** (0.00004 px off the computed keys).
- **ExtendScript and Node disagreed by 20 px** on the same keys. Two causes: ExtendScript's
  `sort` isn't stable (ties in the rebuild's share-out went elsewhere) → every comparator
  breaks ties by index; and AE's float-rounded inputs pick another, equally good, start on a
  symmetric shape (a five-point star) → the test now fixes AE's own stored inputs in Node:
  same numbers to 0.00004 px.
- **Render** (`aerender`, 14 s): mean difference **1.1** between AE's After half and the
  engine preview over 9 times. The Before half shows what the rig is for: AE's own morphs of
  these keys collapse into slivers and twisted ribbons.

**Not yet seen by the user.** Open questions for round 2: their own shapes (type outlines,
logos), compound paths with matching sub-paths, a tolerance option in the dialog.

## Round 2 · 2026-11-22 (the user's requests, then automatic + inside After Effects 2026)

The user asked for: a **max** points instead of "at least" (default 100), the always-on
options dropped, a **hyper-compact panel** with the instructions behind an info button, and
then **coordinated motion for shapes that turn** (an F becoming an F rotated 90°).

- **Max:** the rebuild grows to the max and stops; if that is short of 0.1 px it keeps the
  result and the status says how far it got ("~0.761 px (max)", re-measured densely). On
  wild random shapes held to few points that figure reads up to ~25 % low, so it is shown as
  approximate; on the demo it is exact (0.76 measured, 0.76 by brute force).
- **Panel:** one row `[Smooth ▾] max [100] [ ] turn [Fix] [?]` and a status line whose
  tooltip holds the full report (264 × 53 px in AE); docks from `ScriptUI Panels`, floats
  from File › Scripts; remembers its settings. Start and direction are always on.
- **Turn:** with straight-line interpolation, an F turning 90° is halfway at half its area
  (the corner 53 px off the arc in AE). The start search now also tries the best rotation
  (2D Procrustes); a step counts as a turn when that cuts the error by 20 %, against a plain
  match really off (> 0.5 px RMS: without that floor a hold "turned" on rounding noise and a
  symmetric star spun 144°). The turn is taken out of the keys (local, unturned) into the
  shape group's Rotation; each turning step turns about its fixed point, anchor and position
  held through it, so the shape swings on an arc exactly as if turned by hand (the first
  version slid the centre in a straight line: 10.7 px off the arc halfway).
- Node: 4,269 checks. The F: angles 0/90/180/270/360 exactly, local keys alike (travel 162 →
  0 px), halfway = the F turned 45° (0.00 px; as drawn 52.8 px off, fixed without turn 89
  px); 60 random turned-and-moved shapes, angle recovered exactly; with turn on, the
  five-shape morph invents no spin; a second run changes nothing.
- **Inside After Effects** (`review/ae-log.txt`), all checks pass, after one fix: ExtendScript
  stopped on "Illegal use of reserved word": `{ short: …, long: … }`. ES3 reserves `short`,
  `long`, `int`, `char`, `float`, `final`… even as property names. → Renamed, and the build
  now lints for every ES3 reserved word (make-demo.jsx too). The corner of the turning F
  rides the arc within 0.03 px at keys and halfway; the group's Rotation is keyed 0 … 360 with
  the path's times; the panel's Fix button works in Smooth, max 24, Exact and turn.
- **Render** (aerender, 14.5 s, Morph then Turn): mean difference **1.1** between AE's After
  halves and the engine preview over 10 times in both parts.

**Not yet seen by the user.** Open questions for round 3: turning letters with holes
(several paths in one group, turned together), masks (they need baked in-betweens: no
transform of their own), and custom key speeds copied exactly to the group's keys.

## Round 3 · 2026-11-22 (the user's requests: dockable, a friendlier guide, a new name)

The user liked round 2 and asked for a panel that docks, guide text an end user can follow,
and the name **Mask Morph Fixer**.

- **Name:** the file is `Mask Morph Fixer.jsx`, because AE's Window menu shows the file name.
  The palette, the undo step and the guide carry the name too. Internal names stay as they were.
- **Docking:** the panel already docked when the script sat in a ScriptUI Panels folder,
  but nothing got it there short of copying into Program Files. Run floating, it now says
  "Tip: click ? to dock this panel", and the guide's **Install as a panel** copies the script
  into the user's own `%APPDATA%\Adobe\After Effects\26.5\Scripts\ScriptUI Panels` (no admin
  rights; the folder AE's own Install ScriptUI Panel… uses). Once installed, the button
  updates the copy. A blocked copy says which preference to turn on.
- **Guide:** a small palette (it stays open while you work) instead of an `alert`.
  - Layout: a one-line lead, three steps, each setting in plain words, four tips, then the
    dock section.
  - Content: no jargon (the Node test bans the words), Ctrl or Cmd per platform.
  - Wording: Smooth = "redraws the points so the shape stays smooth all through the morph",
    turn = "swings round instead of squashing through the middle".
  - Tooltips: rewritten the same way.
- **The guide came out 351 × 986 px** the first time in AE: a `multiline` statictext
  re-wraps at a width of its own. → Text wrapped in code, one single-line statictext per
  line, lines evened out so no word sits alone; the install note is sized up front for its
  longest message (`measureString`). Now 403 × 654 floating, 391 × 638 docked.
- **Headings didn't stand out** (screenshot): AE 2026 accepts a bold or larger font
  (`graphics.font` reads back Bold, size 15) and draws it as plain 12 px text, Arial
  included. Only the pen colour shows → title, headings and setting names in white
  (`review/guide.jpg`).
- A throwaway AE runner showed a modal "Object of type Error found where a Number, Array, or
  Property is needed" (at its catch: `'ERROR ' + e`). It was already in the skill and still
  happened, so `build.mjs` now lints every file AE runs for a caught error joined with `+`.
- Node: 4,275 checks pass. AE (`review/ae-log.txt`): all checks pass, including:
  - The palette guide opens and is not modal.
  - The panel builds into a Panel host (the docked path) without an install button.
  - Install writes the whole file into a scratch folder, and a second install overwrites it.
  - The user's panels folder is found.
- **Docked, for real** (`review/dock-log.txt`, `review/panel.jpg`):
  - The real install put the panel in the user's folder. After a restart, AE lists it as
    *Window › Mask Morph Fixer.jsx*.
  - Opened from the menu by script (`executeCommand(findMenuCommandId(…))`), it is a Panel
    with its own tab, "Mask Morph Fixer" with its ≡ menu, and it comes back with the workspace.
  - Its Fix button, clicked on a square keyed into a pentagon drawn the other way, gave
    24 points each, the pentagon reversed and its start moved (travel 136 → 21 px).
  - Its guide has no install button.
- Running it, two snags of the test harness, not the tool (both in the skill now):
  - The test script added a Fill after fetching the Path, which invalidates the Path ("Object
    is invalid").
  - An AE that thought a script was still running refused every later script with a modal.
    Closing it through its window and starting fresh cleared it.
- A Claude session working on the flock rig was testing in the same AE at the same time;
  we agreed it would go first.

**Not yet seen by the user** in this form (the panel is installed and open in their AE).
Still open from round 2: turning letters with holes, turning masks, custom key speeds.

## Round 4 · 2026-11-22 (After Effects 27, and the user's release list)

The user moved to **After Effects 27** and, from the list of what a distributable panel needs,
chose: headings that follow the interface theme, warnings about what depends on the points,
a warning with a time estimate for any fix over 10 s, a two-row layout when docked narrow,
the tolerance in on-screen pixels, and a clean release build (version, no globals, duplicate
installs). Mac and older versions wait. Version **0.9.0**.

- **AE 27** (27.0 build 78): everything passes (`review/ae-log.txt`), and the release, docked
  from the Window menu, was clicked through by hand: Fix, its warning (Cancel and Fix anyway),
  the guide, the narrow dock (`review/warning.jpg`, `panel.jpg`, `panel-narrow.jpg`,
  `guide.jpg`). AE 27 had already carried the installed panel over from 26.5.
- **Theme:** AE 27 retired `app.themeColor` ("Use getAppTheme, getUseReducedContrast, and
  getAllowedAppThemes"). They are properties, not functions: `app.getAppTheme` is `light`,
  `dark` or `darkest` (the user's: darkest, reduced contrast on). Headings are black on
  Light, white otherwise; the body keeps AE's own colour. Looked at in Light below.
- **Warnings:** before fixing it lists what the fix would break, and asks. That means path
  operators and stroke features after the path in its group or any group above it (Trim
  Paths, dashes, taper, wave, Zig Zag, Pucker & Bloat, Wiggle Paths). It also covers text on
  the mask, effects pointing at the mask (any mask picker, value type 6422), and expressions
  in the comp that read the points (0.8 s budget). Internal names were dumped from AE 27
  first. In AE: Trim Paths + dashes + a null following the first point gave 3 warnings, and
  Cancel changed nothing; the Stroke effect and text on a mask were caught too.
  The first wording ("Trim Paths 1: Trim Paths measures…") read twice. Now each warning is
  one sentence under a short path heading.
- **Time:** fitted to timings inside AE 27 (`bench/ae-bench.jsx`):
  - Smooth costs about 0.17 s a key with few points, up to 2 s when it rebuilds to its max.
  - Exact costs about a tenth of that; turn costs up to twice.
  - A 0.15 s calibration run scales the estimate to the machine, only for jobs that look long.
  - In AE: 12 keys of ~60 points were estimated at 22 s and asked first. 6 keys of ~16 points
    were estimated at 6.4 s and took 4.7 s.
- **On screen:** the tolerance is divided by the largest scale of the path's groups, layer and
  parents. A layer at 200 % gave 103 points within 0.056 px on screen. At 400 % the max 100
  stops it at 0.11 px, and the status says so.
- **Narrow dock:** the row breaks into two (settings, then Fix and ?) below the width one row
  needs, docked in AE's right column and back.
- **Release build:** `build.mjs` writes two builds. The release leaves nothing on `$.global`
  and the build fails if it does. A test build in `out/test-build/` adds the exports.
  Settings now live under the tool's name. The guide shows 0.9.0. The status warns when AE
  has two copies (user folder, AE's folder, or the old `MorphFixer.jsx`).
- **Testing in AE:** repeated `AfterFX.exe -r` left AE refusing scripts with a modal ("a
  second script while another script was already running", even with nothing running). That
  happened three times. → `ae-bridge.jsx`: sent once, it polls a folder for jobs
  (`app.scheduleTask`). After that, nothing a test does can raise that dialog. Also, a cold
  `AfterFX.exe -r` runs the script and then quits AE.
- **Launch checklist:** a private page that saves its own ticks (`artifact` capability). It
  has 41 steps in six phases, marked You / Claude / Both; 11 are done.

**Not yet seen by the user** in this form. Open: Mac, real artwork,
letters with holes, turning masks, a progress bar with Cancel.

**Light theme, looked at** (the user's go-ahead): AE 27 switched to Light, then back to
Darkest with Accessible color contrast off, as it was. In Light the docked panel, the guide
and the warning follow AE's colours, with headings black over AE's grey text
(`review/guide-light.jpg`, `review/warning-light.jpg`). The theme switch also stopped the
test runner: tasks from `app.scheduleTask` don't survive it, so its last two jobs never ran.

**Left behind, and fixed:** after the Light check the runner's timer was still scheduled (the
stop job never ran). It fired while a dialog was open, and the user got "Cannot run a script
while a modal dialog is waiting for response". AE then refused every script, the stop job
included, until a restart (done; AE 27 left open and empty). → `ae-bridge.jsx` stops itself
after five idle minutes, and its header, the README and the skill say to stop it before any
by-hand check in AE's UI.

**Ready for a non-English After Effects** (the user's go-ahead): the tool already found
everything by AE's internal names. `build.mjs` now fails on any property looked up, or name
compared, by display name in the tool. Each warning carries a code (`trim`, `dashes`,
`taper`, `wave`, `zigzag`, `pucker`, `wiggle`, `text`, `effect`, `expression`) next to its
sentence, which holds AE's own (translated) names. The AE test checks the codes, and it names
the shape groups it makes itself ("Outline", not AE's "Path 1", which is "Pfad 1" in German).
It passes in AE 27 (English). Not yet run in a localized AE: that takes a reinstall in
another language, or a beta tester.

## Round 5 · 2026-11-23 (the checklist's "does the right thing on real work")

The user asked for everything in that section I could do. Built and tested:

- **Progress, with Esc.** A fix is now planned in full (`planPath`), then written in one
  undo step, so it can be cancelled with nothing changed.
  - `MF.fix` calls back every key and every rebuild round; Esc is read there with
    `ScriptUI.environment.keyboardState`, so it must be held.
  - A progress window for jobs over 4 s was built, then removed: see the investigation below.
- **Turning for masks**, and for paths no group can turn (sharing their group, a group
  already animated, only some keys selected).
  - The turn is written into the path as one key a frame: `MF.swing` gives exactly what the
    group transform would show (a Node test compares them at 1e-9).
  - The timing comes from After Effects' own eased progress, read back from the path
    (`MF.progressOf`).
  - In AE 27 an F turning as a mask got 58 in-between keys and kept 100 % of its area
    halfway (as drawn: 50 %); at a key it sat 0.109 px from where it was drawn.
- **Pieces: letters with holes.** Sibling paths keyed at the same times (one group, or a
  layer's masks of one mode) are matched between keys first (`MF.matchPieces`).
  - The cost is centre distance, size, and outline vs hole. An order other than the drawn
    one is used only when it cuts the cost by 20 %.
  - A piece drawn as a dot grows from it as a tiny copy of itself.
  - In AE an O closing into a C works as Add and Subtract masks too.
- **Real artwork.** `art/ttf.mjs` reads letter outlines from the repo's OFL fonts (checked by
  eye: `art/look.mjs`).
  - 20 cases keyed the way a designer would: O into C, B into 8 pasted out of order, i into
    l, engraved letters of 120–300 points a piece, a ten-key chain, turning letters, 24 and
    2000 px type.
  - Node: 128 checks pass (`review/art-report.md`). AE 27, through the panel's own code plus
    the two mask cases: all pass (`review/art-log.txt`, `review/art-times.md`).
  - What it taught:
    - Fonts store a letter's pieces in no particular order (an i lists its dot first), so
      matching pieces is needed even without shuffling.
    - At 400 px the default max of 100 often stops letters 0.15–0.7 px off: the guide now
      says big type needs 200–300.
    - The time estimate runs high on small jobs (4.4 s for 1.1 s) and close on long ones
      (24.2 s for 22.9 s).
- **Limits:** written down in the README ("Limits that stay"), each one with its reason.

Testing by hand in AE 27 found two bugs that no script could have found:

- **"Fix anyway" did nothing when clicked.** ScriptUI closes a dialog by itself only for its
  default and cancel elements. With Cancel made the default in round 4, Fix anyway had no
  way to close the dialog. → Both buttons close it in their own `onClick`. Retested: the fix
  starts and the progress window shows ("Path 1 of 3").
- **The progress window stayed on screen after a 13 s fix**, with no close button. ScriptUI
  reported it closed, but the window (AE's own, class `DroverLord`) was showing. A first
  explanation and fix (close it later with a one-shot task) were wrong: see the
  investigation below.
- Esc during a fix couldn't be pressed from here: a busy AE becomes a stand-in window that
  the screen tool won't type into. The cancel path is tested in Node (a progress callback
  that cancels: nothing written). The stand-in for the key was then tested in AE too (see
  the investigation below); a held Esc in AE is still left to a person.
- My test runner was refused once more with "second script" (AE wedged after the stuck
  window); the user restarted it through me.

**The progress window, investigated** (the user chose to keep investigating):

- A first test run left **19 progress windows** stacked over the comp. The delayed close
  never worked: `Window.find('palette', title)` returns the first window with that title,
  including ones ScriptUI has already closed, so it kept closing a stale window.
- Experiments through the runner, with Windows' own window list (`EnumWindows`) read from
  outside:
  - `close()` removes a palette even after AE has been busy for 7 s, with or without label
    changes, Esc reads, keys written while it was up, or a click handler around it.
  - Only `visible = false` leaves one up.
- **The cause:** I had clicked AE during the first stuck fix. Reproduced with a
  self-contained script (`bench/ghost-window.jsx`, watched by `bench/window-watch.ps1`): a
  palette, AE busy for 12 s, two clicks on AE meanwhile. The palette
  then stayed on screen through `close()` in the script, `close()` again, `hide()`, and
  `show()` + `close()`, all logged for 45 s. Clicking a busy app makes Windows show its "not
  responding" stand-in, and when the app answers Windows restores the windows as they were.
  People click during long fixes, so any window the fixer opened would get stranded.
- → **The progress window is gone.** The warning before a fix over 10 s gives the time and
  says "Hold Esc to cancel: nothing changes"; Esc still cancels.
  - The AE test checks cancelling with a stand-in for the key: the status says cancelled
    and the keys are unchanged.
  - By hand, the user clicked Fix anyway and clicked around AE during the 12 s fix. It
    finished ("Fixed 3: 100 pts, ~1.183 px (max)") and nothing was left on screen.
- **The guide** grew to 807 px with the new tips (over the 800 px check). Lines are now 80
  characters: 465 × 759 px.
- **The runner** had run a job left over from a launch AE refused. One of them was an old
  stop job, so it stopped before the new ones. Waiting jobs are now set aside unrun when a
  runner starts.
- **"Second script" refusals:** they came twice more. They follow most, but not all,
  launches right after a runner stopped itself, and they're unexplained. Starting the
  runner once per AE session and stopping it only at the end avoided them. AE restarts
  cleared each one; only test projects were discarded.
- AE 27 (final build, fresh start): every check passes (demo test with cancel, real-type
  set). Node: 4,293 + 128.

## Round 6 · 2026-11-23 (the user's request: turn shape paths in the path, not the transform)

The user asked for the mask technique on shape layer paths too, instead of keying the
group's transform. Version **0.10.0**.

- **Every turn is written into the path**, one key a frame (`MF.swing` at After Effects' own
  eased progress). The group-transform route (`turnGroup`, `writeTurn`) is gone; no transform
  is keyed. Custom key speeds now come out exactly (the group route approximated them).
- **What that broke, found in Node before AE:** fixing a turned path again read the
  in-betweens as keys the designer drew. With turn off a turning F went from 40 to 530
  points; with turn on each frame-to-frame step counted as a new turn. Before, only masks
  had in-betweens, so it never came up.
  - → The in-betweens carry keyframe label 15 (`setLabelAtKey`, After Effects 22.6 and later)
    and are linear. Every fix finds them (label and linear both), removes them first and
    works on the drawn keys; pieces are matched on the drawn keys too.
  - → The drawn keys keep their own interpolation and easing (the old mask route made the
    sides facing the in-betweens linear), so removing the in-betweens gives the timing back.
  - → `MF.fix` keeps keys that already share their points and differ only by a turn
    (`kept`): fixed twice, the same keys and the same in-betweens.
  - So a turn can be retimed: move the drawn keys, Fix again. Fix with turn off takes it out.
- Node (4,300 checks): on a mock timeline the F gets 92 labelled in-betweens with the drawn
  keys still eased; fixed again, the same 92 to 1e-9 px; with a drawn key moved from 1.5 s to
  1.25 s, 86 and none left behind; with turn off, all removed. The art set: 128 pass.
- The preview draws the turn with `MF.swing`; halfway through a quarter turn the F is whole at
  45° (`out/stills/t_9.00s.png`).
- AE: `make-demo.jsx` now checks no transform keyed, labels and easing, and a second fix;
  `art/make-art.jsx` checks the turning letters are written into their paths.

**In After Effects 27** (the user's go-ahead): all pass, 45 demo checks and 53 art checks
(`review/ae-log.txt`, `review/art-log.txt`).

- The turn demo's F: 92 in-betweens, all labelled and linear, the 9 drawn keys still Easy Ease,
  no transform keyed on the group or the layer. Its corner rides the arc of a real turn within
  0.033 px. Fixed again: the same 92 replaced, halfway moved 0 px.
- Real type: the turning F (87 in-betweens) and the R with its hole (58) are written into
  their paths with no group keyed, and keep 100 % of their area halfway; the F as a mask too,
  0.000 px from the drawn keys at each key.
- The AE render (`aerender`, 16 s) shows it: halfway through each quarter turn the fixed F is
  whole while the drawn keys alone squash it. `render/` (mp4, strip, gif) is redone from it.
- Starting the runner, AE refused with "second script" though nothing ran. Its warning now
  says how around it: launching with `-ro` (or `-so`) overrides. `AfterFX.exe -ro
  ae-bridge.jsx` got through at once.
- Not done: the panel installed in the user's AE is still 0.9.0.

## Round 7 · 2026-11-23 (ExtendScript misread three nested `?:`; tested inside After Effects 27)

The draw-on rig found that ExtendScript reads `a ? b : c ? d : e` as `(a ? b : c) ? d : e`
(AE 27: `true ? 1 : false ? 2 : 3` is 2; V8 says 1). Three of them ran here, and Node read
all three right. Version **0.10.1**.

- **The area sign** (`pieceInfo`): `ar > 0 ? 1 : ar < 0 ? -1 : 0` was -1 for every piece in
  AE, so no piece was ever a hole and pieces were matched by centre and size alone.
- **`progressOf`'s clamp to 0..1** let negatives through (a path read back before its key:
  -0.5, not 0). It times the turn's in-betweens; drawn keys don't overshoot, so no case
  here hit it.
- **The runner's job sort** (`ae-bridge.jsx`): it returned 1 for any two different names, and
  ExtendScript's sort then kept the order `getFiles` gave. That is name order on NTFS, so jobs
  never actually ran out of order.
- → All parenthesized. `build.mjs` now fails on an unparenthesized nested `?:` (`nestedTernary`,
  per line, strings blanked) and lints `ae-bridge.jsx` too. On the old sources it flags
  exactly these three lines.

**What it did to real type, measured in AE 27** (27.0 build 78): `MF.matchPieces` on the 20
real-type cases with the 0.10.0 build and the 0.10.1 build. AE 0.10.1 matches Node in all 20
(order, moved, grown, signs). AE 0.10.0 matches Node running the old code grouped the way
ExtendScript reads it, also in all 20, so the misread was the whole difference. Matching changed
in 2 of 20 cases, both an O closing into a C:

- *O into C and back*: the O's hole (149 px) is nearer the C (146 px) in size than its outline
  (219 px). With no holes seen, **0.10.0 turned the O's hole into the C and shrank the outline
  to a dot**. 0.10.1 morphs outline to outline and closes the hole into a dot, as Node always did.
- *Engraved O into C, Exact*: the same, with the font listing the hole first.
- `progressOf` now gives 0, 1 and 0.5 for -0.5, 1.5 and 0.5; 0.10.0 gave -0.5, 1 and 0.5.

**Why the AE art test passed anyway:** it checked that the hole grew from a point (the grown
count, right either way), never which piece went where. → `art/test-art.mjs` writes Node's
`moved` and `grown` into `cases.js`, and `art/make-art.jsx` checks AE gets the same
("pieces matched as in Node"). Run on the 0.10.0 build, the new check fails exactly the two
O into C cases (moved 2 vs Node 0, and 0 vs 2).

**In After Effects 27**, through the fixed runner (its jobs ran in name order):

- `make-demo.jsx` test mode: all 45 checks pass, as in round 6 (`review/ae-log.txt`).
- `art/make-art.jsx`: all 73 checks pass, round 6's 53 plus "matched as in Node" for each of
  the 20 cases (`review/art-log.txt`). Every status is as in round 6 but one: *Engraved O
  into C, Exact* now has 329 points, not 307. Exact gives a path a point wherever any of its
  keys has one, and the O's outline is now paired with the C's outline instead of with its hole.
- Node: 4,300 + 128 checks pass, unchanged.
- The panel installed in the user's AE (`ScriptUI Panels/Mask Morph Fixer.jsx`) was 0.10.0
  (109,031 bytes), still matching by size alone. The user reinstalled it from 0.10.1 (? >
  Install as a panel); the installed file is now byte for byte the 0.10.1 release.

## Round 8 · 2026-11-23 (the user's own test: a dash warning on a stroke with no dashes)

Testing the panel by hand, the user got "the dashes of Stroke 1 start at the first point,
which moves" on a shape with no dashes, and said a shifted dash start isn't worth a warning
anyway. Version **0.10.2**.

- **Why it fired:** the check was "the stroke's Dashes group holds `ADBE Vector Stroke Dash
  1`", and the AE test only ever tried a stroke *with* dashes. On the user's stroke without
  dashes it said yes. Not looked into further: the warning is gone.
- **What a fix does to them:** dashes don't change with the points; only where the pattern
  starts on the outline moves. The stroke's wave is the same kind of thing (its phase starts
  at the first point), so it goes too. The **taper** stays: on a closed path its thin ends sit
  at the first point, and moving that point moves them visibly.
- The AE test now adds a dashed stroke and a tapered one, and checks that Trim Paths and the
  taper are named and nothing about dashes is. Guide, README and skill say the same.
- Node 4,300 + 128 pass. **Not yet run in After Effects** (the user is testing in it), and
  the installed panel is still 0.10.1.

## Round 9 · 2026-11-23 (the user doubts the other warnings too: "don't they all have an offset?")

Version **0.10.3**. The user's point holds, and more: they rarely even need the offset.

- **Checked first, in Node:** a fix never moves the first key's start: 0 px on the demo and
  the turn demo, Smooth and Exact, with and without turn, and over 200 random shapes (2 to 5
  keys, 3 to 11 points, either direction). The later keys' starts move to line up with the
  first key's, which is what stops the spin.
- So everything that measures along the path from its start keeps working as it did on the
  first key: Trim Paths, stroke dashes, taper and wave, text on a mask, the Stroke and Vegas
  effects, `pointOnPath()` and its kin. Each also has an offset or start setting. **No longer
  asked about.**
- What a fix does change is the point count (64 where 4 were drawn), and no offset helps
  there. **Still asked about:** Zig Zag (ridges per segment), Pucker & Bloat (pulls every
  point), Wiggle Paths (its Detail adds points between the vertices), and expressions that
  read a point by its number (`points()`, `inTangents()`, `outTangents()`: nulls from Create
  Nulls From Paths). Six of the nine kinds of warning are gone; the masks' checks (text on
  it, effects using it) went entirely.
- The dialog now opens "The fix adds points. These depend on how many there are:". The
  guide's tip says what it asks about and that Trim Paths, dashes and text are fine (two
  lines, as before, so the guide stays under 800 px).
- The AE test: Trim Paths, a dashed and a tapered stroke, the Stroke effect and text on a
  mask raise nothing; Zig Zag and the null following `points()[0]` are named ("2 warnings").
- Node 4,300 + 128 pass. **Not yet run in After Effects**; the installed panel is 0.10.1.

## Round 10 · 2026-11-23 (the user: "all else being equal, minimize crossovers")

The user asked that, all else being equal, the fix avoid moments where the shape crosses
itself and looks like two or more shapes. Version **0.11.0**.

- **Measured first:** over 223 steps (the demo, the 20 real-type cases, 150 random blobs),
  the fixed in-betweens crossed themselves in 4, all real type (a into e at two sizes, M into
  W, a step of the ten-letter chain). In each, a start 1–2 % further round the outline avoided
  it for 1–8 % more travel. Random blobs never crossed.
- **Built:** `startPlan` checks the morph at the start it chose (64 points of each outline,
  19 in-betweens). If it crosses, the grid starts costing at most 20 % more squared distance
  are tried, the current one first, then the cheapest; the first that doesn't cross and whose
  grid neighbours don't either is taken. Keys drawn crossing themselves are left alone.
- **What went wrong on the way:**
  - Nine in-betweens missed a into e's crossover, which lasts only around u = 0.45; and the
    first crossing-free start sat right next to a crossing one. → 19 in-betweens, and a start
    with crossing-free neighbours.
  - Two random morphs no longer survived a second run: the sampled count is a little noisy,
    so the second run chased another start. → Whether a path is already fixed now keeps the
    current start when it crosses no more than the shorter-travel one, and doesn't skip that
    for keys that cross themselves only at some sample spacings.
- **End to end** (exact check on the fixed keys, 231 fixes with spiky random polygons): 8
  crossing steps without the choice, 3 with it, none worse; 0.1 % more travel; about 14 %
  more time in Node. The 3 left: O into C's two steps (a small twist as the C's gap opens,
  which no start avoids and the 64-point check doesn't see) and a false alarm on a turned
  step (its in-betweens are swung, which can't cross).
- `review/crossover.png` (`art/crossover.mjs`): the a's tail twists into a loop and the M's
  foot into a spike with the least-travel start; both stay clean with the start taken.
- The report says "1 start chosen so the shape does not cross itself on the way", or names a
  step no start untangles.
- Node: 4,303 checks; the real-type set 148, with "in-betweens don't cross themselves" for
  every case (O into C allowed its 2). With the choice off, that check fails exactly the four
  type cases. **Not yet run in After Effects**; its time there isn't measured.

## Round 11 · 2026-11-23 (the user: symmetry first, as a tie-breaker plus an option)

The user asked whether the fix can favour graceful, symmetric movement over least travel,
maybe as an option; chose a tie-breaker that's always on plus a checkbox (**sym**) that forces
it; then asked for a quick test by default and a thorough one with the box ticked, with
dynamic time warping planned for later. Version **0.12.0**.

- **Measured first** (round 10's probe): where both keys share a mirror axis, today's fix
  already moved symmetrically (the demo, i into l: 0.0 %). Least travel and symmetry part
  only on a tie between two mirror-image swirls: a star into itself turned 36 deg (79 %
  asymmetric) and a plus into an x (89 %), where the symmetric match costs 4 % and 3 % more.
  The leftover crossings of round 10 leave at most 0.03 % of the shape unfilled.
- **Built:** `mirrorAxes` finds a key's axes (principal axes, or the directions to local
  radius extremes for shapes with no main direction; refined by small turns; within 2 % of
  its size; a circle is round). `symmetricStarts` gives the next key's starts that sit as far
  from its pole as the previous key's does. `startPlan`: no crossover, then symmetry (within
  20 % more squared travel, or always with **sym**), then least travel; a step that turns is
  left to the swing. **sym**: every angle in 2 deg steps, twice the samples, within 4 %.
- **What went wrong on the way:**
  - "The in-between has a mirror axis" passed a swirl: a thin star swirling stays a symmetric
    shape whose axes turn (18 -> 27 -> 36 deg). → Tests ask that the keys' shared axis is kept.
  - Forcing switched an already symmetric morph to a costlier symmetric one (81.9 px for
    56.8): the "already symmetric" match was too strict and "stay put" beat a cheaper start.
    → Already symmetric within 2 grid steps counts; staying put needs the cheapest symmetric
    start not to be 5 % cheaper.
  - Snapping onto the symmetric start moved a hold's start (0.04 px of travel). → No snap.
  - Speed-ups that dropped the plus's diagonal axes: only the strong radius extremes (its
    upright axis runs through a weak one), and an 8 % first screen (its diagonal's candidate
    started 3.3 deg off, at 9.9 %). → All local extremes, 24 at most; a 15 % screen.
  - The thorough test found false axes 2-3 deg from a rounded square's true ones. → Refine to
    convergence, and an axis within 4 deg of one found is the same one.
- **Time** (Node, the demo, warm): 7.6 ms without symmetry, 9.7 with the quick test, 27.8
  with **sym** (from 95 before screening the sweep on a quarter of the samples). Counted into
  the estimate at ExtendScript's ~300x: +90 and +700 ms a key, not yet benched in AE.
- `review/symmetry.png` (`art/symmetry.mjs`): the star and the plus swirl lopsided with least
  travel and pulse evenly with symmetry; the thin plus rotates with least travel (graceful in
  its own way), so it's left to **sym**.
- **The T case:** a T into an upside-down T can't be both symmetric and crossing-free with
  evenly spread points (its bar ends and stem swap places). It needs corner-to-corner
  matching: README "Next: corner-to-corner matching (dynamic time warping)" is the plan.
- Node 4,351 checks; the real-type set 148, unchanged. The AE test gains a symmetry step (AE's
  own in-betweens keep the upright axis; the thin plus only with sym) and checks the panel's
  **sym** box. **Not yet run in After Effects.** The guide is one line longer (27 lines,
  measured 743 px at 26).
