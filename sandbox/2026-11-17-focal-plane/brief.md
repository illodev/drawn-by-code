# focal-plane

- **Style:** blueprint (approved on its style test, `sandbox/2026-11-17-blueprint-test/`)
- **Format:** 16:9 · 60 s · 24 fps
- **Purpose / audience:** the first film in the blueprint style. The user, after the style
  test: «Invent a script yourself, I like it.» The subject is ours to choose; it continues
  the lighthouse of the test, whose sheet and model are already approved.
- **One-line idea:** one ray of light is followed across a single sheet, from a flame the
  size of a hand, through the lens that combs it flat, round with the turning optic, out
  over a sea that curves away under it, to the pencil of a navigator who fixes a ship's
  position on it.
- **Working title:** «Focal Plane». Script status: **set aside.** The user's answer was
  «Maybe a heist?»: see `sandbox/2026-11-17-the-plan/`. Kept as an idea for the style.
- **Why this:** a technical drawing explains by projection, so the film's edit is the
  drawing's own grammar. There are no cuts: every new view is projected from the one before
  (lines dropped from the section make the plan, lines dropped from the ship make the
  chart) and the camera travels along them. The physics is the picture: refraction is rays
  being ruled and bent, the flash is a plan that turns, the range is a straight line over a
  curve.
- **The through-line:** the ray. It is the one bold line that runs through every view, and
  the camera is always moving along it.
- **References:** the approved style test. Real things to draw from, each to be checked
  against a source before it is drawn: a first-order Fresnel apparatus (920 mm focal
  distance, 1.84 m inside, 2.59 m tall: dioptric belt, catadioptric prisms above and below),
  the chart abbreviation of a light (`Fl 10s 35m 18M`), the distance to the sea horizon
  (2.08 × √height in metres, in nautical miles: 12.4 M from the 35.4 m focal plane, 6.2 M
  more for an eye 9 m above the sea: 18.6 M).
- **On-screen text (literal, capitals, Routed Gothic; language to confirm with the user):**
  NORTHPOINT LIGHT · FRONT ELEVATION · SCALE 1:100 → 1:25 → 1:5 · OPTIC, SECTION ON AXIS ·
  FOCUS · FOCAL DISTANCE 920 · EVERY RAY LEAVES LEVEL · PLAN OF OPTIC · 8 PANELS · ONE TURN
  IN 80 s · A FLASH EVERY 10 s · FOCAL PLANE 35.4 m · SEA HORIZON 12.4 M · EYE 9 m ·
  SEEN AT 18.6 M · CURVATURE NOT TO SCALE · Fl 10s 35m 18M · LT BRG 047° · 0412 ·
  HOW A FLAME IS SEEN AT EIGHTEEN MILES · ILLODEV x CLAUDE
- **Music / rhythm:** no narrator: everything is said by the lettering. Sound to decide with
  the user. Without any paid service it can be synthesised in code: the pen on the cloth
  following each stroke, a clockwork tick in the plan shot with a soft bell on every flash
  (one every ten seconds, which is also the film's pulse: flashes at 30, 40, 50 and 60 s),
  sea under the last two views. A narrator or a score would need the user's go-ahead.
- **Must NOT happen:** a cut; a second colour; glow on the beam (light is drawn as ruled
  rays, never as an effect); a figure that is not true to the drawing; lower case; a view
  that is not projected from the one before.

## Shot list

One sheet, one camera, no cuts. Times are where each view's drafting begins and ends.

| Time | Shot | What happens |
|---|---|---|
| 0–6 | The tower | Close on blank cloth. The axis drops, the ground is ruled, and the tower's two sides rise together to the lantern while the camera rises with them (the test's elevation, compressed). |
| 6–13 | Into the lantern | The camera pushes in along the axis to the lantern; the scale note under the view re-letters itself as it goes (1:100, 1:25, 1:5). Inside the glazing the optic drafts itself round a flame no bigger than a hand, marked FOCUS. |
| 13–24 | The lens combs the light flat | The optic is cut on its axis: prisms in profile, hatched as glass. From the focus, rays are ruled out in every direction, a fan that would light the sky and the floor. Then the prisms are drawn one at a time, belt first, and each ray that meets its prism is bent level; the fan becomes a bundle of parallel lines leaving to the right. One of them is drawn bold: the ray. FOCAL DISTANCE 920 · EVERY RAY LEAVES LEVEL. |
| 24–34 | The optic turns | Projection lines drop from the section and the camera goes down them to the plan they set out: eight panels, eight beams. The plan turns about its centre, drafted mechanism and all. A fixed bearing is ruled to the east; each time a beam crosses it, a tick is ruled on a time scale beside it. ONE TURN IN 80 s · A FLASH EVERY 10 s. The first flash is at 30 s. |
| 34–46 | Straight line, curved sea | The camera follows the bold ray out of the plan and pulls far back along it: the lighthouse shrinks to a mark on a long arc swung with a compass, the sea (CURVATURE NOT TO SCALE). The ray leaves level, grazes the water at SEA HORIZON 12.4 M and carries on above the curve to where a ship's mast is drawn rising into it: EYE 9 m · SEEN AT 18.6 M. Flash at 40 s: the ray is ruled once more, end to end. |
| 46–55 | The fix | Projection lines drop from the ship to a chart below: the coast (freehand, from the test's site plan), the light's symbol and legend Fl 10s 35m 18M, the range arc swung at 18.6 M, the ship's dashed track entering it. On the flash at 50 s the navigator's bearing is ruled from the ship to the light, LT BRG 047°, and a small circle with the time, 0412: a position. |
| 55–60 | The sheet | The camera pulls back to the whole sheet: elevation, section, plan, the long arc and the chart, joined by their projection lines and by the one bold ray from the flame to the pencilled circle. The title block is ruled and lettered: NORTHPOINT LIGHT · HOW A FLAME IS SEEN AT EIGHTEEN MILES · ILLODEV x CLAUDE. At 60 s the last flash: the ray is ruled a final time. Hold. |

## How it would be built

- One world sheet in the still's pixels, several frames wide, one camera path over it
  (`CAM` keys as in the test, a hold at each view); folds across the whole sheet.
- The optic, the plan and the ray diagram come from one model of the lens in millimetres
  (prism positions and angles computed from the focus, so the rays really leave level);
  the horizon and the ranges from the formula; the chart's bearing from the positions.
- New in the kit: a group that can turn about a point while it is being drafted (the plan),
  a scale note that follows the camera's zoom, and a stroke that can be ruled again (the flash).
- Order of work: the ray diagram as a still first (it is the heart, and the hardest to make
  true), then the plan's turn as a few seconds of film, then the whole camera path as an
  animatic, then detail view by view.
