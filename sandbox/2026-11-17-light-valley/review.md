# Reviews · light-valley

Each round: what was seen (automatic and by eye), what was changed and what lesson comes out.
Lessons that apply to other videos go up to the matching skill (see review/SKILL.md).

## User feedback (translated from Spanish)

- «Let's look for serious and solid styles for a new video.» → eight candidates, then «Generate
  an image with ElevenLabs to see the different styles» (a board of the same subject in eight
  media).
- On the board's subject, a lighthouse, and another session's board that had chosen a
  lighthouse too: «Choosing a lighthouse seems incredible to me.» The model's first idea is
  the most probable one and two sessions converge on it: ask for the subject, or rule out the
  obvious one, before generating.
- «Let's go with the woodcut, but not a lighthouse» → «The light comes to the valley».
- «Decide for yourself; the only thing is, don't generate any more images with ElevenLabs.»

## Round 1 (auto) · the kit, and the street matched to its still

**Measured before drawing** (`ref/street-lit.png` at 1280 px): cuts 1.5–2.4 px wide (p90
3–7), 12–20 px long (p90 30–100, the sky longer), 17–22 % of a dark area carved, running
down the fall line of each slope (134° and 30°); paper specks in the black 12–20 per
10 000 px; ink (19, 20, 20), carved paper (216, 191, 159), ochre on paper (214, 162, 79);
a solid black at 12–28 (p10–p90) with a faint grain.

**The kit** (`styles/woodcut/woodcut.js`) works the block with two gestures, ink and cut,
and one mark: a lens-shaped gouge cut that is the same shape as a black dash left standing.
`hatch` lays gouges over a region along a direction field to a tone; `masonry` carves stone
walls as blocks; `print` presses paper, the ochre block and the key block with an uneven
film of ink. What changed during the round, each from a full-size crop against the still:

1. The first hatch was a machine's: marks evenly spread, all the same. Runs of parallel
   gouges (a carver repeats a stroke) and clumping fixed the look but not the tone.
2. Every region now carves to a **measured tone** (`tone.js`, `tools/tonemap.py`): the
   share of the block carved per 16 px cell of the still, counted softly (luminance between
   ink and paper, or ochre) because the still's greys are part of what the eye sees. With
   it, `hatch({ fit })`: marks are proposed generously and each is kept only if it brings the
   cells it crosses closer to their tone. The fit's coverage factor (0.86 of a lens's box)
   and a calibration pass (`tools/correct.py`, render against still per cell, three passes,
   `corr.js`) took the frame's bias to zero.
3. Masonry carved as lenses read as «eyes», then as brick: stones are now blocks (a lit top
   sliver with straight chipped sides, sometimes broken in two; a nicked end; the whole face
   inside dark joints in strong light) in courses of uneven height.
4. Pools of light as ovals of flat ochre read as stickers: now the ochre prints under the
   street and the cobbles are carved to the tone there.
5. The cones: solid bullets, then haystacks (long rays crossing the cone, a fringe at the
   foot). Now a crisp wedge from the hood's rim, carved, with short strokes running out from
   the bulb, fewer near it; the bulb is paper (the ochre rings it, never covers it); a hood
   on a finial, a swan neck for the near lamp.
6. The print was nearly binary (76 % black, nothing between): the film of ink is now uneven
   (the roller's passes, starved patches, the grain), the paper lighter and varied.

**Detail gate** (`out/street-lit.mp4` is the still looped; 12 × 12 tiles, at 5.5 s, all
lights on):

| check | value | limit |
|---|---|---|
| colour median | 9.4 | ≤ 8 ✗ |
| colour p90 | 16.1 | ≤ 27 ✓ |
| tiles too clean | 0.7 % | ≤ 6 % ✓ |
| tiles too busy | 8.3 % | ≤ 12 % ✓ |

Said plainly: **the colour median does not pass**, and this round did not find a way to
make it pass without tracing the still. The measurement behind that
(`tools/colourfloor.py`): the gate compares colour after a 29 px box blur, and a woodcut's
cuts are clustered at that scale. The still against itself shifted 8 px scores 7.5; shifted
12 px, 10.3. Two renders of this scene with different seeds score 5.0 against each other.
So the median only drops under 8 if the clusters of cuts sit within ~8 px of the still's,
which means copying where its cuts are, not carving to its tone. A sweep (tone maps of 8–16
px, fit cells of 4–8, a strict fit that refuses any mark that over-carves a cell) never went
below 9.2; the strict fit made the print too clean (46 % of tiles). The other three checks
pass. This is the open question for the user (see «Open» below).

**Still off, and seen:** the near house's stones are still more regular than the still's
rubble; the figures in the doorway are silhouettes with a thin rim, without the still's
folds and faces; the lamp poles are thinner and less lit than the still's; the village's
roofs are darker than the still's moonlit tiles.

**Motion:** `review.mjs` gives no warnings; every drawing is a fresh print of the same
block (the film of ink, the specks and the ochre's register move, the cuts do not), which
reads as a printed animation without boiling the drawing. 48 ms a frame warm at 960.

**Lessons** (into the skills): the colour floor of the detail gate for a texture style
(skill **replicate**); measure tone softly and calibrate it in a loop; a pool of light is
not a shape but more of the ground carved (skill **style-woodcut**).

## Round 2 (auto) · the animatic of «Corriente» (75 s)

The user approved the script (`brief.md`), the use of ElevenLabs for the score and the
gouge, and the style test's colour median: «Let's go with it. Yes. Yes.»

**Sound first.** Four takes of one score prompt (cello and low piano, 80 BPM, the film's
arc described by second) and four of each effect (`private/sound/`, not committed). Take 3
fitted the script uncut: silent until 15 s, a pulse that builds, its loudest stretch from
43 s, a decay under the print. Its pulse is eighth notes at 79.92 BPM; trimming 0.34 s of
its leading silence puts its bars on 15, 18, 21 s… and its strongest onsets on the switch
(39 s) and the old woman's shot (51 s). From 39 s the cuts sit one frame late, on the
score's own bars (its beat drifts 26–54 ms from a round 3 s grid). The silent opening is
the river (synthesised noise, faded under the score's entry) and the gouge: one carving
sound on each streak of the first shot, on the match, the lamp, the switch, every street
lamp, her bulb, the title, and the sheet peeled off (`audio.json`). Effects normalised to
a −3 dBFS peak, the takes with a clean onset chosen by measurement (no whistle band); the
mix raised 6 dB under a limiter. Nobody has listened to it.

**The film** is assembled by `scene.js` from one file per set in `film/` (the shared
helpers in `film/lib.js`): the valley is a plank larger than the frame (`Woodcut.plank`,
new in the kit) that the camera tilts across without re-cutting; the street is the style
test retimed to the bars; the print is the last frame of the lit valley pressed twice, as
paper and as the inked block (`printBlock`, new: carved wood pale with its grain, the uncut
face wet with ink), the sheet peeled off with `Motion.quad`.

What the first full pass showed, and what changed before showing it:
- The ranges were haystacks (every cut of a flank one way, curling at the saddles): the
  relief is now the skyline's fall line plus ridged noise for spurs, the faces turned to the
  moon carved most, and a gouge bends but never curls (`maxBend`).
- The river ran over the left mountain; the village was too small to read; the line of poles
  was invisible at night (its grooves now 2 px, the wires 1.6).
- At her window the old woman was black on black: the room behind her is now carved out from
  the match and then the lamp, so she stands against the light.
- The lit valley did not show the light: farms down the line with lit windows, larger lamps
  in the village, the camera stopping where both the moon and the village are in frame, the
  title in the dark of the sky.
- In her room she was a speck: the shot is drawn 1.5× about her table; the bulb's light on the
  wall is plaster carved and inked ochre, no longer a sunburst; the ochre block is cut away
  round the oil flame, which stays paper white (the film's rule).

**Still off (for the detail pass):** the people are blocky figures from a pose (fine for timing,
not for the film: they need design references, as the workers in `ref/raising-pole.png`);
hands are fists; the window wall is noisy; the insert of the hammer is unclear; the sheet's
peel is a flat slab turning away, not paper curling.

## Open

- The detail gate's colour median (9.4 for a limit of 8): accept it for this style with the
  measured floor, or trace the still's clusters of cuts to pass it.
