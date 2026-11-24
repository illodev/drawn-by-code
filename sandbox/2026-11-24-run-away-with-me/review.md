# Review · run-away-with-me

## Round 0 · brief and the song's map (no picture yet)

The user's requests, translated:
- «I want to make a videoclip for "Run Away with Me" by Carly Rae Jepsen, in a retro neon
  style, but not the typical empty one.» Twelve synthwave references given (kept out of
  the repo).
- «I would like it to be very Miami: sex, drugs, party, the love of two people. Obviously
  the sex would not be explicit.»
- «The drug use would lead to lights, maybe "visual hallucinations"; we have to catch the
  music's jumps well.»

Done:
- Measured the song (`tools/measure-song.py`): 119.00 BPM with no drift, bar 0 at 0.415 s,
  sections from five bands per bar, every jump of level and bass on the beat grid.
- Word times from a local transcription (`tools/transcribe.py`, no paid service); chorus 2,
  which the model skipped, is chorus 1 moved by 33 bars, checked on a clip.
- `review/song-map.png`: bands, sections, jumps and sung phrases on one timeline.
- Script v1 in `brief.md`, every jump given its picture.

Open (asked): 16:9 and the whole song; permission to generate the two characters' design
sheets (about 433 credits a sheet, 4–6 sheets); words on screen (the title only, or also
neon signs).

## Round 1 · the style test (0:59–1:07), first render

The user, translated: «Yes, the whole song, in pieces, and we review as we go»; «yes» to the
character sheets; on words on screen: «I'd have to see it».

Done:
- **Cast sheets:** six generated sheets (three of her, three of him, gpt-image-2.5-sunburst
  at 2K, 275 credits each, 1,650 in all), asked on a pure green ground; they came back with
  a transparent ground (alpha), so no keying is needed. Kept in `private/ref/` until the user
  picks; `review/cast-*-options.jpg` shows them.
- **The style:** `styles/retro-neon/neon.js` (camera, light layer and bloom, tubes, glints,
  reflections, rim, the trip's toolkit) and `.claude/skills/style-retro-neon/` (in testing).
- **The style test** (`scene.js`, four shots on the bar lines of bars 29–32):
  A over the trunk behind the two of them, a lamp over them on every beat; B a fixed camera
  beside the causeway, the car coming in and drawing away towards downtown; C the crest in the
  bar without bass, a crane rising, the lamps dimming, then an in-breath; D the drop at 1:05
  («baby» lands on it): a flash, tracers from every light, halos, colour swinging pink to cyan,
  the city breathing on the kick, the deck and the bay turning into a grid of light.
- **Parallel agents:** the car (`props/car.js`) and the far world (`set/skyline.js`: sky,
  ~330 towers, a waterfront of Art Deco hotels with neon, a marina, the bay, the port and the
  cruise ship), from one brief (`briefs/style-test.md`). Both came back at the bar.
- **The causeway** (`set/causeway.js`): a planted median with shrubs and uplit royal palms,
  lamps every V × beat metres, neon tubes on both parapets, wet streaks on the asphalt, glints
  on the water, piers.
- **Faults found and fixed before showing:** light glowing through the car and the deck (two
  bloom passes, the car erasing the light behind it); tail lights burning to white; a sticker
  outline round the couple (rims on the picture only, thin); hue turning through green; lamp
  reflections as dots; a giant halo on the nearest lamp; the trip's grid over the car. Frame
  cost 310 → 210 ms at 1920 (bloom summed at low resolution).

Automatic review: no warnings, no state between frames; 222 ms a frame warm at 960.

Known and left: the couple costs ~40 ms a frame; shot A hides most of downtown behind the
hump (the crest is the reveal); the far world is ~70–90 ms in A and D.

## Round 2 (user) · «something more homemade, this drawn style, not a 3D render»

The user, translated: «Maybe I was looking for something more homemade, maybe this drawn
style, not a 3D render», with one of their references: a hand-drawn digital illustration of
a woman in a neon street (flat neon inks, a thick dark brush line, highlights laid on as
loose strokes of cyan, red and orange, buildings drawn with the same line).

→ Same world, cameras and timing; a new way of painting:
- Measured the reference's palette (k-means, 14 clusters): magenta #e106d3 18 %, navy
  #0f0138 15 %, salmon #f45a7f 10 %, deep blue #0e0558, violet #7407f0, blue #0f0ff1, indigo
  #200887, purple #ad19b0, plum #7a1581, cyan #67deef, with orange and gold accents.
- `styles/retro-neon/ink.js`: a brush stroke that tapers, varies its pressure and wobbles,
  with a new wobble on every drawing (12 a second: the line boils on twos); flat shapes with
  that line; loose strokes of light along an edge; patches of strokes.
- `tools/neonize.py`: the cast sheets repainted in the reference's inks per material (skin
  magenta → salmon → orange, white cloth violet → magenta, hair indigo), chosen against each
  material's median tone on a softened light (the sheets are a flat tone plus one shadow; a
  range mapping turned everything orange, a raw one made stubble into speckle), and the
  sheet's line thickened into ink. `ref/neon/`.
- `set/drawn.js`: the sky as brushed bands with stars and the reference's falling bars, the
  city as one drawn panorama laid through the camera, the bay as horizontal strokes under the
  lit columns of the city, the causeway with inked parapets, neon tubes, pools of lamp light
  in two flat tones, shrubs, palms in ink with strokes of light, lamps.
- The car (`props/car.js`) in a drawn mode: each opaque piece posterized to the palette and
  inked; the airbrush's translucent overlays, gradients and soft reflections dropped.
- The whole scene drawn on twos (time held for two frames), bloom kept only for the neon.
- Faults found before showing: a near lane dash drawn as a brush of its near width (a white
  blob: paint on the ground is a flat quad in perspective); every white turned red by the
  nearest-ink match (red only for real reds); gaps between sky bands (each band reaches the
  horizon); strokes of light on a near parapet ballooning (capped). Review: no warnings,
  100 ms a frame warm at 960.
