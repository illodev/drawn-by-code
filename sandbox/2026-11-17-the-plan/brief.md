# the-plan

- **Style:** blueprint (approved on its style test, `sandbox/2026-11-17-blueprint-test/`)
- **Format:** 16:9 · 56 s · 24 fps (first cut: 72 s, one camera, no cuts)
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

Second cut, after the user's round 3 («more rhythm, more changes of shot, more levels; it is
a bit slow»): 56 s, 38 shots cut on the half second (120 BPM), close and wide framings of one
sheet that now holds six drawings: roof plan, ground floor plan, basement plan, section B–B,
an axonometric of the three levels pulled apart, and detail C. The exact edit is `EDIT` in
`scene.js`; the clock on the sheet reads 02:14:00 at 20 s and runs in real time.

| Time | Shots | What happens |
|---|---|---|
| 0–8.5 | Grid · Stair · Ground floor · Roof · Basement · Three levels | The building is drafted in close shots, then level by level: the ground floor, the roof (lantern light, cowl, cat ladder), the basement (plant, lobby, strong room), and the three come apart in the axonometric. |
| 8.5–12 | Camera · Guard · The night runs | A camera's sector starts to sweep, the guard's mark is followed along his round, and the whole floor is seen running. |
| 12–20.5 | In · Aisle · Four seconds · Store · The plan · Clock | The red pencil, a note a shot: the ring round the side door, the blind aisle, WAIT, the 4 s gap, WAIT 12 s in the store, then wide for the last leg to the stair and the three marks set at the door. The clock turns 02:14:00. |
| 20.5–31.5 | They are in · West · Blind corner · Clock · Crossing · The door · Safe | The marks slip in as the guard turns his corner, wait with CAM 2's sector standing beside them, are followed along the counter in the gap, and the sector's edge comes back to the store's door as the third goes through. |
| 31.5–36.5 | He stops · Revision B · Struck out · Duct | The guard stops and turns; his beat is redrawn in white, △B BEAT CHANGED; the pencil strikes the route out and writes ?; then it rings the riser: DOWN. |
| 36.5–43 | Down · Section · Lobby · The empty store | In the axonometric the red line drops from the ground floor to the basement. In section the marks go down the riser dashed; on the basement plan they cross the lobby; above, the guard's mark walks into the empty store. |
| 43–48 | The wheel · A bolt · It opens · 0412 | Detail C: the hand wheel turns, a bolt draws back in a macro shot, the leaf swings, the wall of boxes is drafted through the opening; the pencil rings one: 0412. |
| 48–53 | Back · Up · Out | On the basement plan the line runs back to the riser; in the axonometric it climbs through all three levels; on the roof plan the marks cross to the cat ladder: OUT. |
| 53–56 | Revision | The title block: revision B is lettered, the pencil ticks DRG NO. 0412, the clock has stopped. Hold. |

The last beat is the film's small secret for whoever looks twice: the box they emptied has
the number of this drawing. What they came for was the plan.

## How it is built

- `bank.js`: the bank once, in metres, and the night's clockwork as functions of the film's
  second (`guardAt`, `camAngle`, `markAt`). `tools/check-plan.mjs` walks every frame and fails
  if a camera's sector ever holds a mark or the guard has one in front of him: the plan is
  true, with 2.3° to spare at the store's door.
- `plan.js`, `defences.js`, `section.js`, `levels.js` (basement, roof, the axonometric's ties),
  `extras.js`: the white drawings, one display list each, laid on the sheet by a translation
  (and the three plans stacked in the axonometric by one matrix each);
  what moves by itself (sectors, the guard, the clock, the door's wheel, bolts and leaf) is
  drawn every frame on the same ink layer.
- `pencil.js`: the red drawing, a second display list on the kit's pencil layer; the marks
  are drawn every frame from `markAt`, on the plan, in the section (dashed while behind the
  wall) and in detail C.
- Sound: a score alone, by the user's choice, generated with their go-ahead (`gen-music.mjs`,
  one take), measured (`tools/measure-score.py`) and laid on the film's grid (`lay-music.sh` →
  `private/mix.wav`, which the scene points at; without it the film renders silent). The
  committed render carries the score, by the user's decision.
