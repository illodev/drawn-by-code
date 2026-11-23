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
