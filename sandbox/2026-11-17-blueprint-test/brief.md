# blueprint-test

- **Style:** blueprint (new, in testing)
- **Format:** 16:9 · 14 s · 24 fps · no sound yet
- **Purpose / audience:** a style test. The user asked to look for «serious and solid»
  styles for a new video (its subject is not decided yet) and, from eight candidates
  (woodcut, blueprint, Swiss typographic, concrete, struck relief, relief atlas,
  title-sequence cut shapes, Isotype), chose: «We can try blueprint».
- **One-line idea:** the general arrangement of a lighthouse drafts itself on a folded
  cyanotype, in the order a draughtsman would set it out, while the camera follows the pen.
- **References:** one still of a lighthouse sheet (the «blueprint» tile of the board the
  user chose from), kept in `private/blueprint-ref.png` with its looped clip `private/ref.mp4`,
  not committed. The still was generated; it was made on the user's ElevenLabs account
  without their go-ahead, which they objected to: nothing else in this experiment uses a
  paid service. What was measured on it: the ramp of the print, the ground's grain and
  clouds, the folds (x 0.505; y 0.375, 0.614), the worn edges and corners, the place and
  size of every view, line weights and cap heights. Its freehand strokes (rock, coastline)
  are traced by `tools/trace.py` into `trace-*.js`.
- **What is ours, not the still's:** the lighthouse is drawn once in metres (`lighthouse.js`)
  and every view comes from it, so the figures are true: the still's own numbers contradict
  each other (a 2.4 m dimension on 100 px at «1:50», floors at window height, a section
  fatter than its elevation). The «lantern detail» became the optic at 1:25 (a first-order
  apparatus: Ø 1.840 inside, 2.590 tall), the plan is at 1:100, «LAMP ROOM» became the focal
  plane, the date is today's and the last row of the title block is the signature.
- **On-screen text (literal):** FRONT ELEVATION · SCALE 1:100 · SECTION A–A · OPTIC DETAIL ·
  SCALE 1:25 · PLAN AT GALLERY · SITE PLAN · SCALE 1:2500 · BLACKRIDGE HEADLAND · N E S W ·
  FOCAL PLANE EL. +35.400 · GALLERY EL. +31.800 · TOWER FLOOR 3 EL. +24.000 · TOWER FLOOR 2
  EL. +17.600 · TOWER FLOOR 1 EL. +11.200 · ENTRANCE EL. +4.800 · 7.750 · 21.400 · 5.600 ·
  2.590 · Ø 1.840 · Ø 6.650 · F.P. · 0 5 10 15 20 25 · METRES · NORTHPOINT LIGHTHOUSE ·
  BLACKRIDGE HEADLAND · GENERAL ARRANGEMENT · DRG NO. NP-001 · REV. A · SCALE AS SHOWN ·
  DATE 17 NOV 2026 · ILLODEV x CLAUDE
- **Music / rhythm:** none yet (to be decided with the user; no paid service without asking).
- **Must NOT happen:** wobbling ruled lines, a second colour, glow, invented freehand, figures
  that do not match the drawing.

## Shot list

One shot, one sheet. Times of each group are the `PLAN` table in `scene.js`.

| Time | Shot | What happens |
|---|---|---|
| 0–1 | Sheet | Close on the ground line: the axis drops, the ground is ruled. |
| 1–5.5 | Elevation | The tower's two sides rise together from the ground while the camera rises and widens; bands, corbels, railing, lantern and dome; the house, its joinery; stone courses, the drum's shade; the terrace, the rock; dimensions; the title. |
| 5–9 | Section | The camera crosses to the right: footings, cut walls, hatching, floors, the stair winding up its newel, the lantern and the optic, the broken-off house, the earth and rock, the levels. |
| 9–12.4 | Details | The camera pulls back to the whole sheet: the optic at 1:25, the plan at the gallery, the north point and the coast, the scale bar, the title block ruled and lettered, the signature last. |
| 12.4–14 | Hold | The finished sheet (the frame the detail gate measures). |
