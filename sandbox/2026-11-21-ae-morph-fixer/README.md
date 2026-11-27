# Mask Morph Fixer for After Effects

Version 0.19.0 · After Effects 2026 (26.x) and 27 on Windows (Mac untested). The launch
checklist (what's left before a 1.0 worth selling) is a private page outside the repo.

`Mask Morph Fixer.jsx` makes a keyed path or mask morph cleanly. After Effects morphs one keyframe's path
into the next point by point, in straight lines, so keys drawn independently tear (different
numbers of points), spin (each key starts at a different point) or turn inside out (one
drawn the other way round), and a shape that turns (an F becoming an F on its side) shrinks
through the middle. The fixer gives every keyframe the same points, the same direction and
a start point that keeps the morph still, can pair the outlines by shape (**shape**: a bar
shrinks into its stem, an arm draws back, instead of everything swinging round), and can
write a turn into the path so the shape swings round, without changing what any key looks like, its
time or its easing.

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
[Smooth ▾] max [100] [no turn ▾] [x] sym [ ] shape [Fix] [?]    docked narrow:  [Smooth ▾] max [100] [no turn ▾] [x] sym [ ] shape
Fixed 1: 64 pts, 0.065 px                                                         [Fix] [?]
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

**Holes stay well inside their letter.** A hole is its own path, and After Effects' fill
paints any part of it the outline no longer surrounds: a dark blob. A hole that only just
stays inside reads as one about to break out, so a hole blends into the next only if it
keeps at least half the ink it has round it at its keys. Otherwise it doesn't blend: it
shrinks to nothing over the first 40 % of the morph, and after a short pause while the
letter changes most, grows into its new shape, where that one sits, over the last 40 % (b
into e, R into 6, a into e). A hole that closes for good shrinks away over the first 30 %,
staggered ahead of the letter: the O's hole is gone before the O has really started turning
into a C. One that opens grows over the last 30 %, once the new letter has closed round it
(C into e). A window is shortened only as far as the margin needs. Each hole shrinks to and
grows from the point farthest inside it, and rides along when the letter moves
(`review/holes.png`: top, After Effects as it was; below, the fix). Over 661 letter morphs
in three fonts, no hole shows and every hole keeps at least half its ink (52 % at the
closest, true distance); a third of the holes that stay holes swap rather than blend.

**Holes are a key or two you can drag.** A hole that shrinks away gets one key on its path:
the moment it is gone (a path closed to a point, so nothing is drawn). One that grows gets
one: the moment it starts. A swap gets both, and the gap between them is the pause. They
sit on frames, are eased like Easy Ease where the hole moves, and carry the in-between label
(label 15). Drag the gone key to change when the O's hole disappears; drag the two apart or
together for a longer or shorter pause; change their easing in the Graph Editor. (Blending a
shape with a key of nothing scales it, so the hole keeps its shape whatever the timing.)
Before writing them, the fixer checks every other frame the keys would show against the
outlines, with the same margin; where one falls short, that hole is written a key a frame
instead. **A Fix run again keeps them where you put them**, with your easing, and only
redraws them (where the hole is and what it closes to), as long as your timing doesn't let
the hole show outside its letter; if it would, that hole is retimed, and the report says so.

**Long fixes:** hold Esc to cancel (checked for fixes estimated over 4 s; the warning before a
fix over 10 s says so). The fix is worked out in full before anything is written, so
cancelling changes nothing.

| Control | Default | What it does |
|---|---|---|
| **Smooth** | on | Every key gets points at the same places along its outline, with handles sized so in-betweens stay smooth. Each shape stays within **0.1 px on screen** of what you drew (the scales of its groups, its layer and its parents count: a layer at 400 % is fitted 4x tighter); corners stay exact points |
| **Exact** | | Your points stay where they are; the fixer only adds points by splitting curves where they lie, so every key is exact. In-betweens may show small kinks where a point's handles are uneven |
| **max** | 100 | Smooth only: the most points per key. If a shape needs more to stay within 0.1 px, it stops there and the status says how close it got ("~0.76 px (max)"). Big or detailed artwork needs more: letters at 400 px landed 0.15–0.7 px off at 100; 200–300 brings them in |
| **turn** | no turn | For shapes that turn between keys: points are matched as if the shape turned, and the shape swings round as a whole, written into the path, on shape layers and masks alike; no transform (group or layer) is keyed. **turn**: a key every frame along the arc, the smoothest. **turn, few keys**: a key about every 15 deg (5 in a quarter turn), auto-bezier in time so the speed runs smoothly through them; drag them to retime the turn. Between them After Effects blends two turned copies, which shrinks the shape a little (the demo's F: 98 % of its area at worst, 1.5 px off the arc). Steps that don't turn stay put. A key you turned with Free Transform swings by the angle you drew |
| **shape** | off | Smooth only: pairs the outlines by shape, so their parts slide, grow or shrink instead of swinging round (a T into an upside-down T becomes an I-beam on the way, E draws its arm back into the stem, u rolls into n without folding over itself). About 3 times as slow, and a warped outline needs more points; a step it can't pair cleanly is spread evenly as without it. See "Pairing by shape" below |
| **sym** | on | Symmetry first (on by default since 0.19: graceful, intentional motion over short paths). Shapes that share a mirror axis (a star into itself turned, a plus into an x, a heart into a circle) morph symmetrically, each side mirroring the other, even when another match travels less, and a more thorough test finds axes in shapes drawn a little unevenly. Off, symmetry still wins whenever it costs about the same (up to 20 % more squared travel) |

Always on: every key is drawn in the same direction, and each key's start slides to where
the morph from the previous key travels least, unless another start keeps the shape from
crossing itself on the way (pinching into lobes or twisting a knot), from coming within half
its thinnest drawn part of itself, or from losing over 40 % of its area (folding flat): then
that one, however far it travels (travel only breaks ties between clean starts),
then one that keeps it mirror-symmetric when both keys share a mirror axis, and the report
says when it did either. A key you turned with Free Transform (the same points, turned) keeps
the turn you drew: a star turned a tip turns, a gear turned half a tooth turns rather than
pulsing; with turn off, a big drawn turn shrinks through the middle, and the report says so
and suggests turn. The panel remembers its settings. With two
or more keyframes selected on a path, only those are fixed. Undo puts everything back.
Running it again on a fixed path leaves it alone ("already matched"); on a turned path it
writes the same in-betweens again.

**Retiming a turn.** The in-between keys a turn writes carry a keyframe label of their own
(label 15 in *Preferences › Labels*), linear (a key every frame) or auto-bezier (few keys);
your own keys keep their easing. Every fix removes those in-betweens first and works on the
keys you drew. With few keys, drag them to retime within a step, or change their easing: a
second Fix keeps them where you put them, as you eased them, each redrawn as the same share
of the turn it stood for (read from the keys themselves, angle by angle). To retime a whole
step, move your own keys and click Fix again. To take the turn out, fix with no turn.

## What it changes

The path's keyframe values; with pieces, which path holds which piece. With **turn**, also
one in-between path key a frame through each turning step (linear and labelled: the easing
is in the shapes), replacing the ones an earlier fix wrote; on a hole that shrinks away,
grows or swaps, a key or two of nothing (eased, labelled the same). Key times, interpolation,
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
  each outline, a crossing confirmed on all 128): if one crosses itself, the other starts are
  tried, the current start first and then the cheapest (48 of them), and the first whose
  in-betweens don't cross, with crossing-free neighbours on the 128-step grid, is taken (a
  start right next to a crossing one still crossed between the checked in-betweens). Until
  0.19 only starts travelling at most 20 % more were tried; any start (the user: "aesthetic
  and intentional movement is what's important, not efficiency") leaves 141 of 540 Comic Neue
  letter pairs crossing instead of 201, and 144 pinching instead of 188, for 10 % more travel. On the real-type set
  that untangles a into e, M into W and a step of the ten-letter chain for 0.1 % more travel
  (`review/crossover.png`: top, the least-travel start; below, the one taken). Keys drawn
  crossing themselves are left alone. A step no start untangles is named in the report.
- **Near-touching:** an in-between whose outline comes within half the keys' thinnest part of
  itself (its neck: the least distance between two of its 64 points at least 4 apart round
  the outline, against the thinner key's) only just escapes crossing, and reads as one about
  to break in two. A start that keeps clear is taken the same way, and only if it crosses nowhere, checked on all 128 samples and then again
  on the rebuilt path (& into $'s clear start twisted between the samples, so it keeps its
  own). Letter pairs: v into h 44 % of its thinnest part became 69 %, W into k 56 % 77 %, for
  under 1 % more travel; about 20 % more time a fix in Node.
- **Collapsing:** an in-between can keep clear of itself and still fold flat: an F drawn
  turned 90 deg, blended as drawn, shrinks to half its area halfway. An in-between under 60 %
  of the smaller key's area counts as a pinch, for the start and for the warp.
- **Pairing by shape (shape, the warp; off by default):** spread evenly from their starts, two
  outlines pair points by how far round they are, and between unlike shapes that folds: a T
  into an upside-down T pinched into a figure eight, u into n crossed itself 26 times. With
  **shape**, each step of a closed path in Smooth is paired by dynamic time warping over
  samples of both outlines, where a stretch of one outline may also pair with a single point
  of the other: a bar that shrinks away, a stem that grows out of a bar. The price of a pairing
  is its travel (around each shape's centre) plus how much each little piece of outline turns
  on the way (and a tenth of that for growing or shrinking along itself): pieces slide or
  grow instead of swinging round. Found coarse (24 samples, the next key's starts within 0.15
  of the one the fix chose: on the tests' type every warp took one within 0.125), then fine
  (80 samples and every corner, from the fine start nearest the coarse one, only near the
  coarse pairing), straightened into a few runs (a run shorter than 4 samples is smoothed into
  its neighbours: short ones left little teeth where a star's arm met the square it became),
  and kept only if its in-betweens neither cross nor pinch (checked again on the final paths);
  else the next start is tried, three at most, and failing those the step is spread evenly as
  before (C into H). Keys that share mirror axes are only ever paired symmetrically: each axis
  meets each outline twice, so k shared axes cut both outlines into 2k equal slices; one slice
  of A is paired with the slice of B that starts on the same axis, and that pairing is
  mirrored about each axis in turn all the way round. The morph is then exactly as symmetric
  as its keys, and every arm of a star or a plus does the same thing at the same time (a warp
  mirrored about one axis only kept the axis but flattened a star's top point while the others
  turned: symmetric, not in unison). With none clean, the step is spread evenly from a
  symmetric start.
  The T becomes an I-beam on the way (its bar shrinks while the other grows), the L's foot
  slides up into a Γ, E's bottom arm draws back into its stem, u's bowl rolls up into n's
  arch, M into W stops folding, a plus turns into an x through an eight-pointed star, every
  arm alike, where spread evenly it melts into a lumpy blob (`review/warp.png`: each case
  spread evenly, then warped, sym on). Off its mirror symmetry (the farthest a mirrored point
  lands from the in-between's outline, 300 px shapes): T into upside-down T 1.7 px spread
  evenly, 0.0 warped; arrow up into down 0.0 and 0.0; plus into x 0.1 and 0.2. On
  nine letter pairs: crossings 26 to 0 (u into n), 36 to 0 (M into W) and 1 to 0 (N into Z),
  travel up to 45 % less (A into R 2 % more: it prices bending too, and its thin neck goes),
  the thinnest in-between from as little as 1 % of the keys' thinnest part to 59–100 %. Steps that turn,
  keys drawn as a turn and kept, and a hole that is only a seed (growing from or shrinking to
  a point: its own timing does that) aren't warped. The report counts the steps paired by
  shape.
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
  keeps it. Order: no crossover, then symmetry, then least travel. With **sym** on, a
  symmetric start is never traded for a lopsided one to avoid a pinch or a collapse, only
  to avoid a crossing, and the crossing must show on the final paths: the samples are a
  stand-in (an arrow up into an arrow down crossed on them, never on its rebuilt paths), so
  a step whose symmetric starts all cross on samples is fixed again from the symmetric start
  and kept unless its final in-betweens cross. Until this was in, any start allowed sent the
  arrow tumbling over lopsided (44 px off symmetric) rather than melting evenly into a
  lozenge, and the T into the upside-down T turning half round (101 px off). A step that
  turns is swung whole instead, which doesn't swirl.
- **Rebuild:** points go at the same fractions of every key's outline (each key's corners
  pinned exactly, the rest spread evenly), every handle a third of the arc to its
  neighbour. After Effects blends each handle in a straight line, so a smooth point stays
  smooth halfway only if its two handles keep the same length ratio in both keys: shared
  fractions guarantee it. With the warp, each key has its own fractions: the steps' pairings
  are joined into one shared parameter (key 3's points come from key 2's, which come from key
  1's), every breakpoint and every key's corners pinned, the other points spread by the
  longest span any key has there; where a key changes pace but its outline is smooth, both
  handles are set at one pace so every key keeps the shared parameter's ratio (without that,
  in-betweens kinked up to 14 deg there). A breakpoint is a point in every key, so a long chain
  of warped keys gets more points. Points are added until every key is within the tolerance;
  a path with loops or cusps it can't follow keeps its own points instead (and says so).
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
- **Drawn turns:** a key whose points and handles are the previous key's turned by one angle
  (and scaled evenly, if at all), point for point, within 0.5 px, is a turn you drew. That
  pairing is kept, its start moved as far as the previous key's: least travel threw it away,
  and for a shape the turn maps onto itself that was no motion at all (a star turned a tip
  stood still) or a pulse (a gear turned half a tooth). With **turn**, it swings by the drawn
  angle. Without, it's kept when least travel would erase the motion, costs about the same,
  or the turn is 30 deg or less (blended straight, a turn shrinks the shape by cos(deg / 2):
  1.2 % at 18 deg); a bigger turn of a shape it doesn't map onto itself (an F at 90 deg, which
  blended as drawn halves) takes least travel, and the report suggests turn either way.
- **Fixed again:** keys that already share their points, starts and direction, and differ
  only by a turn, are kept as they are and the turn taken out again, so the in-betweens come
  out the same. A warped step counts as fixed when its points already pair cleanly and cost
  at most twice the cheapest warp from the same two starts (warped keys fixed again: 0.3 to
  1.9 times, mostly 1.0; an L into the L flipped drawn 6 points each, paired by point number:
  2.3, so it is fixed). A fresh warp isn't the yardstick: found on the rebuilt keys it can
  pick another start than on the drawn ones, and a second fix would trade one for the other.
- **Pieces:** each key's pieces are dealt out to the paths by the order with the least cost
  (centre distance, size, outline or hole), kept as drawn unless another cuts it by 20 %; a
  piece under 3 % of its key's largest (or under 1 px across) counts as missing and becomes a
  0.2 % copy of the same path's piece at the nearest key that has one.
- **Holes:** after the pieces are fixed, each hole at each key gets its pole (the point
  farthest inside it, on a grid) and its clearance (the largest pad, pushed out from the
  pole, that still fits inside the outlines: about the thickness of ink round it). A hole that
  stays a hole blends if, at 15 in-betweens, every point of it keeps a pad of half that
  clearance (by non-zero winding against the outlines' in-between). Otherwise, and for a
  hole that closes or opens: it shrinks about its pole (eased, `1 - smoothstep`) over a
  window from the start, grows over one to the end, each carried along with the outlines'
  centre, and is nothing between (every point at one place). The windows start at 40 % for a
  swap, 30 % for a close or an open, and are shortened (halving, then checked twice as
  finely) until the hole keeps its half-clearance pad all through. Written as keys of nothing
  (`MF.holeGone`) on the frames where the outline's progress, read back from After Effects,
  reaches the window's end: eased in (the gone key) or out (the grow key), linear across the
  pause. Every other frame of the result (and the frames next to the keys) is read back and
  checked with the plan's pad (`MF.holeKeeps`); a hole that falls short anywhere is written
  a key a frame. Measured before building it: 16 timed holes took 1.7 keys a step instead of
  about 25, and kept 96 % of their clearance at the closest (a key a frame: 89 %). The fixer
  knows its own keys by their label and either linear interpolation (turns) or a value closed
  to a point (holes). In After Effects every key sits on the comp's frames: keys a script set
  at 1.9 s sit between frames, and a frame drawn between two in-betweens showed a blend of
  two of them, outside its letter.
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
- **Holes** either blend or swap: a swapping hole leaves the letter solid for a moment in
  the middle of the morph, even where blending it a little smaller would have kept it open.
  A step that turns is left alone (no letter with holes there needed it), and so is a Hold
  step. Masks of different modes (an Add outline, a Subtract hole) aren't pieces: a Subtract
  hole outside its outline subtracts nothing, so it can't show.
- **Outlines that nearly touch themselves:** the warp keeps clear of it (a pairing that
  pinches is passed over for the next start); spread evenly, only the start is chosen against
  it: 144 of 540 letter pairs still pinch.
- **Pairing by shape is off by default:** inside After Effects 27 it made the demo's fixes
  about 3 times as slow (`bench/warp-demo.jsx`: the morph 7.5 to 24.5 s, the letters 61 to
  191 s, the symmetry chain 6.3 to 8.6 s), after cutting it down from 6 to 18 times (the
  first version: a search over every start, four tries, the full axis search each time), and
  a warped outline needs about 1.6 times the points to stay within 0.1 px (every key needs
  points wherever any key is stretched).
- **The warp's own limits:** a step whose every pairing tried crosses or pinches (C into H)
  is spread evenly, as before; pieces grow and shrink rather than bend, which reads well on type and
  geometric shapes and can look mechanical on organic ones (use Exact to keep your own
  points); a short stretch that collapses to a point is smoothed away, so a tiny feature may
  slide instead of growing. The warp costs time: see Time.
- **Turn into the path:** a key a frame (turn) or one about every 15 deg (turn, few keys)
  through each turning step; the selected keys must be next to each other, and a Hold step
  doesn't turn. A second Fix keeps a few-key turn's keys where they are (a turn a key a frame
  is redone); keys that no longer sit inside their step (a drawn key moved past them) or whose
  points no longer match are redone too. The fixer finds its in-betweens by their label alone
  (label 15; After Effects 22.6 and later): change the label and a key counts as yours.
- **Hole keys you retimed** are kept through a Fix only while the hole still closes or opens
  the same way (one key for a close or an open, two for a swap); a key relabelled to keep it
  becomes a key you drew, and the hole's path then has more keys than its letter's other
  paths, so its pieces are no longer matched together.
- **More points:** rebuilt paths are harder to edit by hand: edit before fixing, or use Exact.
  Big or detailed artwork needs a higher max to stay within 0.1 px.
- **On screen:** "0.1 px" is in comp pixels, after the scale of the path's groups, layer and
  parents; a 3D layer seen through a camera can look bigger than that.
- **Warnings:** the expression check reads the comp the path is in, for up to 0.8 s; an
  expression that picks a layer by number, or sits in another comp, isn't found.
- **Crossover:** spread evenly, only the start is chosen against it (48 starts tried); a
  crossover no start avoids, or one smaller than the 64-point check sees (O into C: a small
  twist as the C's gap opens), stays: 141 of 540 letter pairs. **shape**, or a key drawn in
  between, fixes most of those.
- **A second fix** keeps a start that already keeps the morph clean rather than trading it for
  another clean one that only travels less (a borderline pinch, read afresh on the rebuilt
  keys, once sent a second fix back to the cheaper start), unless the other is symmetric or the
  key was drawn as a turn.
- **Drawn turns** are found point for point: a turned key with a point nudged afterwards, or
  drawn again from scratch at an angle, is an ordinary morph (least travel, or turn's own
  detection).
- **Symmetry:** spread evenly, only the start is chosen for it: the morph is as symmetric as
  the points spread evenly from it allow (the T into the upside-down T: 1.7 px off, melting
  through an hourglass), and with sym on it gives way only to a crossing on the final paths;
  with **shape** the pairing itself is mirrored (0.0 px, through an I-beam). Shapes whose axes point different ways (a
  T into a T turned 90 deg) can't share one.
- **Time:** the estimate runs high on small jobs (up to 4x) and close on long ones (within
  10 % on 15–24 s jobs). The crossover and quick symmetry checks add a fixed cost per key
  (about 0.3 ms in Node), the thorough one (sym) more (about 2.2 ms): counted into the
  estimate at ExtendScript's ~300x (90 and 700 ms a key), not yet benched inside After
  Effects. Keeping holes inside isn't in the estimate: in After Effects 27
  (`bench/holes-bench.jsx`) 0.1–0.6 s a letter of up to 100 points, about 1–3 s for
  engraved letters of 300 to 400 points or the ten-letter chain (2.6 s on top of 28 s).
  With **shape**, Smooth is counted at 3 times as long (`bench/warp-demo.jsx`).
  After Effects doesn't respond while a fix runs; Esc is read when the work checks in, so
  hold it.
- **No progress bar.** A floating window a script opens stays stuck on screen for good if
  anyone clicks After Effects while the script keeps it busy (Windows' "not responding"
  stand-in puts it back, and no ScriptUI call removes it), so the fixer opens none while it
  works. The warning before a long fix gives the time instead.
- After Effects stores path points as 32-bit floats (about 0.00004 px at these sizes).

## For the repo

| File | |
|---|---|
| `morph-math.js` | The math, plain ES3: splits, alignment, rebuild, the shape checks |
| `morph-ae.jsx` | The After Effects half: the compact panel, its guide and installer, selection, reading and writing keys (and the in-betweens of a turn or of a hole kept inside), report |
| `build.mjs` | `node sandbox/2026-11-21-ae-morph-fixer/build.mjs` → `Mask Morph Fixer.jsx`, the release (it leaves nothing on `$.global`), and `out/test-build/Mask Morph Fixer.jsx`, the same plus the exports the tests use; with an ES3 lint (reserved words, ES5+, non-ASCII strings, a caught error joined with `+`) |
| `test.mjs` | 4,678 checks in Node on the test build: the guide (plain words, every setting, version), headings per theme, the time model, pieces (dealt back, kept, growing from a dot), holes kept well inside (O into C shrinking away by 30 %, C into O and C into e growing from 70 %, b into e and R into 6 swapping, q into o blending, the demo's q g b c d one of each, 42 Comic Neue pairs, every hole keeping half its clearance by true distance, a second fix the same; written as eased keys and still keeping half the clearance; on mock timelines: one key of nothing where the hole is gone and one where it starts to grow, eased where it moves, inside at every frame, a key a frame when asked for, on the comp's frames when the drawn keys aren't, fixed again the same, a gone key dragged and re-eased kept through a Fix, dragged where the hole would show retimed), a turn written into the path (`MF.swing` = the group transform, progress read back; on a mock timeline: labelled in-betweens, fixed again the same, retimed, taken out; few keys: 5 a quarter turn, auto-bezier, the F 97 % of its area or more at every frame, fixed again the same, a key dragged and eased by hand kept through a Fix), near-touching (v into h kept clear, & into $ not traded for a twist, a second fix the same, the report), the warp (off by default; nine letter pairs paired by shape: no crossing or pinch, travel about as little as spread evenly or less, the first key's start kept, a second fix the same; C into H spread evenly exactly as with it off; a three-key chain; a max too low for its breakpoints; the report; the estimate; mirrored for keys that share axes: T, arrow, plus into x symmetric, every arm alike, never less symmetric than spread evenly), cancelling, the tolerance on screen (layers at 400 % and 25 %), the demo (with and without a max that bites), the turning F (angles, local keys, each key back where drawn, halfway = the F turned 45°), 60 random turns, 360 random morphs (shapes kept, counts, direction, smoothness halfway, a second run), the AE half on a mock path, and the keys AE stored |
| `demo-spec.js` | The demo's shapes and keys, shared by `make-demo.jsx` and `scene.js`: the morph, the turn, and the symmetry chain (a star, the star turned 36 deg, a plus, an x, the star, all sharing the upright axis, each drawn anew) |
| `demo-letters.js` | The letters part, q, g, b, c, d in Comic Neue Bold (q into g: the hole blends; g into b: it swaps; b into c: it shrinks away; c into d: it grows), written by `art/demo-letters.mjs` from the repo's fonts (plain ES3 for AE) |
| `make-demo.jsx` | Builds the demo project in four parts: Morph, Turn, Symmetry (left: the fix without its symmetry rule, least travel; right: the fix) and Letters (left as typed, right fixed through the panel's own path, its holes kept inside, checked in every frame), each Before / After, in one 31.5 s comp. With `$.global.MORPH_TEST_OUT` set it also checks it inside AE (fixes, the panel floating, docked and docked narrow, its guide, installing into a scratch folder, every warning, the time estimate against a real fix, a scaled layer, the theme), logs (`review/ae-log.txt`) and saves the project: the AE test |
| `ae-bridge.jsx` | A test runner that lives in After Effects for the session: send it once with `AfterFX.exe -ro`, then drop jobs into `out/ae/bridge/inbox/` |
| `bench/ae-bench.jsx` | Times the fix inside AE on a grid of job sizes (`out/ae/bench.csv`): the data the time estimate is fitted to |
| `bench/holes-bench.jsx` | Times keeping holes inside apart from the fix, inside AE, on the real-type set (`out/ae/holes-bench.md`) |
| `bench/warp-bench.jsx`, `bench/warp-demo.jsx`, `bench/warp-parts.jsx` | Pairing by shape timed inside AE: the fix with and without it on the real-type set, on the demo's three path sets (`out/ae/warp-demo.md`: the time estimate's factor), and each part of one warp step (`out/ae/warp-parts.md`: what made it slow) |
| `bench/ghost-window.jsx`, `bench/window-watch.ps1` | Reproduce the window Windows strands on screen when AE is clicked while a script keeps it busy, watched from outside through Windows' own window list: why the fixer has no progress window |
| `art/` | The real-artwork regression set (and `symmetry.mjs`: built shapes that share a mirror axis, least travel against symmetric). `ttf.mjs` reads letter outlines from the OFL fonts in the repo's `fonts/`; `cases.mjs` keys 20 cases the way a designer would (O into C, B into 8 pasted out of order, i into l, engraved letters of hundreds of points, a ten-key chain, turning letters, 24 px and 2000 px type); `test-art.mjs` runs them in Node (186 checks, `out/art/report.md`; no in-between crosses itself but O into C's small twist; no hole shows outside its letter); `crossover.mjs` draws in-betweens with and without the crossover choice; `holes.mjs` draws letters whose holes close, open, stray or blend, as AE drew them and as the fix keeps them (`review/holes.png`); `warp.mjs` is the warp's prototype (its costs and settings tried side by side, `out/art/warp.png`) and `warp-fix.mjs` draws each case through the fix spread evenly and warped (`review/warp.png`); `make-art.jsx` builds and fixes them inside AE through the panel's own code (no hole outside its letter in AE's own frames), plus two mask cases; `look.mjs` draws the glyphs to check the reader |
| `scene.js` | Engine preview of the After half of all four parts, drawn the way AE interpolates the fixed keys |

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
& "C:\Program Files\Adobe\Adobe After Effects 2027\Support Files\aerender.exe" -project out\ae\morph-fixer-demo.aep -comp "Mask Morph Fixer demo" -s 0 -e 755 -RStemplate "Best Settings" -OMtemplate "H.264 - Match Render Settings -  5 Mbps" -output out\ae\morph-fixer-ae.mp4
```

`render/ae-morph-fixer.mp4` is that render (After Effects), re-encoded with its BT.709 tags.
