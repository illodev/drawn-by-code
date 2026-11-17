# the-plan

- **Style:** blueprint (approved on its style test, `sandbox/2026-11-17-blueprint-test/`)
- **Format:** 16:9 · 70 s · 24 fps
- **Purpose / audience:** the first film in the blueprint style. The user left the subject
  to us («Invent a script yourself, I like it»); to the first proposal (a ray of light
  followed from a lighthouse to a ship, `sandbox/2026-11-17-focal-plane/`) they answered:
  «Maybe a heist?» This is that script. **Status: approved by the user**, with their
  answers to the four open questions: «It works for me. Yes. English. I'd say only a
  soundtrack.» So: the script as written, the red pencil, lettering in English, and for
  sound a score alone (no effects, no voice).
- **One-line idea:** a perfect plan is pencilled in red over a bank's blueprint and carried
  out on it by three numbered marks, until the building changes a line and the crew has to
  get out of the plan the only way a floor plan cannot see: down, through the section.
- **Working title:** «The Plan» (fiction: an invented bank, no real building, no real method).
- **Two hands, two inks.** White is the building: the architect's print, ruled, lettered
  in Routed Gothic, and it moves by itself (cameras sweep, a guard walks his beat). Red is
  the plan: a pencil over the print, freehand, dashed routes, timings and notes in a
  quicker hand. The film is the argument between the two. The red is the one accent the
  style's rules allow to be proposed (a red pencil revision): approved by the user for
  this film.
- **Why it is a blueprint film:** nobody is drawn. The crew are three red numbered circles,
  the guard a plan symbol on a dotted beat, each camera a sector that turns. The escape is
  the drawing's own grammar: a projection line dropped from the plan to the section. And
  the views agree, because the bank is drawn once in metres.
- **References:** the approved style test for the look. To study before drawing: real
  architectural plan conventions (door swings, stairs with their arrow, a lift shaft, a
  duct's crossed square, section marks, revision triangles and the revision table of a title
  block), and how heist films stage «the plan over the plan» (the briefing over drawings).
- **On-screen text (literal; white in Routed Gothic capitals, red in a pencilled hand;
  language to confirm with the user):**
  white: FIRST MERIDIAN BANK · GROUND FLOOR PLAN · SCALE 1:100 · BANKING HALL · TELLERS ·
  MANAGER · STORE · STAIR · LIFT · DUCT · STRONG ROOM BELOW, SEE SECTION B–B · CAM 1 · CAM 2 ·
  CAM 3 · GUARD'S BEAT · SECTION B–B · STRONG ROOM · BOX 0412 · △B BEAT CHANGED ·
  DRG NO. 0412 · REV. A → REV. B · ILLODEV x CLAUDE
  red: IN · 02:14 · WAIT 12 s · NOW · 4 s · ? · DOWN · 0412 · OUT · ✓
  a running clock, white: 02:14:00 … 02:15:10 (real time: the film's seconds are its seconds)
- **Music / rhythm:** the clock is the pulse: one tick a second, 60 BPM, cuts of attention
  (never of picture) on the ticks. No narrator: the plan is read as it is written. Sound to
  decide with the user; without a paid service it can be synthesised in code: pen on cloth
  for white, a softer pencil for red, the tick, a low held tone that tightens at the hitch,
  bolts drawing back, a breath of air in the duct. A score (a heist wants one) or a voice
  would need the user's go-ahead.
- **Must NOT happen:** a drawn person or face; a cut; a third colour; glow; lower case in
  white; a real bank, brand or a method that works anywhere but on this sheet; a timing
  joke that needs explaining.

## Shot list

One sheet (the plan above, section B–B under it on the same x, detail C, notes, legend and
title block to the right), one camera, no cuts. 72 s. Every time below comes from `bank.js`
(the model, the guard, the cameras, the marks) and `WHEN` / `CAM` in `scene.js`; the clock on
the sheet starts at 26 s and runs in real time (02:14:00 → 02:14:43).

| Time | Shot | What happens |
|---|---|---|
| 0–8 | The building | Close on blank cloth: the column grid, then the bank's ground floor drafts itself: walls in poché, doors with their swings, the tellers' counter, the stair, the lift, a small crossed square lettered DUCT, the note STRONG ROOM BELOW, SEE SECTION B–B. The camera widens to the whole plan. |
| 8–15 | The night runs | The clock's box, three cameras and the guard's beat are drafted and start to move: sectors sweep the hall, the guard's mark walks the dotted round. |
| 15–26 | The plan | The camera goes in on the west half. The red pencil rings the side door, IN, and draws the route leg by leg: up the blind aisle, WAIT, across the counter front in the 5 s CAM 2 looks away, into the store, WAIT 12 s, then NOW along the counter to the stair, ringed. The camera widens for that last leg; three numbered marks are set at the door. |
| 26–38 | It works | The clock starts. The marks slip in as the guard turns his corner two metres away, wait in the blind corner with CAM 2's sector standing right beside them, cross when it swings off, and the sector's edge comes back to the store's door as the third goes through it. |
| 38–46 | The building changes a line | The guard stops and turns. In white, his beat is redrawn across the hall and into the store, with its triangle: △B BEAT CHANGED; the old round fades. The pencil strikes the route to the stair, twice, and writes: ? |
| 46–55 | Out of the plan | The pencil rings DUCT: DOWN. Projection lines drop from the plan and the camera goes down them while section B–B is set out: slabs, the hall's north wall with its doors and counter, the basement lobby, the riser as hidden lines with its cowl on the roof. The marks go down it dashed (they are behind the wall we look at), come out of the grille and drop to the lobby floor, while above the guard's mark reaches the store's door and goes in. |
| 55–62 | Detail C | A ring and a bubble round the strong room's door send the camera across the sheet to detail C, the same door at 1:25, the three marks beside it at that scale. The hand wheel turns, eight bolts draw back, the leaf swings on its hinge; through the opening the wall of boxes is drafted row by row. The pencil rings one: 0412. |
| 62–66 | Out | Back at the section, a red line runs from the box along the lobby, up the riser and out of the cowl: OUT. The marks follow it and leave the top of the drawing. |
| 66–72 | The sheet | The camera pulls back to the whole sheet. Revision B is lettered in the table and in the title block; the pencil ticks DRG NO. 0412; the clock stops. Hold. |

The last beat is the film's small secret for whoever looks twice: the box they emptied has
the number of this drawing. What they came for was the plan.

## How it is built

- `bank.js`: the bank once, in metres, and the night's clockwork as functions of the film's
  second (`guardAt`, `camAngle`, `markAt`). `tools/check-plan.mjs` walks every frame and fails
  if a camera's sector ever holds a mark or the guard has one in front of him: the plan is
  true, with 2.3° to spare at the store's door.
- `plan.js`, `defences.js`, `section.js`, `extras.js`: the white drawing (one display list);
  what moves by itself (sectors, the guard, the clock, the door's wheel, bolts and leaf) is
  drawn every frame on the same ink layer.
- `pencil.js`: the red drawing, a second display list on the kit's pencil layer; the marks
  are drawn every frame from `markAt`, on the plan, in the section (dashed while behind the
  wall) and in detail C.
- Sound: a score alone, by the user's choice. Not made yet: it needs their explicit go-ahead
  for the paid service, with what it would cost.
