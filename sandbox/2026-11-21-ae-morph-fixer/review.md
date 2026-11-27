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

## Round 12 · 2026-11-23 (a turn drawn with Free Transform was thrown away)

Asked what still looks bad where a simple fix exists, probes found this first: a key drawn
as a turn of the previous one (Free Transform: the same points, turned) lost its turn. Least
travel ignores the drawn pairing, and for a shape the turn maps onto itself that is no motion:
a star turned a tip stood still (its points had travelled 123 px, after the fix 0), even with
turn ticked; a gear turned half a tooth pulsed (17 px) instead of turning (42 px), which round
11's symmetry made the choice. The user said fix it. Version **0.12.1**.

- `drawnTurn` finds it: points and handles turned by one angle (scaled evenly, if at all),
  point for point, within 0.5 px (or 0.2 % of the size); 1 deg or more.
- The drawn pairing is kept, the key's start moved as far as the previous key's did. With
  turn: swung by the drawn angle (the star 72 deg, the gear 18 a key, the F 90; each 100 % of
  its area halfway). Without: kept when least travel would erase the motion (under a quarter
  of it), costs about the same, or the turn is 30 deg or less (straight blending shrinks by
  cos(deg / 2)); the F at 90 deg keeps least travel (93 % of its area halfway; as drawn, 50 %).
  The report says what happened and suggests turn ("drawn as a 72 deg turn, kept that way
  (tick turn to swing it without shrinking through the middle)").
- "Already matched" and the "kept" path of a second run carry the drawn turn, so fixing again
  changes nothing and the report still suggests turn.
- `verify()` in test.mjs now checks the keys as placed when there is a turn (its unturned
  local keys failed the shape and corner checks).
- Node 4,408 checks (the star, the gear and the F, turn off and on, second runs, a moved key
  and a nudged point not taken for drawn turns, the report lines); real-type set 148. The AE
  test gains a "drawn turn" step. **Not yet run in After Effects.**

**In After Effects 27** (the user's go-ahead; 0.10.3 -> 0.12.1, rounds 10-12 at once). The
Flock Rig session had AE with its test project open; it was asked first, said AE was free and
its saved test project could be closed, and was told when AE was free again.

- Demo test: 49 of 49 (`review/ae-log.txt`). Symmetry: the star into itself turned 36 deg
  morphs symmetrically, the thin plus only with sym. Drawn turn: turn off, the star keeps its
  72 deg turn ("drawn as a 72 deg turn, kept that way ..."); with turn, it swings 72 deg in 23
  in-between keys, 100 % of its area halfway. The panel row with sym 316 x 53 px; the guide
  465 x 759 px. Warnings: Zig Zag and the point-reading null named; Trim Paths, dashes,
  taper, the Stroke effect and text on a mask not.
- Real-type set: 73 of 73 (`review/art-log.txt`).
- **Found and fixed:** the time estimate said 25.1 s for a fix that took 7.3 s. Its machine
  calibration (a small fix timed against 160 ms measured on the reference machine) now ran the
  crossover and symmetry checks the reference didn't, so this machine read 3.28x slower than
  it is. → The calibration fix runs without them. Rerun: 14.7 s estimated, 7.6 s taken (the
  test's "within 2x" passes; it still runs high).
- The panel installed in the user's AE 27 is now 0.12.1, byte for byte the release.

## Round 13 · 2026-11-24 (the user: demos for symmetry and a few letter transforms)

The demo grows from two parts to four (31.5 s): Morph, Turn, **Symmetry** and **Letters**,
each Before / After in AE (`make-demo.jsx`) and the After half in the preview (`scene.js`).

- **Symmetry** (`demo-spec.js`, `MD.sym`): a star, the star turned 36 deg, a plus, an x and the
  star again, all sharing the upright axis, each drawn anew (its own start and direction, so
  none is a Free Transform turn of the last). Left, "Least travel" (the fix without its
  symmetry rule); right, "Symmetric" (the fix). Least travel swirls two of the four steps.
  - Found on the way: the star-turned-36 into plus step came out a little lopsided with the
    fix. Least travel put the plus's start 0.27 % of its outline from the symmetric start, and
    round 11's "within 2 grid steps counts as symmetric" left it there. → Snap onto the exact
    symmetric start, unless only a hair away (under a quarter step, a hold's identical keys).
    Now every step keeps the axis for 1 % more travel than least travel; a second run
    changes nothing; Node 4,408 + 148 unchanged.
- **Letters** (`demo-letters.js`, written by `art/demo-letters.mjs` from the repo's fonts):
  a, e, o, d, q in Comic Neue Bold at 560 px, max 200; left as typed, right fixed through the
  panel's own path (pieces matched, every path fixed). a into e gets a start chosen against a
  crossover.
  - Tried first: O, C, e, a, 8. Halfway through O into C the O's hole was still shrinking
    toward its dot after the outline had opened, and AE's non-zero fill painted it: a dark
    blob in the C's counter. C into e did the same growing. Measured on candidate chains
    (cells filled by a hole's winding alone): every chain whose letters keep their holes
    (aeodb, ADOPR, ARDOQ, B8) had none; M into W in this font twists (6.7 %). d into b split
    its stem into two humps halfway (symmetric, not pretty); d into q slides the bowl up.
  - → Written down as a limit ("Holes that close or appear"), with the simple way out: close
    such a hole before its outline opens.
- **In After Effects 27** (the user approved closing the demo project unsaved; a second,
  windowless AE 2026 with a Japanese untitled project was left alone): the demo test 51/51,
  including "every step on the right keeps the upright axis, the left swirls some" (right 4/4,
  left 2/4) and the letters fixed with a crossover avoided. Rendered with aerender (756
  frames, 26 s); `render/` (mp4, strip, gif) redone from it.

## Round 14 · 2026-11-24 (the user: "Yes, fix them", the hole blobs)

A letter's hole is its own path, and AE's non-zero fill paints any part of it the outline no
longer surrounds. 0.13.0 keeps every hole inside its letter (`MF.holeTiming`, baked by the
panel as labelled in-betweens on the hole's path, like a turn):

- **Closing** (O into C, b into c): gone by the latest outline progress that keeps every point
  a pixel inside (O into C: 62-68 % of the morph). **Opening** (C into e, c into d): the same
  played backwards (C into e only grows from 67-83 %, once the e is nearly shut).
- **Found on the way: holes that stay holes stray too.** Over 656 letter pairs in Comic Neue,
  Patrick Hand and Bangers whose holes all stay holes, 91 (14 %) showed a hole outside its
  letter halfway: b into e 30 % of the hole, e into 6 31 %, R into 6 27 %. → Such a hole
  shrinks about its centre just enough (a pixel to spare), under tents of slope 4 a morph so
  it eases in and out. After: none of the 656 shows (checked at 80 in-betweens a pair). b
  into e shrinks to 56 %; R into 6 and b into e in some fonts close up halfway (the hole's
  centre strays out), which reads as the counter filling for a few frames, not a blob.
  - The engraved @ into &: its hole wraps round its own centre, so it fit whole and strayed
    when smaller. → Where shrinking doesn't help, it closes up there.
- **`review/holes.png`**: five letter pairs, After Effects as it was (blobs ringed) and the fix.
- **The demo's letters** are now a, e, b, c, d: each step shows one thing (a into e a start
  against a crossover, e into b the hole shrinking, b into c closing, c into d opening). The
  AE test checks AE's own value at every frame of the letters part: no hole outside.
- **Found in AE: in-betweens between frames.** The demo's keys sit at 1.9 s, between frames at
  24 fps; the hole's in-betweens were spaced a frame from the key, so every rendered frame
  fell between two of them, and one showed a blend of the hole's last dot and its first grown
  key, outside the c (100 % of a hole at 6.75 s). → In-betweens (holes and turns) sit on the
  comp's own frames. A Node mock with keys off the frame grid now guards it.
- **Found in AE: the cost.** The first build made B into 8 take 22 s instead of 2 with no
  hole to fix (Node: 2 ms). The geometry made a point array per bezier sample and an object
  per path; ExtendScript pays far more for that than for arithmetic. → Flat arrays of numbers,
  a look at 15 in-betweens before any work (over the four fonts' pairs that missed none of
  127 strays; 7 missed one), each in-between measured once, turning steps skipped. In AE 27
  (`review/holes-bench.md`): 0.2-0.8 s a letter when nothing needs doing, 0.3-0.6 s a closing
  hole, 1-4 s a straying one (the ten-letter chain 5.5 s on 16 s). Not in the time estimate yet.
- Also fixed: a piece shrunk to a dot (or grown from one) counted as a turn you drew (any angle
  fits a dot within half a pixel), so O into C's hole turned 7 deg while closing. Drawn turns
  now keep about their size (scale 0.1-10).
- Tests: Node 4,432 (holes: closing, opening, shrinking, kept, fixed again the same, mock
  timelines on and off the frame grid); real type 186 (no hole outside its letter at 39
  in-betweens a step; holes kept inside per case). **In After Effects 27:** real type 111/111
  (holes kept inside as in Node; none outside its letter in AE's own frames), demo 52/52
  (`review/ae-log.txt`). Rendered with aerender (756 frames, 17 s); `render/` redone.

## Round 15 · 2026-11-25 (the user: shrink, teleport, regrow; a stagger; an appreciable margin)

The user: a hole "shrinking to zero, teleporting, then expanding again to form the second
letter's hole after an optional pause at the appropriate moment" looks far more graceful, and
staggered it can take the o's hole away before the o starts becoming a c. And "animation that
only barely escapes overlap is also unsatisfying": round 14 kept holes a pixel inside, closed
them as late as they could, and shrank straying ones "just enough".

- **0.14.0's holes** (`MF.holeTiming`, baked as before): a hole blends only if, at 15
  in-betweens, it keeps a pad of half the clearance it has at its keys (pushed out from its
  pole, the point farthest inside it). Otherwise it **swaps**: shrinks to nothing over the
  first 40 % of the outline's progress (`1 - smoothstep`), is nothing for a short pause while
  the letter changes most, and grows into its new shape over the last 40 %, carried along
  with the outlines' centre. A hole that **closes** shrinks away over the first 30 % (the
  stagger: gone before the O has really turned into a C); one that **opens** grows over the
  last 30 %. Each window is shortened only as far as the half-clearance pad needs. In AE the
  in-betweens are keys on frames while it shrinks or grows, and two keys of nothing while it
  is closed.
  - The pause: first 30 % / 70 % for swaps too; a into e then sat solid from 30 % to 70 %
    (`review/holes.png`), heavy for a hole that only came a bit close. → 40 % / 60 % for swaps,
    30 % / 70 % kept for closing and opening, where the stagger is the point.
- **Measured** over 661 letter morphs in three fonts (scan with true distances): 439 holes
  blend, 230 swap, 5 close, 5 open; none shows outside its letter; every hole keeps at least
  52 % of its key clearance (round 14 kept a pixel). 42 Comic Neue pairs are in `test.mjs`.
- **Outlines nearly touching themselves**, the same complaint for the letter's own outline:
  measured, not changed. Of 122 outline morphs between unlike letters, 82 pinch to under half
  their thinnest drawn part (u into 5, n into u to 0 %); a start within the travel allowed
  opens up 8 of them, any start 19. In the demo, e into b 28 % (49 % possible), b into c 37 %
  (50 %), c into d 1 % (the c's gap has to close to make the d's bowl). Written down as a
  limit; corner-to-corner matching is the way to most of them.
- **The demo's letters** are q, e, b, c, d: q into e blends, e into b swaps, b into c shrinks
  away, c into d grows.
- **Cost in AE 27** (`review/holes-bench.md`): 0.1-0.6 s a letter of up to 100 points; about
  1-3 s for engraved letters of 300-400 points and the ten-letter chain (2.6 s on 28 s). The
  pole is found on a 10 x 10 grid then refined, once per hole and key.
- Tests: Node 4,433 (hole kinds, windows, eased shrink and grow, nothing drawn while closed,
  half the clearance kept by true distance, the demo one of each, 42 pairs, a second fix the
  same, mock timelines); real type 186. **In After Effects 27:** real type 111/111, demo 52/52
  (`review/ae-log.txt`), no hole outside its letter in any frame. Rendered with aerender;
  `render/` redone. The user's panel is still 0.13.0.

## Round 16 · 2026-11-25 (the user: evaluate a low cap on keys, so the animation can be tweaked; "holes first")

Evaluated first (measured): the only keys the fixer adds are its in-betweens, a key a frame.
A turn written into the path needs keys because a blend between two turned copies squashes
(the demo F, 90 deg: 1 key 85 % of its area, 3 keys 96 %, 7 keys 99 %, a key a frame 99.9 %).
A hole doesn't: a blend between a shape and a key of nothing scales it, exactly. 16 timed
holes, written as their phase boundaries with Easy Ease, took 1.7 keys a step instead of
about 25 and kept 96 % of their clearance (a key a frame: 89 %).

- **0.15.0 writes holes as a key or two:** a key of nothing where the hole is gone (eased in),
  one where it starts to grow (eased out), linear between them (the pause); on frames, where
  the outline's progress read back from AE reaches the window's ends; labelled. Dragging them
  retimes the stagger and the pause. Every other frame of the result (and those next to the
  keys) is read back and checked with the plan's margin (`MF.holeKeeps`); a hole that falls
  short is written a key a frame instead. The fixer knows these keys by label plus a value
  closed to a point (they are not linear). The preview draws them (`MF.holeKeyed`).
- In AE 27: the demo's three holes on 4 keys; the real-type set's 17 holes on 24 keys (the
  ten-letter chain 7 on 10), none falling back, none showing outside its letter in any frame.
- **Found in AE: a stalled test.** The demo test sat 15 minutes with After Effects responsive
  and nearly idle (0.04 of a core): the user had File Explorer in front, and Windows throttles
  a background app. Brought forward, it finished in a minute, with one failure: the time
  estimate (a 7 s fix took 230 s). Rerun with AE in front: 52/52. → Keep AE in front for
  timed tests; a stall with low CPU and no dialog is throttling, not a hang.
- Not done (the user chose holes first): fewer keys for turns (a key every ~15 deg), and keeping
  the animator's retimed hole keys through a second Fix (today it resets them).
- Tests: Node 4,436 (eased hole keys keep half the clearance on the demo, b into e, O into C
  and R into 6; mock timelines: one key each, eased where the hole moves, a key a frame when
  asked); real type 186. **In After Effects 27:** real type 111/111, demo 52/52; the guide with
  its longer tip 461 x 791 px. `render/` redone.

## Round 17 · 2026-11-25 (the user: "continue with your recommendation")

The rest of round 16's recommendation: a turn on a few keys, and hole keys the animator moved
kept through a second Fix.

- **0.16.0: turn is a list** in the panel: no turn / turn (a key every frame, the smoothest)
  / turn, few keys (one about every 15 deg: 5 in a quarter turn, on the frames nearest even
  shares of the turn, auto-bezier and continuous in time so the speed runs through them;
  drag them to retime). The demo F's 360 deg: 20 keys instead of 92, at least 98.2 % of its
  area at every frame in AE (blending two turned copies shrinks it a little). A step measured
  at 90.3 deg first got 6 keys (ceil of 6.02): the count takes 5 % off before rounding up.
- **Hole keys you moved are kept**: before a fix writes anything, each timed hole's existing
  keys of nothing (their times, interpolation and easing) are read; if the plan still has
  the same number (one for a close or an open, two for a swap), they are written back at
  those times with that easing, only their values redrawn, and kept if the hole doesn't show
  outside its letter (checked every other frame); otherwise the fixer's own timing is used
  and the report says "retimed". The fixer now also knows its keys by auto-bezier (a few-key
  turn's), and checks a closed value before asking AE for auto-bezier (the mock lacked that
  call, and the error made the hole keys look drawn).
- **In After Effects 27**: the few-key turn and both kept-timing checks pass (a gone key
  dragged 2 frames and eased at 70 % stays put with its easing; dragged to just before the c
  it is retimed); the guide 465 x 775 px. The kept-timing checks first failed: the test's
  second Fix ran with another comp active (Fix works on the active comp), so nothing was
  fixed. → The test opens the letters comp first.
- **Found: "Fixed 1: 1000000000-0 pts"**: a fix that only rewrote pieces or holes, adding no
  points, printed the unset range. → No count then.
- **The runner and the user's AE**: the user was working in After Effects while my runner sat
  in it with jobs queued that it never picked up (its timer had died). It then fired while a
  dialog was open: "Cannot run a script while a modal dialog is waiting for response", in
  the user's face. → A runner only while the user has handed AE over; jobs not picked up in
  seconds mean a dead timer: take them out and stop it. The last demo run: 54 of 55, the miss
  the time estimate (7.3 s estimated, 18.9 s taken; 6.7 and 9.2 s in the two runs before,
  the fix it times unchanged this round), not rerun.
- Tests: Node 4,440 (few-key turns: 5 a quarter turn, auto-bezier, 97 % area, fixed again
  the same; kept hole timing and retiming on mock timelines); real type 186. AE: real type
  111/111, demo 54/55 as above. `render/` unchanged (the demo itself didn't change).

## Round 18 · 2026-11-25 (the user: "continue with your recommendation")

The last open piece of round 16's recommendation: turn keys the animator moves kept through a
second Fix, as hole keys already were.

- **0.17.0**: before a few-key turn's keys are removed, each step's are read (times, values,
  interpolation, easing, auto-bezier). Each key's share of the turn is read from the keys
  themselves: the angle from the step's first key to it, key to key (`MF.turnBetween`, 2D
  Procrustes over vertices and handles), against the angle to the step's last key. They are
  written back at their own times with their own easing, each redrawn as the turn at that
  share, so a turn the animator retimed stays retimed, also when a letter is redrawn. A step
  whose keys can't be read so (points that don't match, a key back to front) or no longer
  sit inside it gets the fixer's own. A turn a key a frame is still redone.
- **The fixer knows its keys by label alone** now: a turn key the animator re-eased loses
  auto-bezier and would have read as a drawn key. To make one yours, change its label.
- The report says "kept where they were" (they may be untouched), for turns and holes.
- Tests: Node 4,442 (a key dragged 2 frames and eased by hand at 60 % keeps both, redrawn
  within 0.05 px of where it was; a third Fix changes nothing); real type 186. **In After
  Effects 27**: the demo 56/56 (the dragged turn key stays at its frame with 60 %, all 20 kept;
  the two hole-key checks; the status line without the bogus count; the time estimate 21.8 s
  for 20.7). The runner ran only while the user had handed AE over, and stopped after.

## Round 19 · 2026-11-25 (the user: "please continue with your recommendations")

Round 15 measured that an outline often comes close to touching itself on the way (the
user: "animation that only barely escapes overlap is also unsatisfying") and that another
start opens up about 1 in 10 of those. This round takes that 1 in 10.

- **0.18.0, near-touching**: an in-between's neck is the least distance between two of its 64
  points at least 4 apart round the outline; a morph pinches when that drops under half the
  thinner key's (`NECK_MU`, the hole margin's half). `untangle` treats a pinch like a crossing:
  among starts travelling about as little (CROSS_SLACK), it takes one that neither crosses nor
  pinches, with neighbours that don't either, crossing nowhere on all 128 samples; a start that
  only pinches is never traded for one that crosses. Grid-hashed by the threshold, so an
  in-between costs about its 64 points.
  - **Found: a hang.** A random test key with 2 points has no neck (thr ~1e-16): cell numbers
    past 2^53 made `gx++` a no-op, and the loop never ended (the Node test ran 10+ minutes).
    → Cells counted from the loop's own corner, and no pinch check when the keys already touch.
  - **Found: a twist between samples.** & into $'s clear start (63 % → 96 % of its thinnest
    part) crossed itself in the rebuilt path at 45 % of the morph, where no sample looked.
    → `fix` checks the final paths of any step moved off a pinch (4 chords a segment, 19
    in-betweens) and, if one crosses, is done again without the pinch rule. & into $ keeps its
    start.
  - Results: v into h 44 % → 69 %, W into k 56 % → 77 %, a into e 71 % → 74 %, m into N 32 % →
    37 % (still pinching: no start helps), for under 1 % more travel. The report says "chosen so
    the shape keeps clear of itself" apart from "does not cross itself".
- **The demo letters** became q, g, b, c, d: q into e's outline now starts elsewhere (46 % →
  58 %), and its hole then swaps rather than blends; q into g blends, so the demo still shows
  one of each (blend, swap, close, open).
- Tests: Node 4,447 (v into h kept clear, & into $ not traded for a twist, a second fix the
  same, the report); real type 186. **In After Effects 27** (handed over, AE in front, progress
  every minute): demo 56/56, real type 111/111, fix times no slower than round 18's (& into $
  4.7 → 5.7 s: fixed twice). Rendered with aerender; `render/` redone.

## Round 20 · 2026-11-25 (the user: "Yes, start it" on corner-to-corner matching; then "Try again")

Spread evenly from their starts, two outlines pair points by how far round they are. Between
unlike shapes that folds, and no start helps: a T into an upside-down T pinches into a
figure eight, u into n crosses itself 26 times, M into W 36. This round pairs them by what
they are.

- **First try (not kept): corners paired, stretches between them spread evenly**, by dynamic
  programming over corner pairs (`art/corners.mjs`, deleted). By travel it untangled the
  flipped L (3 → 0 crossings) and N into Z (1 → 0), but the T still folded into a figure
  eight; priced "as pieces" (each stretch moving as a block) with any corner allowed to meet
  any, the T crossed itself 19 times. The user saw the sheet: "Try again".
- **Second try: dynamic time warping on samples** (`art/warp.mjs`): every sample of A against
  every sample of B, every start of B, where a stretch of one may pair with a single point of
  the other (steps (1,0), (0,1) beside the diagonals up to 3:2). Price: travel + λ (turning +
  σ stretching) of each little piece. Measured:
  - λ alone (σ = 1, stretching as dear as turning): clean on most letters at λ 0.001–0.003,
    but the T's in-betweens bulged into a dumbbell; above 0.01, v into h and N into Z crossed.
  - A hand-made "bar slides through the stem" pairing for the T (a + halfway: clean, 100 %
    neck) cost more than what the DTW found under every price tried: no price ranks it first.
  - σ = 0.1 (growing and shrinking cheap, turning dear) made every λ from 0.01 to 0.3 clean on
    every case but M into W, and the T became an I-beam on the way (its bar shrinks while the
    other grows): rectilinear, symmetric, no crossing. Kept: λ 0.1, σ 0.1.
- **0.19.0, the warp** (`morph-math.js`): coarse DTW (24 samples, every start), fine (80 and
  the corners) around the cheapest coarse starts in turn, straightened (Douglas-Peucker in
  (a, b), corners kept), checked (19 in-betweens, 128 points: no crossing, no pinch under half
  the thinner key's neck, any shared mirror axis kept), four starts at most, else even.
  - **Chains**: each step's pairs read from the shared key's fraction and merged into one
    parameter (tuples of every key's fraction); every key's corners inserted; the rebuild lays
    each key's points at its own fractions. → **Found:** a key starting elsewhere (fraction
    0.89) was checked against its original at the wrong place: 35 px "off" and 100 points; the
    tolerance check now takes the offset. A corner hit kept its 0–1 fraction where the layout's
    ran on past 1, and its handle spanned the outline (370 px). Points the warp keeps together
    in two keys while a third moves are rounding noise to a crossing test: repeats dropped.
  - **Smooth points stayed smooth only with one pace**: at a breakpoint the keys change pace
    differently, the handle ratios differ, and in-betweens kinked up to 14 deg. Both handles
    now take the geometric mean pace, so every key keeps the shared parameter's ratio.
  - **Points**: spread by the keys' mean span, a key running on while another held still got
    half the points it needed (u into n: 0.27 px off at 160). Spread by the longest span.
  - **Teeth**: rendered, the demo's star into square and square into heart showed little steps
    where short stretches collapsed to a point. Straightening runs shorter than 4 samples into
    their neighbours took them out (tried 0.6, 2, 4, 6: 4 clean, 6 the same).
  - **N into Z** crossed once at 64 fine samples whatever start; 80 cleared it.
  - **Symmetry**: the warp turned a star into the same star turned 36 deg into a swirl; a warp
    must now keep any mirror axis both keys share (at 20, 40, 60, 80 %).
  - **Fixing again**: the hard part. A fresh warp found on the rebuilt keys can pick another
    start than on the drawn ones (E into F: a third cheaper), a warp rejected at the final
    check can pass on the rebuilt keys, and travel alone misjudges (a warp can travel a
    quarter more than even, a star drawn turned a fifth travels 3.4 times as far and must be
    fixed). Kept: a step counts as fixed when its points pair cleanly (and keep a shared axis)
    and cost at most twice the cheapest warp from the same two starts. Measured: warped keys
    fixed again 0.3–1.9 times (mostly 1.0); drawn by point number, L into L flipped 2.3,
    T 6.7, u into n 2.5 (and it crosses).
  - Seeds (a hole growing from a point) aren't warped: the re-dealt seed has to come out as
    dealt, or a second fix moves it.
  - **Found: the panel tests read an older build**: a check failed only because
    `out/test-build` held the math from before a change. `test.mjs` now builds first.
- Results (`review/warp.png`, spread evenly → warped): T neck 65 → 100 %, travel 97 → 82 px; L
  flipped 61 → 100 %; u into n 26 crossings → 0, travel 96 → 55; E into F travel 73 → 46 (the
  bottom arm draws back into the stem); N into Z 1 crossing → 0; v into h 75 → 87 %; A into R
  52 → 99 %; K into X 39 → 35 px; M into W unchanged (every pairing crosses: spread evenly).
  The hole timing follows the new outlines: & into $ now swaps both its holes.
- **In After Effects (handed over; "is something the matter?" during the first run)**: the demo
  test took 19 minutes, not 2. Morph 3.3 → 59 s, letters 9.6 → 60 s, symmetry 40 → 670 s:
  far beyond Node's 4–5×. One check failed only on its own expectation (no start chosen against
  a crossover: the warp had paired those steps).
- **Speed, measured part by part in AE** (`bench/warp-parts.jsx`, two-key steps): where the warp
  works it cost only 30–40 % more (q into g 3.2 → 4.4 s); the waste was shapes sharing a mirror
  axis that end up unwarped (star into turned star 2.8 → 10.7 s): four starts tried, each a
  1.2 s fine search and an axis search of up to 3.4 s. Cut, in Node terms:
  - coarse search only from starts within 0.15 of the aligned one (all 66 warps on the tests'
    type took one within 0.125, all on the first try), with the 5 plain steps;
  - the fine search only in a band about the coarse pairing (FastDTW), in a compact table,
    from the one fine start nearest the coarse one (same 50 of 81 warps, a quarter faster);
  - three tries, one when the keys share an axis; the axis test in two stages (a direct mirror
    error first, the full search only when it's close), also on the final paths;
  - pinches checked at every other in-between; held keys skip the warp; a retry after the
    final check reuses the alignment and the other steps' warps; the DTW on flat arrays filled
    by index. (The final crossing check at 2 chords a segment on dense paths, tried too, let C
    into D through crossing itself: back to 4.)
  - Tried and undone: warping before choosing starts (the T's samples, laid from its start as
    drawn, gave a lopsided warp that lost the mirror axis); fewer samples (lost the T, N into
    Z, M into W for a quarter of the time).
  - Side effect: M into W now warps cleanly (36 crossings → 0, neck 2 → 87 %). A into R's warp
    travels 2 % more than even (it prices bending too); its test allows 5 %.
- **A warp the max can't fit**: random keys at max 24 came 14 px off with it (drawn exactly
  without). Kept only within 10× the tolerance, or about as close as without (letters at max
  100: 0.2–0.5 px off, said in the report).
- **AE again** (`bench/warp-demo.jsx`, the demo's path sets fixed once each): morph 7.5 → 24.5 s,
  letters 61 → 191 s, symmetry 6.3 → 8.6 s. Still about 3×: the letters' extra time is mostly
  their extra points (a warped outline needs about 1.6× to stay within 0.1 px, since every key
  needs points wherever any key is stretched). **The user: an option, off by default.**
- **0.19.0, shape**: the panel's new checkbox beside sym, saved like the others, in the guide;
  the time estimate counts Smooth at 3× with it. `MF.fix` warps only when `warp: true`.
- Tests: Node 4,574 (the warp asks for it; off by default; the estimate); real type 186 (back to
  the outlines spread evenly, & into $ one swap again).
- **The user's questions**: does shape ever give a worse result, could it be called "ultra" or
  "max"; does it ever break symmetry, and can symmetry come first. Measured: on 540 Comic Neue
  letter pairs (484 warped) shape removed crossings in 161 and pinches in 121, and made 1 new
  crossing (C into D: my 2-chord final check, reverted to 4), 9 new pinches, 119 thinner necks;
  so no "ultra". On 17 symmetric shape pairs it was never less symmetric, but only within the
  2 % the axis test allowed.
- **The user: "turn sym on by default. You're vastly overweighing travel efficiency compared to
  me. Aesthetic and intentional movement is what's important, not efficiency. Think
  synchronized swimmers as opposed to mail carriers."**
- **0.19.0, mirrored warps**: keys that share k mirror axes cut both outlines into 2k equal
  slices (each axis meets an outline twice); A's slice is paired with B's slice starting on the
  same axis (DTW end to end), and mirrored about each axis in turn all the way round.
  - First built about one axis only: symmetric, but a star's top point flattened while the
    others turned: not in unison. All shared axes at once fixed that.
  - Found: B's slice started on another axis made every arm swirl (46 px off symmetric).
  - Found: slivers a hundredth of a pixel long where a mirrored outline meets itself on the
    axis read as crossings in rounding; the warp's checks now count an end within a millionth
    of the other line as touching.
  - Found: the pole (where the axis meets the outline) refined by halving drifted when the
    crossing sat exactly on a sample (a bracket one sample wide, both ends on one side).
  - Measuring symmetry is its own trap: nearest sample points, or an axis through the samples'
    mean, read a perfect I-beam as 5-12 px off. Measured instead as the farthest a mirrored
    point lands from the outline (point to segment), about the area centre: plus into x 0.1
    spread evenly, 0.2 warped (its arms now pass through an eight-pointed star together, where
    spread evenly it melted into a blob); the T and the arrow below.
- **sym on by default** in the panel, under a new setting key (a sym switched off under 0.18
  doesn't carry over).
- **Travel only breaks ties**: a start that keeps the morph clean is taken however far it
  travels (48 starts tried; until now only within 20 % more travel): crossing letter pairs 201
  → 141, pinching 188 → 144, for 10 % more travel and time. What that exposed:
  - an F drawn turned 90 deg kept its drawn pairing, which halves its area halfway, because
    the shortest one crosses a little. **Collapsing** is now a criterion: an in-between under
    60 % of the smaller key's area counts as a pinch.
  - second fixes moved: a crossing or pinch read on the 64 samples of the drawn keys sent the
    fix to a far start; the rebuilt keys, sampled afresh, read the cheap start clean. A
    crossing now counts only if all 128 samples confirm it, and a second fix keeps a start that
    already keeps the morph clean (unless the other is symmetric, or the key was drawn as a
    turn).
  - M into W with shape (its warp from a third try, the cheaper two cross) cost 2.2 times the
    best pairing from its starts, so a second fix redid it; it is now also held to the warp the
    fix would take now (within 1.5 times).
- **Found looking at the redrawn sheet, not by a test: any start broke "symmetry first".** With
  sym on and shape off, the T into the upside-down T turned half round (101 px off symmetric)
  and the arrow up into down tumbled over lopsided, spiked (44 px); my notes still quoted 6.2
  and 4.6 px, measured before any start went in. The symmetric start's in-betweens melt (the T
  through an hourglass, the arrow a lozenge) under 60 % of the area, so the collapse rule
  traded them for a clean lopsided start far round. Now, with sym on, a symmetric start gives
  way only to a crossing, never to a pinch or a collapse. Two more traps on the way:
  - the symmetric start was checked on the nearest grid step, a quarter sample off: the T read
    as crossing where its halves meet on the axis; it is now checked where it is (pairAt);
  - the arrow's symmetric morph crossed on samples (1 at 64 points, 4 at 128) and never on its
    rebuilt paths (39 in-betweens, 32 points a segment): a step whose symmetric starts all
    cross on samples is fixed again from the symmetric start, and kept unless its final paths
    cross (as warps already were).
  T 101.5 -> 1.7 px, arrow 44.2 -> 0.0, both clean and matched on a second fix.
  The letters don't notice: of 535 Comic Neue pairs with sym on, 142 cross and 145 pinch,
  before and after (141 and 144 with sym off).
- **After Effects** (2027): the demo and the real-type test pass everything (`review/ae-log.txt`,
  `review/art-log.txt`). Timing them took three tries:
  - in an AE open 21 hours the real-type cases ran 1.3 to 3.3 times round 19's committed times,
    and the demo's calibration job (6 keys of ~16 points) 12.4 then 24.8 s against 5.6 s;
  - after the user restarted AE they still ran 1.1 to 2.1 times, though the calibration read
    0.91x the reference (round 19: 0.90x);
  - so round 19's own code went through the same test in the same session, back to back: 113.5 s
    in all, round 20 125.5 s, **1.11 times** (0.72 to 1.46 a case, partly noise;
    `review/art-times.md` is round 20's run). That is the ~10 % any start costs in Node (P into
    D into Q 34 -> 121 ms, M into W 11 -> 44, the engraved 8 into B 89 -> 237; most cases within
    a few ms). Round 19's committed times don't come back on another day (O into C 4.3 s then,
    5.1 s now, same code), and the calibration job's math alone, timed inside AE, took the same
    with either round's code (7.1 and 8.0 s; 7.6 and 6.7 s).
- The demo test failed two panel checks, both from this round's additions: the guide (sym and
  shape longer) was 858 px tall, over the 800 allowed: shape's text shortened, and wrapped at
  96 characters instead of 80 (measured in AE: 88 gave 481 x 810 px, 92 513 x 794, 96 527 x 778); the one row needs about 441 px since the shape checkbox, so the
  docked test's "wide" 420 px broke it in two (the test now docks wide at 560).
- Tests: Node 4,678 (mirrored warps; sym on spread evenly stays symmetric and is matched on a
  second fix; the T spread evenly keeps over half its neck); real type 186. The demo's morph, turn and symmetry parts come out exactly as before; its
  letters' outline takes other starts, so the After Effects render needs redoing.
