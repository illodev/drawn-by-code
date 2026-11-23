# Mask Morph Fixer for After Effects

Version 0.12.0 · After Effects 2026 (26.x) and 27 on Windows (Mac untested). The launch
checklist (what's left before a 1.0 worth selling) is a private page outside the repo.

`Mask Morph Fixer.jsx` makes a keyed path or mask morph cleanly. After Effects morphs one keyframe's path
into the next point by point, in straight lines, so keys drawn independently tear (different
numbers of points), spin (each key starts at a different point) or turn inside out (one
drawn the other way round), and a shape that turns (an F becoming an F on its side) shrinks
through the middle. The fixer gives every keyframe the same points, the same direction and
a start point that keeps the morph still, and can write a turn into the path so the shape
swings round, without changing what any key looks like, its time or its easing.

## Set up

1. A **Path** on a shape layer, or a **Mask Path**, with two keyframes or more. Rectangle,
   Ellipse and Polystar shapes are parametric: right-click › Convert to Bezier Path first.
2. Draw each key however you like: any number of points, either direction, any start.

## Install (a dockable panel)

1. **File › Scripts › Run Script File…** and pick `Mask Morph Fixer.jsx`: the panel opens
   floating, with the tip "click ? to dock this panel".
2. Click **?**, then **Install as a panel**. It copies itself into your own ScriptUI Panels
   folder (`%APPDATA%\Adobe\After Effects\<version>\Scripts\ScriptUI Panels`, or
   `~/Library/Preferences/Adobe/After Effects/<version>/…` on a Mac): no admin rights.
3. Restart After Effects and open **Window › Mask Morph Fixer.jsx**. It is a panel like any
   other: drag its tab to dock it, and it comes back with your workspace.

**File › Scripts › Install ScriptUI Panel…** does the same by hand. To update, run the new
file once and click **? › Update the panel**. If After Effects blocks the copy, turn on
*Preferences › Scripting & Expressions › Allow Scripts to Write Files and Access Network*.

## Run

```
[Smooth ▾] max [100] [ ] turn [ ] sym [Fix] [?]    docked narrow:  [Smooth ▾] max [100] [ ] turn [ ] sym
Fixed 1: 64 pts, 0.065 px                                            [Fix] [?]
```

Select the keyed paths (or their groups, or whole layers) and click **Fix**. The status line
sums it up; hover it for the full report per path. **?** opens the guide: three steps, what
each setting does in plain words, and the install button. It stays open while you work. The
guide's headings follow After Effects' theme (black on Light, white on Dark and Darkest).

**Before a fix it asks first** (Fix anyway / Cancel) when:

- something counts the points, and the fix adds points (64 where 4 were drawn): Zig Zag
  (ridges per segment), Pucker & Bloat (pulls every point) or Wiggle Paths (its detail goes
  between the points) after the path, in its group or any group above; or an expression in
  the comp that reads a point by its number (`points()`, `inTangents()`, `outTangents()`, as
  nulls from Create Nulls From Paths do);
- the fix will take more than 10 seconds (After Effects doesn't respond meanwhile). The
  estimate comes from the keys and their points, fitted to timings in After Effects 27
  (`bench/ae-bench.jsx`) and scaled to the machine's speed by a 0.15 s run the first time a
  long job comes up; it lands within about 2x (estimated 6.4 s, took 4.7 s).

After fixing anyway, the status counts the warnings and its tooltip lists them.

**Not asked about:** what measures along the path from its start, because a fix never moves
the first key's start (the other keys' starts move to line up with it, which is what stops
the spin). Trim Paths, stroke dashes, taper and wave, text on a mask, the Stroke and Vegas
effects and `pointOnPath()` keep working as they did on the first key; each also has an
offset or start setting.

**Letters with holes and shapes in several pieces.** Select the group or the layer. Paths that
belong together (siblings in one shape group, or a layer's masks of one mode, keyed at the
same times) are matched between keys first: each key's pieces are dealt to the paths so every
path morphs between pieces that correspond (outline to outline, a hole to the hole nearest
it), and a piece you draw as a dot (or collapse) grows from that dot: it becomes a tiny copy
of itself there. An O into a C: the hole closes into the dot you put inside the C.

**Long fixes:** hold Esc to cancel (checked for fixes estimated over 4 s; the warning before a
fix over 10 s says so). The fix is worked out in full before anything is written, so
cancelling changes nothing.

| Control | Default | What it does |
|---|---|---|
| **Smooth** | on | Every key gets points at the same places along its outline, with handles sized so in-betweens stay smooth. Each shape stays within **0.1 px on screen** of what you drew (the scales of its groups, its layer and its parents count: a layer at 400 % is fitted 4x tighter); corners stay exact points |
| **Exact** | | Your points stay where they are; the fixer only adds points by splitting curves where they lie, so every key is exact. In-betweens may show small kinks where a point's handles are uneven |
| **max** | 100 | Smooth only: the most points per key. If a shape needs more to stay within 0.1 px, it stops there and the status says how close it got ("~0.76 px (max)"). Big or detailed artwork needs more: letters at 400 px landed 0.15–0.7 px off at 100; 200–300 brings them in |
| **turn** | off | For shapes that turn between keys: points are matched as if the shape turned, and the shape swings round as a whole. The turn is written into the path as one key a frame along the arc, on shape layers and masks alike; no transform (group or layer) is keyed. Steps that don't turn stay put |
| **sym** | off | Symmetry first. Shapes that share a mirror axis (a star into itself turned, a plus into an x, a heart into a circle) morph symmetrically, each side mirroring the other, even when another match travels less, and a more thorough test finds axes in shapes drawn a little unevenly. Off, symmetry still wins whenever it costs about the same (up to 20 % more squared travel) |

Always on: every key is drawn in the same direction, and each key's start slides to where
the morph from the previous key travels least. All else being equal, it takes a start that
keeps the shape from crossing itself on the way (pinching into lobes or twisting a knot),
then one that keeps it mirror-symmetric when both keys share a mirror axis, and the report
says when it did either. The panel remembers its settings. With two
or more keyframes selected on a path, only those are fixed. Undo puts everything back.
Running it again on a fixed path leaves it alone ("already matched"); on a turned path it
writes the same in-betweens again.

**Retiming a turn.** The in-between keys a turn writes carry a keyframe label of their own
(label 15 in *Preferences › Labels*) and are linear; your own keys keep their easing. Every
fix removes those in-betweens first and works on the keys you drew. To retime a turn, move
your keys (the in-betweens can stay where they are) and click Fix again. To take the turn
out, fix with turn off.

## What it changes

The path's keyframe values; with pieces, which path holds which piece. With **turn**, also
one in-between path key a frame through each turning step (linear and labelled: the easing
is in the shapes), replacing the ones an earlier turn wrote. Key times, interpolation,
easing, hold keys of the keys you drew, the layer, its groups' transforms and anything else
stay as they were.

## How it works

- **Direction:** the signed area of each closed key; keys against the first clear one are
  reversed (shapes with no clear direction, like a figure eight, are left alone).
- **Start:** both shapes are sampled at 128 points from their starts; the next key's start
  slides to the offset with the least squared distance, around each shape's centre (searched
  on the sample grid, then refined). It moves only when that cuts the error by 5 % or more,
  so symmetric shapes keep their starts and a second run changes nothing.
- **Crossover:** the morph from the previous key is checked at 19 in-betweens (64 points of
  each outline): if one crosses itself, the starts that travel at most 20 % more (squared)
  are tried, the current start first and then the cheapest, and the first whose in-betweens
  don't cross, with crossing-free neighbours on the 128-step grid, is taken (a start right
  next to a crossing one still crossed between the checked in-betweens). On the real-type set
  that untangles a into e, M into W and a step of the ten-letter chain for 0.1 % more travel
  (`review/crossover.png`: top, the least-travel start; below, the one taken). Keys drawn
  crossing themselves are left alone. A step no start untangles is named in the report.
- **Symmetry:** each key's mirror axes are found from its samples. Quick (every fix): the
  principal axes, or for a shape with no main direction (a star, a plus, a regular polygon)
  the directions to every point locally nearest to or farthest from its centre (24 at most),
  each refined by small turns and kept if the shape matches its mirror within 2 % of its size;
  a circle is "round" (every axis). Thorough (**sym**): also every angle in 2 deg steps, twice
  the samples, within 4 % (a hand-drawn star the quick test misses). When both keys have
  axes of the same direction, the next key's start is read so that it sits as far from its
  pole (where the axis meets the outline) as the previous key's start sits from its own:
  then every point moves as the mirror of its partner. Least travel picks one of two
  mirror-image swirls on a tie; the symmetric match cost 3–4 % more on a star turned 36 deg
  and a plus into an x (`review/symmetry.png`). Rotational symmetry needs nothing: any start
  keeps it. Order: no crossover, then symmetry, then least travel. A step that turns is
  swung whole instead, which doesn't swirl.
- **Rebuild:** points go at the same fractions of every key's outline (each key's corners
  pinned exactly, the rest spread evenly), every handle a third of the arc to its
  neighbour. After Effects blends each handle in a straight line, so a smooth point stays
  smooth halfway only if its two handles keep the same length ratio in both keys: shared
  fractions guarantee it. Points are added until every key is within the tolerance; a path
  with loops or cusps it can't follow keeps its own points instead (and says so).
- **Exact:** every key gets a point wherever any key has one (by outline fraction), each
  added by an exact bezier split.
- **Max:** the rebuild starts at 16–64 points and adds more until the tolerance or the max
  (corners always keep a point, so a path with more corners than the max gets one each).
- **Turn:** the start search also tries the best rotation of the next key onto the previous
  one (2D Procrustes). A step counts as a turn only when that cuts the error by 20 % or more
  against a plain match that is really off (over 0.5 px RMS), so a circle never "turns" and
  a hold never spins. The turn is then measured on the matched keys and taken out of them
  (local keys: unturned, around the shape's centre). Each turning step turns about its fixed
  point (a turn plus a shift is a turn about one point), so the shape swings on an arc, as
  if you had turned it by hand with a group transform; a step that only slides moves.
- **Turn, written into the path:** the keys as drawn, then a key on every frame of a turning
  step, each the shape that turn would show (`MF.swing`) at After Effects' own eased progress
  between your keys, read back from the path with `valueAtTime`, so custom key speeds come
  out exactly. At every key the shape is exactly where you drew it. An F turning keeps 100 %
  of its area halfway (straight blending: 50 %).
- **Fixed again:** keys that already share their points, starts and direction, and differ
  only by a turn, are kept as they are and the turn taken out again, so the in-betweens come
  out the same.
- **Pieces:** each key's pieces are dealt out to the paths by the order with the least cost
  (centre distance, size, outline or hole), kept as drawn unless another cuts it by 20 %; a
  piece under 3 % of its key's largest (or under 1 px across) counts as missing and becomes a
  0.2 % copy of the same path's piece at the nearest key that has one.
- **Plan, then write:** every path is worked out first (cancellable), then all keys are
  written in one undo step.

Measured on the demo: 10 keys of 4–10 points become 64 points each in 2 s inside After
Effects; points travel 232 px around the shape on average before, 46 after; every key
within 0.065 px of its drawing.

## Limits that stay

What it doesn't do, and why; each is also said in the report when it happens.

- **Skipped:** paths with an **expression** (the expression would overwrite the keys), masks
  with **feather points** (they sit on segments that move), keys mixing **open and closed**
  paths (no shared outline to share points along).
- **Some keys selected:** only those are fixed; morphs into the others still mismatch. Pieces
  are only matched when all keys are in play.
- **Pieces:** only sibling paths keyed at the same times are matched (one group, or a layer's
  masks of one mode: an Add outline and a Subtract hole stay apart). Open paths aren't. A
  piece is "missing" only when drawn under 3 % of the key's largest piece or under 1 px.
- **Turn into the path:** one key a frame through each turning step, which is more keys to
  look at; the selected keys must be next to each other, and a Hold step doesn't turn. The
  turn's easing is in the in-betweens: retime by moving your keys and fixing again, not by
  changing the in-betweens' easing. The fixer finds its in-betweens by their label (After
  Effects 22.6 and later) and their linear keys: change either and they count as yours.
- **More points:** rebuilt paths are harder to edit by hand: edit before fixing, or use Exact.
  Big or detailed artwork needs a higher max to stay within 0.1 px.
- **On screen:** "0.1 px" is in comp pixels, after the scale of the path's groups, layer and
  parents; a 3D layer seen through a camera can look bigger than that.
- **Warnings:** the expression check reads the comp the path is in, for up to 0.8 s; an
  expression that picks a layer by number, or sits in another comp, isn't found.
- **Crossover:** only the start is chosen against it, within 20 % more travel; a crossover
  that needs more, or one smaller than the 64-point check sees (O into C: a small twist as
  the C's gap opens, which no start avoids), stays. A key drawn in between fixes those.
- **Symmetry:** only the start is chosen for it: points are still spread evenly along both
  outlines, so a morph whose symmetric version would need them spread unevenly (a T into an
  upside-down T: the bar ends would have to slide down onto the bar ends while the stem folds
  away, but evenly spread they swap places with the stem and cross) stays as it is, and no
  crossover outranks symmetry. Shapes whose axes point different ways (a T into a T turned
  90 deg) can't share one. See "Next: corner-to-corner matching" below.
- **Time:** the estimate runs high on small jobs (up to 4x) and close on long ones (within
  10 % on 15–24 s jobs). The crossover and quick symmetry checks add a fixed cost per key
  (about 0.3 ms in Node), the thorough one (sym) more (about 2.2 ms): counted into the
  estimate at ExtendScript's ~300x (90 and 700 ms a key), not yet benched inside After
  Effects. After Effects doesn't respond while a fix runs; Esc is read when the
  work checks in, so hold it.
- **No progress bar.** A floating window a script opens stays stuck on screen for good if
  anyone clicks After Effects while the script keeps it busy (Windows' "not responding"
  stand-in puts it back, and no ScriptUI call removes it), so the fixer opens none while it
  works. The warning before a long fix gives the time instead.
- After Effects stores path points as 32-bit floats (about 0.00004 px at these sizes).

## Next: corner-to-corner matching (dynamic time warping)

Planned, not built. Today the fixer chooses only where each key starts and then spreads the
points evenly along both outlines. Matching features instead (a corner to a corner, a bar
end to a bar end) and stretching the stretches between them would let morphs move the way
a person would draw them: a T into an upside-down T whose bar slides down while the old
stem folds into it and the new one grows, symmetric and without crossing, where even
spreading crosses. Dynamic time warping finds that pairing: the cheapest monotone path
through a table of "point i of one outline against point j of the other", which keeps the
outline's order and lets either side wait while the other catches up.

What it needs:

- **The cost:** travel, plus a price for stretching (or the morph slides points along
  straight edges for nothing) and for crossing over; corners paired with corners cheap.
- **Chains of keys:** every key needs the same number of points. Pick them on the first key
  and carry them through each step's pairing, so key 3's points come from key 2's, which
  come from key 1's; the rebuild then lays points at each key's own fractions instead of
  shared ones, and the handle ratios that keep in-betweens smooth need checking again.
- **Time in After Effects:** a full table is 128 x 128 per start, too slow in ExtendScript.
  A band around today's even match, tried only from the few best starts, keeps it near the
  current cost.
- **Tests:** the T and the upside-down T (symmetric, no crossover), the demo and the
  real-type set (no worse travel, no new crossings), and a second run changing nothing.

## For the repo

| File | |
|---|---|
| `morph-math.js` | The math, plain ES3: splits, alignment, rebuild, the shape checks |
| `morph-ae.jsx` | The After Effects half: the compact panel, its guide and installer, selection, reading and writing keys (and the turn into the group), report |
| `build.mjs` | `node sandbox/2026-11-21-ae-morph-fixer/build.mjs` → `Mask Morph Fixer.jsx`, the release (it leaves nothing on `$.global`), and `out/test-build/Mask Morph Fixer.jsx`, the same plus the exports the tests use; with an ES3 lint (reserved words, ES5+, non-ASCII strings, a caught error joined with `+`) |
| `test.mjs` | 4,351 checks in Node on the test build: the guide (plain words, every setting, version), headings per theme, the time model, pieces (dealt back, kept, growing from a dot), a turn written into the path (`MF.swing` = the group transform, progress read back; on a mock timeline: labelled in-betweens, fixed again the same, retimed, taken out), cancelling, the tolerance on screen (layers at 400 % and 25 %), the demo (with and without a max that bites), the turning F (angles, local keys, each key back where drawn, halfway = the F turned 45°), 60 random turns, 360 random morphs (shapes kept, counts, direction, smoothness halfway, a second run), the AE half on a mock path, and the keys AE stored |
| `demo-spec.js` | The demo's shapes and keys, shared by `make-demo.jsx` and `scene.js` |
| `make-demo.jsx` | Builds the demo project (Before / After). With `$.global.MORPH_TEST_OUT` set it also checks it inside AE (fixes, the panel floating, docked and docked narrow, its guide, installing into a scratch folder, every warning, the time estimate against a real fix, a scaled layer, the theme), logs (`review/ae-log.txt`) and saves the project: the AE test |
| `ae-bridge.jsx` | A test runner that lives in After Effects for the session: send it once with `AfterFX.exe -ro`, then drop jobs into `out/ae/bridge/inbox/` |
| `bench/ae-bench.jsx` | Times the fix inside AE on a grid of job sizes (`out/ae/bench.csv`): the data the time estimate is fitted to |
| `bench/ghost-window.jsx`, `bench/window-watch.ps1` | Reproduce the window Windows strands on screen when AE is clicked while a script keeps it busy, watched from outside through Windows' own window list: why the fixer has no progress window |
| `art/` | The real-artwork regression set (and `symmetry.mjs`: built shapes that share a mirror axis, least travel against symmetric). `ttf.mjs` reads letter outlines from the OFL fonts in the repo's `fonts/`; `cases.mjs` keys 20 cases the way a designer would (O into C, B into 8 pasted out of order, i into l, engraved letters of hundreds of points, a ten-key chain, turning letters, 24 px and 2000 px type); `test-art.mjs` runs them in Node (148 checks, `out/art/report.md`; no in-between crosses itself but O into C's small twist); `crossover.mjs` draws in-betweens with and without the crossover choice; `make-art.jsx` builds and fixes them inside AE through the panel's own code, plus two mask cases; `look.mjs` draws the glyphs to check the reader |
| `scene.js` | Engine preview of the After half, drawn the way AE interpolates the fixed keys |

Testing inside After Effects (with the user's go-ahead: the demo opens a new project).
`node build.mjs` first. Open After Effects normally, send the runner once
(`AfterFX.exe -ro ae-bridge.jsx`: with `-r`, AE refuses a script with a "second script"
dialog while it thinks one runs, which it sometimes does with nothing running; `-ro`
overrides that), then drop a job into `out/ae/bridge/inbox/` that calls
`$.global.MMF_BRIDGE.freshProject()` (it only closes an empty untitled project or one saved
under `out/`), sets `$.global.MORPH_TEST_OUT` (a folder in `out/`) and `$.global.MORPH_DIR`
(this folder), and `$.evalFile`s `make-demo.jsx`; `done/<job>.status.txt` says ok or the
error. Stop the runner (a job calling `$.global.MMF_BRIDGE.stop()`) before clicking around
in AE: its timer firing during a modal dialog raises an error dialog and can leave AE refusing
scripts until it restarts. It also stops itself after five idle minutes. Render the saved project with `aerender`, which leaves AE free:

```powershell
& "C:\Program Files\Adobe\Adobe After Effects 2027\Support Files\aerender.exe" -project out\ae\morph-fixer-demo.aep -comp "Mask Morph Fixer demo" -s 0 -e 347 -RStemplate "Best Settings" -OMtemplate "H.264 - Match Render Settings -  5 Mbps" -output out\ae\morph-fixer-ae.mp4
```

`render/ae-morph-fixer.mp4` is that render (After Effects), re-encoded with its BT.709 tags.
