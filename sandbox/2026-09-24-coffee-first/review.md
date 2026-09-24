# Reviews · coffee-first

Each round: what was seen (auto and by eye), what was changed and what lesson comes out
of it. Lessons that apply to other videos go up to the relevant skill (see review/SKILL.md).

## Round 1 (auto)

- `review.mjs`: still stretch from 0.83 to 2.17 s. With tiny «z»s and 1.5 % breathing,
  for practical purposes nothing happens.
- By eye (sheet): the mug takes up 15 % of the width and the shot feels empty. The card
  covers the handle in «Phrase». The steam is flat strips with no edge or texture, off style.
- Engine: the energy strip was normalized against the camera pan and small movements
  did not show.

**Changes:** mug ×1.5 with sway and 3 % breathing, «z»s of 64–104 px, card further to the
right, steam remade as fixed cutouts that rise, tilt and fade out, and square-root
scale on the energy strip in `review.mjs`.

## Round 2 (auto)

- By eye: after the camera pan (4–4.5 s) an empty strip shows on the right. The kit's
  background and table did not cover the camera travel. `review.mjs` did not catch it.
- The final phrase was too small for being the message.

**Changes:** `paperBg` with configurable `bleed` (400 by default, on all sides) and a
wider table. `review.mjs` now warns about **transparent gaps** (tested with a scene
broken on purpose). 620×270 card and text at 88.

## Round 3 (auto, full-size stills)

- 0.54 s: the closed eyes showed the white under the lash and seemed to look down, not
  sleep. In the sheet at 480 px it could not be seen.
- 5.08 s: the wink reads. 5.96 s: the last frame holds up as a poster.

**Changes:** with the eye closed, the eyelid covers all the white. Sound effects added
(`audio.json`): hit on the fall, pops when the eyes open, card *swoosh*, marker and tap
on the wink.

## Round 4 (user)

> «El vídeo de la taza está bien, pero el humo sale fuera de la taza, no del café.»

(“The mug video is fine, but the smoke comes out from outside the mug, not from the coffee.”)

- Cause: the steam was painted **behind** the mug, with its base hidden behind the body,
  so it peeked out from behind the rim. The automatic review did not catch it because
  the checklist did not ask **where** each thing comes out of.
- **Changes:** the steam is painted in front, in mug units, clipped to «above the coffee
  line» ∪ «inside the coffee ellipse». Each strip starts fully under the surface and
  shows as it rises. It now follows the mug through the squash and the sway.
- **Lessons:** general checklist in `review` (origin of whatever emanates) and a style
  rule (how to clip it).

## Round 5 (user)

> «Mira una taza con humo real. El tuyo parecen un poco tentáculos quizás.» (with a
> reference photo)

(“Look at a mug with real smoke. Yours look a bit like tentacles, maybe.”)

- What the real steam in the photo has and mine did not: it is born **very thin** and
  almost invisible, it **widens and blurs** as it rises, it **drifts to one side**, it
  **curls** and ends in a point, and it is **translucent** with overlapping layers. My
  strips were cylinders of constant thickness, opaque, vertical and with a round tip:
  tentacles.
- **Changes:** new `kit.wisp()` in the style, a tissue-paper ribbon (wide faint halo +
  denser core, no white edge) with a thin-wide-thin profile, growing undulation, drift
  and a final curl. Two wisps per source instead of three, which rise, drift right,
  widen and fade out. They are still fixed cutouts: they do not boil.
- **Lessons:** in `animate`, stylize a real phenomenon starting from a real reference;
  in the style, the recipe for steam and smoke.
