# Reviews · the-plan

Each round: what was seen (automatic and by eye), what was changed and what lesson comes out.
Lessons that apply to other videos go up to the matching skill (see review/SKILL.md).

## Round 0 (user) · the script

To the first script (a ray of light, `focal-plane`): «Maybe a heist?» To this one and its
four open questions (the script, the red pencil, the language, the sound): «It works for me.
Yes. English. I'd say only a soundtrack.» So: the script as written, red pencil approved,
lettering in English, and for sound a score alone (no effects, no voice).

## Round 1 (auto) · the plan is made true before anything is drawn

The timing is the film, so it was written first, as a model (`bank.js`), and checked by a
script over every frame (`tools/check-plan.mjs`) before a line was drafted.

- First run: CAM 2 saw the third mark for two seconds, inside the store, through the open
  doorway. The marks' waiting place moved east of the door, out of the line a camera has
  through it, and their way in bends that way at once.
- The checker was also flagging the marks while they were still pencil outside the building:
  it now starts at each mark's entry.
- The guard's round ran over CAM 2's symbol and label: its south side moved from 13.5 to
  12.9 m, which also puts him two metres from the side door as he turns his back on it.
- Result: no sightings; the closest a mark comes to a sector's edge is 2.3°.

## Round 2 (auto) · the sheet and the camera

Looked at stills at 1920 of every stretch and at two whole renders tiled every 2 s.

- The plan at the bar of the style test on the first still. Room names sat on door swings
  and the lift's label on its car: moved, or given `clear`.
- Camera sectors ran through the walls and out of the building: clipped to the hall.
- At the whole-plan framing the marks were 14 px across and 46 s of the film had one
  framing: the camera now goes in on the west half for the planning and the crossing, and out
  again for the route's last leg, so the marks and the sector's edge at the door read.
- The strong room's door is 2 m in a 32 m building: at any framing of the section its wheel
  and bolts were too small to be the film's payoff. It now happens in detail C (the same door
  at 1:25, with the marks beside it at that scale), reached by the drawing's own convention,
  a ring and a bubble; the section's door moves in step.
- Detail C first sat on the section's level notes and the third mark was cut by its edge:
  the detail moved right, the marks stand closer together, and they leave the detail before
  they walk back.
- `review.mjs`: transparent holes twice (a close framing that ran 3 units off the sheet's
  bottom, then 7 off its right edge): both framings pulled inside the sheet. No warnings now.
  Its «still stretches» (7.3–9.7 s, 60.8–61.8 s) are stretches where only small things move
  (the cameras being drafted, the ring round the box): left, with a slow camera drift under
  every hold; 69.3–71.8 s is the ending.

Not measured: there is no reference still for this film, so no detail gate; every view was
cropped at full size against the style's detail checklist instead.

## Round 3 (user) · the first cut

> Maybe I expected more rhythm, more changes of shot, more levels, and so on; it is a bit slow.

What it means: the «one sheet, one camera, no cuts» rule of the script was the fault. 46 of
its 72 s were one framing of one plan, and the building had a single level to rob. Changes:

- **Cut, on a beat.** 38 shots in 56 s (the first cut had none in 72), on the half second at
  120 BPM: wide shots of a drawing alternate with close ones (a camera's symbol, the clock,
  a bolt at zoom 6) and with shots that follow the guard or a mark. Each pencil note gets
  its own shot.
- **Faster clockwork.** The plan's crossing is 4 s instead of 5 (CAM 2 pans at 11°/s), the
  marks run at 2.6–3.5 m/s, the guard hurries once his beat changes. The checker caught the
  third mark seen for one frame at the store's door with the first numbers; the crossing was
  tightened until it passed (1.2° to spare).
- **Levels.** Two more plans drawn from the same model (basement: plant, lobby, strong room
  with its wall of boxes; roof: lantern light, cowl, cat ladder) and an axonometric that
  stacks the three with one matrix each and pulls them apart. The way down, the way up and
  the way out are now shots of their own: the red line through the levels in the
  axonometric, the marks on the basement plan, on the roof plan.
- **The kit** paints only the part of the sheet a shot shows (`paper({ view })`), so a close
  shot at zoom 6 has the cloth at full sharpness; and a display list painted small through
  a matrix can be thickened (`paint(..., { weight })`): the axonometric was too faint at
  the pens' own weight.
- `review.mjs`: no warnings, no still stretch of a second anywhere, every cut on the beat.

## Round 4 (user) · the score

> Use ElevenLabs for the soundtrack.

Permission given, for the score. One take was asked for (`gen-music.mjs`: a composition plan
at 120 BPM, heist jazz in D minor, nine sections in whole bars), 56 s, kept in `private/`.
Nobody here has heard it: it was laid by measurement (`tools/measure-score.py`, `lay-music.sh`).

- It plays at 119.74 BPM: 0.22 % faster keeps its beats on the film's half seconds to the end.
- Its last stab is at 52.0 s of the take and its chord is gone by 53.2 s. Laid half a second
  in, three of its section changes fall on cuts (8.5, 20.5, 36.5 s) and the stab at 52.5 s,
  so the cut to the title block moved from 53 to 52.5 s to land on it (the marks run the
  roof a little faster to be gone by then); the stab is echoed on the beat under the
  lettering, to 55.6 s.
- Its sections are not told apart by level (it builds steadily, a 4 s phrase all the way):
  whether the «drums drop out» bar at the guard's stop happened cannot be measured from
  level alone. To ask the user, who can hear it.
- Mix: −16.1 LUFS integrated, true peak −1.9 dBFS, the first half second silent.
- `review.mjs`: no warnings.

The committed render stays silent: the score was made on the user's account and whether the
repo's copy carries it is theirs to say.

**Open for the user:** the cut with its score (does the music fit, does it change where the film does); whether the committed MP4 should carry it.
